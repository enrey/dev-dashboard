using Analyzer.Git.Application.Dto;
using Analyzer.Git.Application.Configuration;
using LibGit2Sharp;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Analyzer.Common.Infrastructure;

namespace Analyzer.Git.Application.Services
{
    /// <summary>
    /// Сервис для получения статистики из GIT репозиториев
    /// </summary>
    public class GitStatisticsService : IGitStatisticsService
    {
        private const int MAX_PARALLEL = 1;
        private readonly ILogger _logger;
        private readonly ElasticConfig _statisticsConfig;
        private readonly RepositoriesConfig _repositoriesConfig;
        private readonly IGitlabServiceClient _gitlabServiceClient;

        private readonly object _locker = new object();

        /// <summary>
        /// Сервис для получения статистики из GIT репозиториев
        /// </summary>
        public GitStatisticsService(
            ILogger<GitStatisticsService> logger,
            IOptionsMonitor<ElasticConfig> statisticsConfigMonitor,
            IOptionsMonitor<RepositoriesConfig> repositoriesConfig,
            IGitlabServiceClient gitlabServiceClient
            )
        {
            _logger = logger;
            _statisticsConfig = statisticsConfigMonitor.CurrentValue;
            _repositoriesConfig = repositoriesConfig.CurrentValue;
            _gitlabServiceClient = gitlabServiceClient;
        }

        /// <summary>
        /// Получить статистику по всем репозиториям за период
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <returns></returns>
        public async Task<IEnumerable<PeriodStatisticsDto>> GetAllRepositoriesStatisticsAsync(DateTimeOffset startDate, DateTimeOffset endDate)
        {
            var allRepos = await GetAllRepositoriesParameters(startDate.Date);

            var validRepos = allRepos.Where(ri => Repository.IsValid(ri.RepoPath));

            if (!validRepos.Any())
                throw new Exception("Отсутствуют клонированные репозитории");

            var dates = GetDates(startDate, endDate);
            var result = new List<PeriodStatisticsDto>();

            await Task.Run(() =>
            {
                Parallel.ForEach(validRepos, new ParallelOptions { MaxDegreeOfParallelism = MAX_PARALLEL },
                    ri =>
                    {
                        LogMemoryUsage("before", ri.RepoPath);

                        var repoStatistics = GetStatisticsByDates(ri, dates).ToList();

                        lock (_locker)
                        {
                            result.AddRange(repoStatistics);
                        }

                        LogMemoryUsage("after", ri.RepoPath);
                    });
            });

            var res = result.OrderBy(r => r.RepositoryName).ToList();

            return res;
        }

        private void LogMemoryUsage(string stage, string repoPath)
        {
            using var process = Process.GetCurrentProcess();
            var gcInfo = GC.GetGCMemoryInfo();

            _logger.LogInformation(
                "Memory {Stage} repo \"{RepoPath}\": WorkingSet={WorkingSetMb}MB, Managed={ManagedMb}MB, GCHeap={GCHeapMb}MB, TotalAvailable={TotalAvailableMb}MB",
                stage,
                repoPath,
                process.WorkingSet64 / 1024 / 1024,
                GC.GetTotalMemory(false) / 1024 / 1024,
                gcInfo.HeapSizeBytes / 1024 / 1024,
                gcInfo.TotalAvailableMemoryBytes / 1024 / 1024);
        }

        private void LogDiffMemoryUsage(string stage, string repositoryName, Commit commit, Commit parent)
        {
            using var process = Process.GetCurrentProcess();
            var gcInfo = GC.GetGCMemoryInfo();

            _logger.LogInformation(
                "Memory {Stage} diff repo \"{RepositoryName}\", commit={CommitSha}, parent={ParentSha}, date={CommitDate}, author=\"{Author}\": WorkingSet={WorkingSetMb}MB, Managed={ManagedMb}MB, GCHeap={GCHeapMb}MB",
                stage,
                repositoryName,
                commit.Sha,
                parent.Sha,
                commit.Author.When.LocalDateTime,
                commit.Author.Email,
                process.WorkingSet64 / 1024 / 1024,
                GC.GetTotalMemory(false) / 1024 / 1024,
                gcInfo.HeapSizeBytes / 1024 / 1024);
        }

        /// <summary>
        /// Обновление всех репозиториев
        /// </summary>
        public async Task<UpdateResultDto> UpdateAllRepositories()
        {
            var result = new UpdateResultDto();
            _logger.LogInformation($"Updating repositories started");

            // TODO: Если токена нет то использовать логин/пароль Credentials = new UsernamePasswordCredentials { Username = info.Username, Password = info.Password }
            var defaultCreds = new UsernamePasswordCredentials
            {
                Username = "token",
                Password = _repositoriesConfig.GitlabAuthToken
            };

            var repos = await GetAllRepositories(DateTime.Now.AddMonths(-1));
            var reposInfo = repos
                .Select(info => new
                {
                    RepoUrl = info.Url,
                    RepoPath = @$"{_repositoriesConfig.ReposFolder}/{GenerateRepoNameByWebUI(info.WebUI)}",
                    Credentials = defaultCreds
                }).ToList();

            _logger.LogInformation($"Total repos count: {repos.Count()}");
            result.ReposCount = repos.Count();

            ConcurrentBag<string> toDelete = new ConcurrentBag<string>();

            await Task.Run(() =>
            {
                Parallel.ForEach(reposInfo, new ParallelOptions { MaxDegreeOfParallelism = MAX_PARALLEL }, info =>
                {
                    if (!Repository.IsValid(info.RepoPath))
                        try
                        {
                            CloneRepository(info.RepoUrl, info.RepoPath, info.Credentials);
                            result.UpdateSucceed++;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Clonning error! Repository: \"{info.RepoUrl}\". Message: {ex.Message}");
                            toDelete.Add(info.RepoPath);
                            result.CloneError++;
                        }
                    else
                        try
                        {
                            PullRepository(info.RepoPath, info.Credentials);
                            result.UpdateSucceed++;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Pulling error! Repository: \"{info.RepoPath}\". Message: {ex.Message}");
                            toDelete.Add(info.RepoPath);
                            result.PullError++;
                        }
                });
            });

            _logger.LogInformation($"Updating repositories ended");

            if (toDelete.Any())
            {
                _logger.LogWarning($"Had errors, cleaning breaked folders... In next checkout it should be fine");
                foreach (var repo in toDelete)
                {
                    _logger.LogInformation($"Deleting {repo}...");

                    var directory = new DirectoryInfo(repo) { Attributes = FileAttributes.Normal };
                    foreach (var info in directory.GetFileSystemInfos("*", SearchOption.AllDirectories))
                    {
                        info.Attributes = FileAttributes.Normal;
                    }
                    directory.Delete(true);
                }
                _logger.LogInformation($"Dir cleared. With next update it should be fine...");
                result.Deleted = toDelete.Count();
            }

            return result;
        }

        private void ClearFolder(string folderName)
        {
            DirectoryInfo dir = new DirectoryInfo(folderName);


            foreach (FileInfo fi in dir.GetFiles())
            {
                fi.Delete();
            }

            foreach (DirectoryInfo di in dir.GetDirectories())
            {
                ClearFolder(di.FullName);
                di.Delete();
            }
        }

        void SetAttributesNormal(DirectoryInfo dir)
        {
            foreach (var subDir in dir.GetDirectories())
            {
                SetAttributesNormal(subDir);
            }
            foreach (var file in dir.GetFiles())
            {
                file.Attributes = FileAttributes.Normal;
            }
        }

        /// <summary>
        /// Обновление репозитория
        /// </summary>
        public async Task UpdateRepository(string repoPath)
        {
            // TODO: Если токена нет то использовать логин/пароль Credentials = new UsernamePasswordCredentials { Username = info.Username, Password = info.Password }
            var defaultCreds = new UsernamePasswordCredentials
            {
                Username = "token",
                Password = _repositoriesConfig.GitlabAuthToken
            };

            var allRepos = await GetAllRepositories(DateTime.Now.AddMonths(-1));
            var repo = allRepos
                .Where(rp => rp.Url == HttpUtility.UrlDecode(repoPath))
                .Select(rp => new
                {
                    Name = GenerateRepoNameByWebUI(rp.WebUI),
                    RepoUrl = rp.Url,
                    RepoPath = @$"{_repositoriesConfig.ReposFolder}/{GenerateRepoNameByWebUI(rp.WebUI)}",
                    Credentials = defaultCreds
                })
                .First();

            _logger.LogInformation($"Updating repository {repo.Name} started");

            await Task.Run(() =>
            {

                if (!Repository.IsValid(repo.RepoPath))
                    try
                    {
                        CloneRepository(repo.RepoUrl, repo.RepoPath, repo.Credentials);
                    }
                    catch (Exception ex)
                    {
                        throw new Exception($"Clonning error! Repository: \"{repo.RepoUrl}\". Message: {ex.Message}");
                    }
                else
                    try
                    {
                        PullRepository(repo.RepoPath, repo.Credentials);
                    }
                    catch (Exception ex)
                    {
                        throw new Exception($"Pulling error! Repository: \"{repo.RepoPath}\". Message: {ex.Message}");
                    }
            });

            _logger.LogInformation($"Updating repository {repo.Name} ended");
        }

        /// <summary>
        /// Получить коммиты из репозитория за указанные даты с мерджами или без
        /// </summary>
        private IEnumerable<Commit> GetCommits(Repository repository, IEnumerable<DateTime> dates, bool includeMerges)
        {
            // iterate all branches (git log --all)
            var filter = new CommitFilter { IncludeReachableFrom = repository.Branches };

            var result = repository.Commits.QueryBy(filter)
                .Where(c =>
                    (includeMerges || !includeMerges && c.Parents.Count() == 1) &&
                    dates.Contains(c.Author.When.Date)
                ).ToList();

            return result;
        }

        /// <summary>
        /// Клонировать репозиторий
        /// </summary>
        private void CloneRepository(string repoUrl, string repoPath, UsernamePasswordCredentials credentials)
        {
            if (!Directory.Exists(repoPath))
                Directory.CreateDirectory(repoPath);

            var cloneOptions = new CloneOptions
            {
                IsBare = false                
            };
            cloneOptions.FetchOptions.CredentialsProvider = (_url, _user, _cred) => credentials;

            _logger.LogInformation($"Cloning started: \"{repoUrl}\"");

            Repository.Clone(repoUrl, repoPath, cloneOptions);

            _logger.LogInformation($"Cloning ended: \"{repoUrl}\"");
        }

        /// <summary>
        /// Получить изменения репозитория
        /// </summary>
        private void FetchRepository(string repoPath, UsernamePasswordCredentials credentials)
        {
            try
            {
                using var repo = new Repository(repoPath);

                var fetchOptions = new FetchOptions
                {
                    Prune = true,
                    CredentialsProvider = (_url, _user, _cred) => credentials
                };

                _logger.LogInformation($"Fetching started: \"{repoPath}\"");

                string logMessage = "";
                foreach (var remote in repo.Network.Remotes)
                {
                    var refSpecs = remote.FetchRefSpecs.Select(x => x.Specification);
                    Commands.Fetch(repo, remote.Name, refSpecs, fetchOptions, logMessage);
                }

                _logger.LogInformation($"Fetching ended: \"{repoPath}\". Message: \"{logMessage}\"");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Fetching error! Repository: \"{repoPath}\". Message: {ex.Message}");
            }
        }

        /// <summary>
        /// Pull изменений репозитория
        /// </summary>
        private void PullRepository(string repoPath, UsernamePasswordCredentials credentials)
        {
            using var repo = new Repository(repoPath);

            var pullOptions = new PullOptions
            {
                FetchOptions = new FetchOptions
                {
                    Prune = true,
                    CredentialsProvider = (_url, _user, _cred) => credentials
                }
            };

            var signature = new Signature(
                new Identity(_repositoriesConfig.MergeUserName, _repositoriesConfig.MergeUserEmail),
                DateTimeOffset.Now);

            _logger.LogInformation($"Pulling started: \"{repoPath}\"");

            var pullResult = Commands.Pull(repo, signature, pullOptions);

            _logger.LogInformation($"Pulling ended: \"{repoPath}\"");
        }

        /// <summary>
        /// Разбивка периода посуточно
        /// </summary>
        private IEnumerable<DateTime> GetDates(DateTimeOffset startDate, DateTimeOffset endDate)
        {
            var result = new List<DateTime>();
            var date = startDate.Date;

            while (date <= endDate.Date)
            {
                result.Add(date);
                date = date.AddDays(1);
            }

            return result;
        }

        /// <summary>
        /// Получить посуточную статистику по переданным дням
        /// </summary>
        internal IEnumerable<PeriodStatisticsDto> GetStatisticsByDates(RepositoryParameters pars, IEnumerable<DateTime> dates)
        {
            _logger.LogInformation($"Getting statistics started: \"{pars.RepoPath}\"");

            using var repo = new Repository(pars.RepoPath);

            var commits = GetCommits(repo, dates, false);

            var result = dates.Select(date => GetDayStatistics(repo, pars.Name, pars.WebUI, commits, date)).ToList();

            _logger.LogInformation($"Getting statistics ended: \"{pars.RepoPath}\"");

            return result;
        }

        /// <summary>
        /// Получить статистику за день
        /// </summary>
        private PeriodStatisticsDto GetDayStatistics(Repository repository, string repositoryName, string webUi, IEnumerable<Commit> filteredCommits, DateTime date)
        {
            var dayCommits = filteredCommits.Where(c => c.Author.When.Date == date).ToList();

            var statistics = dayCommits.SelectMany(commit =>
                  commit.Parents.SelectMany(parent =>
                    {
                        LogDiffMemoryUsage("before", repositoryName, commit, parent);
                        using var patch = repository.Diff.Compare<PatchStats>(parent.Tree, commit.Tree);
                        LogDiffMemoryUsage("after", repositoryName, commit, parent);

                        return new[]
                        {
                            new
                            {
                                commit.Id,
                                commit.Author.Name,
                                commit.Author.When.LocalDateTime,
                                commit.Author.Email,
                                commit.Sha,
                                commit.Message,
                                Added = patch.TotalLinesAdded,
                                Deleted = patch.TotalLinesDeleted,
                                Total = patch.TotalLinesAdded + patch.TotalLinesDeleted,
                                ChangedFilesCount = patch.Count()
                            }
                        };
                    }
                    )
               )
              .GroupBy(r => new { r.Id, r.Name, r.LocalDateTime, r.Email, r.Sha, r.Message })
              .Select(c => new CommitStatisticsDto
              {
                  CommitDate = c.Key.LocalDateTime,
                  Name = c.Key.Name,
                  Email = c.Key.Email,
                  Sha = c.Key.Sha,
                  Message = c.Key.Message,
                  Added = c.Sum(g => g.Added),
                  Deleted = c.Sum(g => g.Deleted),
                  Total = c.Sum(g => g.Total),
                  ChangedFilesCount = c.Sum(g => g.ChangedFilesCount)
              })
              .OrderBy(r => r.Name)
              .ToList();

            return new PeriodStatisticsDto
            {
                RepositoryName = repositoryName,
                WebUI = webUi,
                Date = date.ToString("yyyy-MM-dd"),
                Statistics = statistics
            };
        }

        /// <summary>
        /// Сформировать параметры репозиториев из конфигурации
        /// </summary>
        /// <returns></returns>
        private async Task<IEnumerable<RepositoryParameters>> GetAllRepositoriesParameters(DateTime startDate)
        {
            var allRepositories = await GetAllRepositories(startDate);
            return allRepositories
                .Select(ri => new RepositoryParameters
                {
                    Name = GenerateRepoNameByWebUI(ri.WebUI),
                    WebUI = ri.WebUI,
                    RepoPath = @$"{_repositoriesConfig.ReposFolder}/{GenerateRepoNameByWebUI(ri.WebUI)}"
                })
                .ToList();
        }

        /// <summary>
        /// Получить все репозитории из конфигов и из API
        /// </summary>
        /// <returns></returns>
        private async Task<IEnumerable<RepositoryInfoConfig>> GetAllRepositories(DateTime startDate)
        {
            var allRepositories = await _gitlabServiceClient.GetAllReposFromApi(startDate);
            var apiReposUrls = allRepositories.Select(c => c.Url).ToList();

            return allRepositories;
        }

        /// <summary>
        /// Сгенерировать имя репозитория
        /// </summary>
        /// <returns></returns>
        private string GenerateRepoNameByWebUI(string url)
        {
            var arr = url.Split("/");

            if (arr.Length < 2)
                return url;

            return $"{arr[^2]}_{arr[^1]}";
        }
    }
}

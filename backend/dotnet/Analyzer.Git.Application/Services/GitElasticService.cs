using Analyzer.Common.Infrastructure;
using Analyzer.Git.Application.Configuration;
using Analyzer.Git.Application.Dto;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nest;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Analyzer.Git.Application.Services
{
    public class GitElasticService
    {
        private const string INDEX_NAME = "git";
        private const int MAX_ROWS = 10000;

        private readonly ElasticConfig _elasticConfig;
        private readonly IGitStatisticsService _gitStatisticsService;
        private readonly ILogger<GitElasticService> _logger;

        public GitElasticService(IOptionsMonitor<ElasticConfig> elasticConfig, IGitStatisticsService gitStatisticsService, ILogger<GitElasticService> logger)
        {
            _elasticConfig = elasticConfig.CurrentValue;
            _gitStatisticsService = gitStatisticsService;
            _logger = logger;
        }

        public IList<PersonStatisticsResultDto> GetInfo(DateTimeOffset from, DateTimeOffset till)
        {
            IReadOnlyCollection<PersonStatisticsStoreDto> collection = GetCollection(from, till);

            var grouped = collection.GroupBy(o => new { o.RepositoryName, o.WebUI, o.Date, o.Email, o.Name })
                .Select(o => new PersonStatisticsResultDto
                {
                    RepositoryName = o.Key.RepositoryName,
                    WebUI = o.Key.WebUI,
                    Date = o.Key.Date,
                    Email = o.Key.Email.ToLower(),
                    Name = o.Key.Name,
                    CommitsCount = o.Count(),
                    Added = o.Sum(o => o.Added),
                    Deleted = o.Sum(o => o.Deleted),
                    Total = o.Sum(o => o.Total),
                    ChangedFilesCount = o.Sum(o => o.ChangedFilesCount),
                    CommitsArray = o.Select(i => new PersonStatisticsCommitResultDto
                    {
                        CommitDate = i.CommitDate,
                        Message = i.Message,
                        Sha = i.Sha,
                        Added = i.Added,
                        Deleted = i.Deleted,
                        Total = i.Added + i.Deleted,
                        ChangedFilesCount = i.ChangedFilesCount

                    }).ToList()
                }).ToList();

            return grouped;
        }

        private IReadOnlyCollection<PersonStatisticsStoreDto> GetCollection(DateTimeOffset from, DateTimeOffset till)
        {
            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            List<PersonStatisticsStoreDto> results = new List<PersonStatisticsStoreDto>();
            var total = client.Count<PersonStatisticsStoreDto>().Count;

            var scanResults = client.Search<PersonStatisticsStoreDto>(s => s
            .From(0)
            .Size(MAX_ROWS)
            .Query(q => q//.MatchAll())
                .DateRange(r => r
                    .Field(f => f.CommitDate)
                    .GreaterThanOrEquals(from.DateTime)
                    .LessThanOrEquals(till.DateTime)
                )
            )
            .Scroll("5m")
            );

            while (scanResults.Documents.Any())
            {
                results.AddRange(scanResults.Documents);
                scanResults = client.Scroll<PersonStatisticsStoreDto>("10m", scanResults.ScrollId);
            }

            return results;
        }

        public async Task UpdateMonth()
        {
            var dtFrom = DateTimeOffset.Now.AddDays(-30);
            var dtTill = DateTimeOffset.Now;

            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            var result = await _gitStatisticsService.GetAllRepositoriesStatisticsAsync(dtFrom, dtTill);

            var storeDto = result.SelectMany(o => o.Statistics.Select(i => new PersonStatisticsStoreDto
            {
                Date = o.Date,
                RepositoryName = o.RepositoryName,
                WebUI = o.WebUI,
                Email = i.Email,
                Name = i.Name,
                CommitDate = i.CommitDate,
                Message = i.Message,
                Added = i.Added,
                Deleted = i.Deleted,
                Sha = i.Sha,
                Total = i.Total,
                ChangedFilesCount = i.ChangedFilesCount
            }
            )).ToList();

            var response = await client.DeleteByQueryAsync<PersonStatisticsStoreDto>(q => q
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.CommitDate)
                        .GreaterThanOrEquals(dtFrom.Date)
                        .LessThanOrEquals(dtTill.Date)
            )));

            foreach (var a in storeDto.ToList())
            {
                var indexResponse = client.IndexDocument(a);
                if (!indexResponse.IsValid)
                {
                    _logger.LogError("Not valid document :(");
                    _logger.LogError(indexResponse.OriginalException.ToString());
                    _logger.LogError(indexResponse.DebugInformation.ToString());
                }
            }
        }

        public IList<TaksResultDto> GetTasks(DateTimeOffset from, DateTimeOffset till)
        {
            var collection = GetCollection(from, till);

            var r = collection
                .Select(o => new
                {
                    Task = GetTask(o.Message),
                    Item = o
                }
                )
                .GroupBy(o => new { o.Task })
                .Select(o => new TaksResultDto
                {
                    Task = o.Key.Task,
                    Titles = o.Select(a => a.Item).Select(b => b.Message).ToList(),
                    Commits = o.Select(a => a.Item).ToList()
                })
                .ToList();

            return r;
        }

        // TODO: убрать пасту
        private string GetTask(string title)
        {
            var regex = new Regex(@"([a-zA-Z0-9]{2,})-\d+|;", RegexOptions.IgnoreCase);
            var match = regex.Match(title);

            if (match.Success)
            {
                return match.Value.ToUpper();
            }

            return "???";
        }
    }
}

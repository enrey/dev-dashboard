using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using System;
using System.Threading.Tasks;
using Analyzer.Git.Application.Configuration;
using Microsoft.Extensions.Configuration;
using System.IO;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using Analyzer.Git.Application.Services;
using System.Collections.Generic;
using System.Text;
using MathNet.Numerics.Statistics;
using Analyzer.Common.Infrastructure;

namespace Analyzer.Git.IntegrationTests
{
    public class GitStatisticsServiceTests
    {
        IGitStatisticsService _service;
        GitElasticService _gitElasticService;
        LoggerMock _loggerMock;

        [SetUp]
        public void Setup()
        {
            _loggerMock = new LoggerMock();

            var builder = GetConfig();
            var repoConfig = builder.GetService<IOptionsMonitor<RepositoriesConfig>>();
            var statConfig = builder.GetService<IOptionsMonitor<ElasticConfig>>();
            var _gitlabServiceClient = MockGitlabSrvice();

            _service = new GitStatisticsService(_loggerMock, statConfig, repoConfig, _gitlabServiceClient);
            _gitElasticService = new GitElasticService(statConfig, _service, _loggerMock);

        }

        [Test]
        public async Task UpdateAllRepositories_Test()
        {
            //Act
            await _service.UpdateAllRepositories();

            //Assert
            Assert.IsNull(_loggerMock.Error, _loggerMock.Error);
        }

        [Test]
        public void GetElasticItems_Test()
        {
            // Arrange
            var startDate = DateTime.Now.AddMonths(-9);
            var endDate = DateTime.Now;

            var dtos = _gitElasticService.GetInfo(startDate, endDate);
            var result = dtos.Select(e => new
            {
                info = e.CommitsArray.Select(o => new { e.Email, o.CommitDate, o.Added, o.Deleted, o.Total })
            }).SelectMany(a => a.info).OrderBy(o => o.Email).ToList();
            //dtos.SelectMany(a=> new { a.CommitsArray, a.Email }).Select(o=>new { o.CommitDate, o.Added, o.Deleted, o.Total})


            //.Select(o => new TaksDto
            //{
            //    Task = o.Key.Task,
            //    Titles = o.SelectMany(a => a.Titles).ToList(),
            //    Opened = o.SelectMany(a => a.Opened).ToList(),
            //    Merged = o.SelectMany(a => a.Merged).ToList(),
            //    Comments = o.SelectMany(a => a.Comments).ToList(),
            //})
            //                .ToList();

            //Assert


            var sb1 = new StringBuilder();
            sb1.AppendLine("Email,CommitDate,Added,Deleted,Total");
            foreach (var r in result)
            {
                sb1.AppendLine($"{r.Email},{r.CommitDate},{r.Added},{r.Deleted},{r.Total}");
            }
            var csv1 = sb1.ToString();

            var analy = result.GroupBy(o => o.Email).Select(o => new
            {
                Email = o.Key,
                MinDate = o.Min(e => e.CommitDate),
                MaxDate = o.Max(e => e.CommitDate),
                DaysTotal = Convert.ToInt32((o.Max(e => e.CommitDate)  - o.Min(e => e.CommitDate)).TotalDays),
                DaysActive = o.GroupBy(a=>a.CommitDate.Date).Count(),
                MedianAdd = GetMedian(o.Select(i=>i.Added).ToList()),
                MedianDel = GetMedian(o.Select(i => i.Deleted).ToList()),
                MedianTotal = GetMedian(o.Select(i => i.Total).ToList()),
                Percentile95 = Convert.ToInt32(o.Select(i => (double)i.Total).Percentile(90)),
                CommitsCount = o.Count(),
                LinesOfCodeTotal = o.Select(i => i.Total).Sum(),
                LinesOfCodeTotalPercentile95 = o.Select(i => i.Total).Where(k=>k < o.Select(i => (double)i.Total).Percentile(90)).Sum(),
                AvgTotal = Convert.ToInt32(o.Select(i => i.Total).Average() / o.GroupBy(a => a.CommitDate.Date).Count()),
                AvgTotalPercentile = Convert.ToInt32(o.Select(i => i.Total).Where(k => k < o.Select(i => (double)i.Total).Percentile(90)).DefaultIfEmpty(0).Average()),

            })
                .Where(o=>o.Email.ToLower().Contains("@example.com") && o.DaysTotal > 10)
                .OrderBy(i=>i.Email).ToList();


            var sb2 = new StringBuilder();
            sb2.AppendLine("Email,MinDate,MaxDate,DaysTotal,DaysActive,MedianAdd,MedianDel,MedianTotal,Percentile95,CommitsCount,LinesOfCodeTotal,LinesOfCodeTotalPercentile95,AvgTotal,AvgTotalPercentile");
            foreach (var r in analy)
            {
                sb2.AppendLine($"{r.Email},{r.MinDate},{r.MaxDate},{r.DaysTotal},{r.DaysActive},{r.MedianAdd},{r.MedianDel},{r.MedianTotal},{r.Percentile95},{r.CommitsCount},{r.LinesOfCodeTotal},{r.LinesOfCodeTotalPercentile95},{r.AvgTotal},{r.AvgTotalPercentile}");
            }
            var csv2 = sb2.ToString();

            Assert.IsNull(_loggerMock.Error, _loggerMock.Error);
        }

        public static int GetMedian(IList<int> sourceNumbers)
        {
            if (sourceNumbers == null || sourceNumbers.Count == 0)
                throw new Exception("Median of empty array not defined.");

            List<int> sortedPNumbers = sourceNumbers.OrderBy(a => a).ToList();

            int size = sortedPNumbers.Count;
            int mid = size / 2;
            var median = (size % 2 != 0) ? sortedPNumbers[mid] : (sortedPNumbers[mid] + sortedPNumbers[mid - 1]) / 2;
            return median;
        }

        [Test]
        public async Task GetAllRepositoriesStatistics_Test()
        {
            // Arrange
            var startDate = DateTime.Now.AddMonths(-1);
            var endDate = DateTime.Now;

            // Act
            var result = await _service.GetAllRepositoriesStatisticsAsync(startDate, endDate);

            // Assert 
            Assert.IsTrue(result.Count() > 0);
        }

        private ServiceProvider GetConfig()
        {
            var configuration = LoadTestConfiguration();

            var services = new ServiceCollection();
            services.Configure<RepositoriesConfig>(configuration.GetSection("Repositories"));
            services.Configure<ElasticConfig>(configuration.GetSection("ElasticSearch"));
            var builder = services.BuildServiceProvider();

            return builder;
        }

        private IOptionsMonitor<RepositoriesConfig> GetMockConfig()
        {
            var config = new RepositoriesConfig
            {
                ReposFolder = "-",
                MergeUserName = "-",
                MergeUserEmail = "-"
            };
            return Mock.Of<IOptionsMonitor<RepositoriesConfig>>(_ => _.CurrentValue == config);
        }

        private IConfiguration LoadTestConfiguration()
        {
            var path = Directory.GetCurrentDirectory().Substring(0, Directory.GetCurrentDirectory().IndexOf("bin\\"));
            path += "../Analyzer.Git.Web.Api/";

            var config = new ConfigurationBuilder()
                .SetBasePath(path)
                .AddJsonFile("appsettings.Development.json")
                .Build();
            return config;
        }

        private IGitlabServiceClient MockGitlabSrvice()
        {
            Mock<IGitlabServiceClient> _gitlabServiceClient = new Mock<IGitlabServiceClient>();
            _gitlabServiceClient.Setup(gr => gr.GetAllReposFromApi(DateTime.Now.AddMonths(-1)))
                .Returns(Task.FromResult<IEnumerable<RepositoryInfoConfig>>(new List<RepositoryInfoConfig>()
                {
                    new RepositoryInfoConfig()
                    {
                        Url = "https://gitlab.example.com/demo/project.git",
                        WebUI = "https://gitlab.example.com/demo/project"
                    }
                }));

            return _gitlabServiceClient.Object;
        }
    }
}

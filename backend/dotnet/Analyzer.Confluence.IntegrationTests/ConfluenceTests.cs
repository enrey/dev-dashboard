using Analyzer.Common.Infrastructure;
using Analyzer.Confluence.Application.Configuration;
using Analyzer.Confluence.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using NUnit.Framework.Internal;
using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Analyzer.Confluence.IntegrationTests
{
    public class ConfluenceTests
    {
        private LoggerMock _loggerMock;
        private ConfluenceService _confluenceService;

        [SetUp]
        public void Setup()
        {
            _loggerMock = new LoggerMock();
            var config = GetConfig();
            var fetcher = new ConfluenceFetcher(config);
            _confluenceService = new ConfluenceService(fetcher, config, _loggerMock);
        }

        public static string StripHTML(string input)
        {
            return Regex.Replace(input, "<.*?>", String.Empty);
        }


        [Test]
        public async Task TestGetFromConfluence()
        {
            var dtFrom = DateTime.Now.AddDays(-1);
            var dtTill = DateTime.Now;
            var dtos = await _confluenceService.GetInfo(dtFrom, dtTill);

            Assert.IsTrue(dtos.Count() > 0);
        }

        [Test]
        public async Task TestUpdateElastic()
        {
            var config = GetElasticConfig();
            ConflueceElasticService service = new ConflueceElasticService(config, new LoggerMock());
            var dtFrom = DateTime.Now.AddDays(-1);
            var dtTill = DateTime.Now;

            var dtos = await _confluenceService.GetInfo(dtFrom, dtTill);
            await service.Update(dtos, dtFrom, dtTill);
        }

        [Test]
        public async Task TestGetFromElastic()
        {
            var config = GetElasticConfig();
            ConflueceElasticService service = new ConflueceElasticService(config, new LoggerMock());
            var dtFrom = DateTime.Now.AddDays(-1);
            var dtTill = DateTime.Now;

            var result = service.GetConfluenceInfo(dtFrom, dtTill);

            Assert.IsTrue(result.Items.Count() > 0);
        }


        private IOptionsMonitor<ConfluenceConfig> GetConfig()
        {
            var configuration = LoadTestConfiguration();

            var services = new ServiceCollection();
            services.Configure<ConfluenceConfig>(configuration.GetSection("ConfluenceConfig"));
            var builder = services.BuildServiceProvider();

            return builder.GetService<IOptionsMonitor<ConfluenceConfig>>();
        }

        private IOptionsMonitor<ConfluenceConfig> GetMockConfig()
        {
            var config = new ConfluenceConfig
            {
                Host = "-",
                Username = "-",
                Pwd = "-",
            };
            return Mock.Of<IOptionsMonitor<ConfluenceConfig>>(_ => _.CurrentValue == config);
        }

        private IOptionsMonitor<ElasticConfig> GetElasticConfig()
        {
            var config = new ElasticConfig
            {
                ElasticSearchUrl= "http://localhost:9200",
                UpdatePeriodMinutes = 300
            };
            return Mock.Of<IOptionsMonitor<ElasticConfig>>(_ => _.CurrentValue == config);
        }

        private IConfiguration LoadTestConfiguration()
        {
            var path = Directory.GetCurrentDirectory().Substring(0, Directory.GetCurrentDirectory().IndexOf("bin\\"));
            path += "../Analyzer.Confluence.Web.Api/";

            var config = new ConfigurationBuilder()
                .SetBasePath(path)
                .AddJsonFile("appsettings.Development.json")
                .Build();
            return config;
        }
    }
}
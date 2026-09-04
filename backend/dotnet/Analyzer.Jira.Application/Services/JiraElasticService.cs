using Analyzer.Common.Infrastructure;
using Analyzer.Jira.Application.Configuration;
using Analyzer.Jira.Application.Dto;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nest;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Analyzer.Jira.Application.Services
{
    public class JiraElasticService
    {
        private const string INDEX_NAME = "jira";
        private const int MAX_ROWS = 10000;

        private readonly ElasticConfig _elasticConfig;
        private readonly JiraConfig _jiraConfig;

        private readonly ILogger<JiraElasticService> _logger;

        public JiraElasticService(IOptionsMonitor<ElasticConfig> elasticConfig, IOptionsMonitor<JiraConfig> jiraConfig, ILogger<JiraElasticService> logger)
        {
            _elasticConfig = elasticConfig.CurrentValue;
            _jiraConfig = jiraConfig.CurrentValue;

            _logger = logger;
        }

        public IList<JiraInfoDto> GetJiraInfo(DateTimeOffset from, DateTimeOffset till)
        {
            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            var collection = client.Search<ChangeLog>(s => s
                .From(0)
                .Size(MAX_ROWS)
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.Dt)
                        .GreaterThanOrEquals(from.DateTime)
                        .LessThanOrEquals(till.DateTime)
                    )
                )
            ).Documents;

            var result = Map(collection.ToList());

            return result;
        }

        private IList<JiraInfoDto> Map(List<ChangeLog> storedLogs)
        {
            var infos = new List<JiraInfoDto>();

            foreach (var log in storedLogs)
            {
                infos.Add(new JiraInfoDto
                {
                    Date = log.Dt,
                    ChangerEmail = log.Changer.ToLower(),
                    IssueNumber = log.Number,
                    IssueType = log.IssueType,
                    IssueUrl = $"{_jiraConfig.Host}/browse/{log.Number}",
                    IssueName = log.IssueName,
                    Project = log.Project,
                    ChangeType = log.ChangeType,
                    StatusFrom = log.StatusFrom,
                    StatusTo = log.StatusTo
                });
            }

            return infos.Where(o => o.ChangeType == "status" || o.ChangeType == "description").ToList();
        }

        public async Task Update(IList<ChangeLog> jiraLogs, DateTimeOffset startDate, DateTimeOffset endDate)
        {
            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            var response = await client.DeleteByQueryAsync<ChangeLog>(q => q
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.Dt)
                        .GreaterThanOrEquals(startDate.Date)
                        .LessThanOrEquals(endDate.Date)
                        )
                    )
            );

            foreach (var a in jiraLogs)
            {
                var indexResponse = await client.IndexDocumentAsync(a);
                if (!indexResponse.IsValid)
                {
                    _logger.LogError("Not valid document :(");
                    _logger.LogError(indexResponse.OriginalException.ToString());
                    _logger.LogError(indexResponse.DebugInformation.ToString());
                }
            }
        }
    }

}

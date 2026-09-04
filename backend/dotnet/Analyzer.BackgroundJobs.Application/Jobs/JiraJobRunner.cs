using Analyser.BackgroundJobs.Application.Jobs.Metadata;
using Analyser.BackgroundJobs.Application.Services;
using Hangfire;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System;
using System.ComponentModel;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Jobs
{
    public class JiraJobRunner : UpdateJobRunner<JIraJobMetadata>
    {
        private readonly IJiraClient _jira;

        public JiraJobRunner(ILogger<JiraJobRunner> logger, IConnectionMultiplexer redis, IJiraClient jira)
            : base(logger, redis)
        {
            _jira = jira;
        }

        [DisplayName("Jira :: загрузить данные")]
        [DisableConcurrentExecution(86400)]
        public override async Task Execute()
        {
            await Update(Constants.JobNames.Jira, async () => await _jira.RunUpdate());
        }
    }
}

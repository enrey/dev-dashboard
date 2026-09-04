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
    public class ConfluenceJobRunner : UpdateJobRunner<ConfluenceJobMetadata>
    {
        private readonly IConfluenceClient _confluence;

        public ConfluenceJobRunner(ILogger<ConfluenceJobRunner> logger, IConnectionMultiplexer redis, IConfluenceClient confluence)
            : base(logger, redis)
        {
            _confluence = confluence;
        }

        [DisableConcurrentExecution(86400)]
        [DisplayName("Confluence :: загрузить данные")]
        public override async Task Execute()
        {
            await Update(Constants.JobNames.Confluence, async () => await _confluence.RunUpdate());
        }
    }
}

using Analyser.BackgroundJobs.Application.Jobs.Metadata;
using Analyser.BackgroundJobs.Application.Services;
using Hangfire;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.ComponentModel;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Jobs
{
    public class GitJobRunner : UpdateJobRunner<GitJobMetadata>
    {
        private readonly IGitClient _git;

        public GitJobRunner(ILogger<GitJobRunner> logger, IConnectionMultiplexer redis, IGitClient git)
            : base(logger, redis)
        {
            _git = git;
        }

        [DisplayName("Git :: пересчитать параметры")]
        [DisableConcurrentExecution(86400)]
        public override async Task Execute()
        {
            await Update(Constants.JobNames.Git, async () => await _git.RunUpdate());
        }
    }
}

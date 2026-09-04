using Analyser.BackgroundJobs.Application.Jobs.Metadata;
using Analyser.BackgroundJobs.Application.Services;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.ComponentModel;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Jobs
{
    public class GitRepoJobRunner : UpdateJobRunner<GitRepoJobMetadata>
    {
        private readonly IGitClient _git;

        public GitRepoJobRunner(ILogger<GitRepoJobRunner> logger, IConnectionMultiplexer redis, IGitClient git)
            : base(logger, redis)
        {
            _git = git;
        }

        [DisplayName("Git :: обновить репозитории")]
        public override async Task Execute()
        {
            await Update(Constants.JobNames.GitRepos, async () => await _git.RunUpdateRepos());
        }
    }
}

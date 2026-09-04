using Analyser.BackgroundJobs.Application.Jobs.Metadata;
using Analyser.BackgroundJobs.Application.Services;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.ComponentModel;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Jobs
{
    public class GitLabJobRunner : UpdateJobRunner<GitLabJobMetadata>
    {
        private readonly IGitLabClient _gitLab;

        public GitLabJobRunner(ILogger<GitLabJobRunner> logger, IConnectionMultiplexer redis, IGitLabClient gitLab)
            : base(logger, redis)
        {
            _gitLab = gitLab;
        }

        [DisplayName("Gitlab :: загрузить данные")]
        public override async Task Execute()
        {
            await Update(Constants.JobNames.GitLab, async () => await _gitLab.RunUpdate());
        }
    }
}

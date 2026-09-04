using Analyser.BackgroundJobs.Application.Constants;
using System;

namespace Analyser.BackgroundJobs.Application.Jobs.Metadata
{
    public class GitRepoJobMetadata : RecurringJobMetadataBase
    {
        public override string Id => "{3EFA0519-436F-4906-AE5F-8AB3C3791573}";

        public override string Name => JobNames.GitRepos;

        public override Type RunnerType => typeof(GitRepoJobRunner);
    }
}

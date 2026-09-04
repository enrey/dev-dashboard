using Analyser.BackgroundJobs.Application.Constants;
using System;

namespace Analyser.BackgroundJobs.Application.Jobs.Metadata
{
    public class GitLabJobMetadata : RecurringJobMetadataBase
    {
        public override string Id => "{47AD4830-C825-4C8C-8914-FEE8DBB1C2D0}";

        public override string Name => JobNames.GitLab;

        public override Type RunnerType => typeof(GitLabJobRunner);
    }
}

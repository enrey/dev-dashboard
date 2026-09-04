using Analyser.BackgroundJobs.Application.Constants;
using System;

namespace Analyser.BackgroundJobs.Application.Jobs.Metadata
{
    public class GitJobMetadata : RecurringJobMetadataBase
    {
        public override string Id => "{CEC9C329-176D-461F-A60D-577E6D12026D}";

        public override string Name => JobNames.Git;

        public override Type RunnerType => typeof(GitJobRunner);
    }
}

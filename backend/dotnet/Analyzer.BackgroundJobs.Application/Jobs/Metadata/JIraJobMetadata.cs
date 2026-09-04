using Analyser.BackgroundJobs.Application.Constants;
using System;

namespace Analyser.BackgroundJobs.Application.Jobs.Metadata
{
    public class JIraJobMetadata : RecurringJobMetadataBase
    {
        public override string Id => "AED8D9F4-7712-403F-880E-2841845D17F3";

        public override string Name => JobNames.Jira;

        public override Type RunnerType => typeof(JiraJobRunner);
    }
}

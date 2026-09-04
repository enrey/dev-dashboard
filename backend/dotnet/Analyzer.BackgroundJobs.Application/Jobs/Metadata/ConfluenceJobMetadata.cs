using Analyser.BackgroundJobs.Application.Constants;
using System;

namespace Analyser.BackgroundJobs.Application.Jobs.Metadata
{
    public class ConfluenceJobMetadata : RecurringJobMetadataBase
    {
        public override string Id => "4a4cec4d-2891-489a-a4b0-63872c2448f5";

        public override string Name => JobNames.Confluence;

        public override Type RunnerType => typeof(ConfluenceJobRunner);
    }
}

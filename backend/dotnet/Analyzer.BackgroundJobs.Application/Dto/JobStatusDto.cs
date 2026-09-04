using System;

namespace Analyser.BackgroundJobs.Application.Dto
{
    public class JobStatusDto
    {
        public string JobName { get; set; }

        public DateTime LastUpdate { get; set; }

        public bool Success { get; set; }
    }
}

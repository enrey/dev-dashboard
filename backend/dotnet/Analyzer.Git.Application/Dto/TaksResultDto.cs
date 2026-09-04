using Analyzer.Git.Application.Dto;
using System.Collections.Generic;

namespace Analyzer.Git.Application.Dto
{
    public class TaksResultDto
    {
        public string Task { get; set; }

        public List<string> Titles { get; set; }

        public List<PersonStatisticsStoreDto> Commits { get; set; }
    }
}

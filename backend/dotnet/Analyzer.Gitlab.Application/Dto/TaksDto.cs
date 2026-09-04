using System.Collections.Generic;

namespace Analyzer.Gitlab.Application.Dto
{
    public class TaksDto
    {
        public string Task { get; set; }

        public List<string> Titles { get; set; }

        public List<DateAndIdItemStore> Opened { get; set; }

        public List<DateAndIdItemStore> Merged { get; set; }

        public List<DateAndIdItemStore> Comments { get; set; }
    }
}

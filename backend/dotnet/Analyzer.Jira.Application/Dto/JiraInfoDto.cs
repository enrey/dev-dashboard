using System;

namespace Analyzer.Jira.Application.Dto
{

    public class JiraInfoDto
    {
        /// <summary>
        /// Дата события
        /// </summary>
        public DateTime? Date { get; set; }

        public string ChangerEmail { get; set; }

        public string IssueNumber { get; set; }

        public string IssueName { get; set; }

        public string IssueUrl { get; set; }

        public string IssueType { get; set; }

        public string Project { get; set; }

        public string ChangeType { get; set; }

        public string StatusFrom { get; set; }

        public string StatusTo { get; set; }
    }
}

using Nest;
using System;

namespace Analyzer.Jira.Application.Services
{
    public class ChangeLog
    {
        public DateTime Dt { get; }

        public string Number { get; }

        public string StatusFrom { get; }

        public string StatusTo { get; }

        public string AssigneeFrom { get; }

        public string AssigneeTo { get; }

        //        public string DescriptionFrom { get; }
        //        public string DescriptionTo { get; }

        public string Changer { get; }

        public string ChangeType { get; }

        public string IssueName { get; }

        public string Project { get; }

        public string IssueType { get; }


        public ChangeLog(DateTime dt, string number, string changer, string changeType, string statusFrom, string statusTo, string assigneeFrom, string assigneeTo, string project, string issueName, string issueType)
        {
            Dt = dt;
            Number = number;
            Changer = changer;
            ChangeType = changeType;
            StatusFrom = statusFrom;
            StatusTo = statusTo;
            AssigneeFrom = assigneeFrom;
            AssigneeTo = assigneeTo;
            Project = project;
            IssueName = issueName;
            IssueType = issueType;
        }
    }
}
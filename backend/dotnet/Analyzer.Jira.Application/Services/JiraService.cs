using Analyzer.Jira.Application.Dto;
using Atlassian.Jira;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Analyzer.Jira.Application.Services
{

    public class JiraService
    {
        private const int PARALLEL_DEGREE = 10;

        private readonly JiraLoader _jiraLoader;
        private readonly ILogger<JiraService> _logger;

        public JiraService(JiraLoader jiraLoader, ILogger<JiraService> logger)
        {
            _jiraLoader = jiraLoader;
            _logger = logger;
        }

        public async Task<IList<ChangeLog>> GetJiraInfo(DateTimeOffset from, DateTimeOffset till, bool getHistoric = false)
        {
            var issues = await _jiraLoader.GetIssuesDuring(from, till);
            _logger.LogInformation($"Total issues: {issues.Count}");

            var issuesAndLogs = GetLogs(issues).ToList();
            _logger.LogInformation($"Total issues with logs: {issuesAndLogs.Count}");

            var changeLogs = GetLogs(issuesAndLogs);

            //TODO: Кажется надо отфильтровать только те логайтемы которые за нужные даты
            // но если это сделать - если не были старые логи подтянуты то гг
            // а если не делать - то при каждом обновлении дубли по старым записям
            if (!getHistoric)
            {
                var logs = changeLogs.Where(o => o.Dt >= from.Date && o.Dt <= till.Date).ToList();
                return logs;
            }

            return changeLogs;            
        }

        public IList<ChangeLog> GetLogs(IList<IssueAndLogs> issues)
        {
            var infos = new List<JiraInfoDto>();

            var logs = issues.SelectMany(o => o.Logs.Select(k => new ChangeLog(
                dt: k.CreatedDate,
                number: o.Issue.Key.Value,
                changer: k?.Author?.Email?.ToLower(),
                changeType: GetChangeType(k),
                statusFrom: k.Items.FirstOrDefault(i => i.FieldName == "status")?.FromValue,
                statusTo: k.Items.FirstOrDefault(i => i.FieldName == "status")?.ToValue,
                assigneeFrom: k.Items.FirstOrDefault(i => i.FieldName == "assignee")?.FromValue,
                assigneeTo: k.Items.FirstOrDefault(i => i.FieldName == "assignee")?.ToValue,
                project: o.Issue.Project,
                issueName: o.Issue.Summary,
                issueType: o.Issue.Type.Name
                //descriptionFrom: k.Items.FirstOrDefault(i => i.FieldName == "description")?.FromValue,
                //descriptionTo: k.Items.FirstOrDefault(i => i.FieldName == "description")?.ToValue
                )))
                .Where(o => o.Changer != null)
                .ToList();

            return logs;
        }

        private static string GetChangeType(IssueChangeLog k)
        {
            if (k.Items.FirstOrDefault(i => i.FieldName == "status")?.FromValue != null || k.Items.FirstOrDefault(i => i.FieldName == "status")?.ToValue != null) return "status";
            if (k.Items.FirstOrDefault(i => i.FieldName == "description")?.FromValue != null || k.Items.FirstOrDefault(i => i.FieldName == "description")?.ToValue != null) return "description";
            
            return "other";
        }

        public async Task<IList<User>> GetUsers()
        {
            var users = await _jiraLoader.GetAllUsersFromGroup();

            return users;
        }

        private IEnumerable<IssueAndLogs> GetLogs(IList<Issue> issues)
        {
            return issues.AsParallel()
                .WithDegreeOfParallelism(PARALLEL_DEGREE)
                .Select(issue => new IssueAndLogs { Issue = issue, Logs = issue.GetChangeLogsAsync().Result.ToList() })
                .ToList();
        }
    }
}

const env = import.meta.env;

export const environment = {
    production: false,
    baseUrl: env.VITE_BASE_URL ?? "/all-stats",
    jiraApiUrl: env.VITE_JIRA_API_URL ?? "http://localhost:5001/api",
    gitLabApiUrl: env.VITE_GITLAB_API_URL ?? "http://localhost:5003/api",
    gitAnalyzerUrl: env.VITE_GIT_ANALYZER_API_URL ?? "http://localhost:5002/api",
    usersStateApiUrl: env.VITE_USERS_STATE_API_URL ?? "http://localhost:5005/api",
    gilLabUrl: env.VITE_GITLAB_URL ?? "https://gitlab.example.com/api/v4",
    calendarApiUrl: env.VITE_CALENDAR_API_URL ?? "http://localhost:5010",
    disablePresence: env.VITE_DISABLE_PRESENCE === "true",
    disableJiraUsers: env.VITE_DISABLE_JIRA_USERS === "true",
    disableGitlabUsers: env.VITE_DISABLE_GITLAB_USERS === "true",
    jobServerUrl: env.VITE_JOB_SERVER_API_URL ?? "http://localhost:5004/api",
    hangfireDashboardUrl: env.VITE_HANGFIRE_DASHBOARD_URL ?? "http://localhost:5004/hangfire",
    confluenceApiUrl: env.VITE_CONFLUENCE_API_URL ?? "http://localhost:5006/api",
    jiraBrowseUrl: env.VITE_JIRA_BROWSE_URL ?? "https://jira.example.com/browse/",
    confluenceBrowseUrl: env.VITE_CONFLUENCE_BROWSE_URL ?? "https://confluence.example.com",
    GIT_TOKEN: env.VITE_GIT_TOKEN ?? "",
    defaultPeriodInMonths: 1,
};

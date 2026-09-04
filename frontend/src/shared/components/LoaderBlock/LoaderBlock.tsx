import { FC, ReactNode, useContext, useMemo } from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, List, Paper, Typography } from "@mui/material";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { environment } from "environments/environment.prod";
import { JobsStatusApiService } from "shared/api/jobs-status-api.service";
import { ROUTES } from "shared/constants";
import { getManualCacheUsage, useGitTasksData, useTasksStats } from "shared/hooks";

import { JobStatus } from "shared/models";
import { usersPageStorage } from "shared/services";
import { formatCorrectDate } from "shared/utils";

import { LoadableItemBlock } from "./components";
import { DataContext } from "../../../contexts/data/DataContextProvider";
import { FilterContext } from "../../../contexts/filter";
import { LoadingStatus } from "shared/enums";
import { useServiceStatuses } from "shared/hooks";

import { getLastUpdatedProjectInfo } from ".";

interface LoaderBlockProps {
    closeBlock: () => void;
}

interface ServiceGroupProps {
    title: string;
    children: ReactNode;
}

const ServiceGroup: FC<ServiceGroupProps> = ({ title, children }) => (
    <Box sx={{ mt: 1.25 }}>
        <Box sx={{ mb: 0.25 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                {title}
            </Typography>
        </Box>
        <List sx={{ width: "100%", py: 0 }} dense>
            {children}
        </List>
    </Box>
);

const formatNumber = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

const formatDate = (date: Date) =>
    date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

const getDateRangeSummary = (dateValues: Array<string | Date | null | undefined>) => {
    const dates = dateValues
        .map((value) => (value ? new Date(value) : null))
        .filter((date): date is Date => date !== null && !Number.isNaN(date.getTime()))
        .sort((left, right) => left.getTime() - right.getTime());

    if (dates.length === 0) {
        return null;
    }

    return `период: ${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
};

const uniqueCount = <T,>(items: T[]) => new Set(items.filter(Boolean)).size;

const summary = (...items: Array<string | null | false | undefined>) =>
    items.filter((item): item is string => Boolean(item));

const getLoadingStatus = <T,>(query: UseQueryResult<T>): LoadingStatus => {
    if (query.isLoading || query.isFetching) {
        return LoadingStatus.inProgress;
    }
    if (query.isError) {
        return LoadingStatus.error;
    }
    return LoadingStatus.done;
};

export const LoaderBlock: FC<LoaderBlockProps> = ({ closeBlock }) => {
    const location = useLocation();
    const isTasksPage = location.pathname === ROUTES.STATS_WORKFLOW;
    const { filter } = useContext(FilterContext);
    const dateStart = formatCorrectDate(filter.dateStart);
    const dateEnd = formatCorrectDate(filter.dateEnd);

    const jobsStatusQuery = useQuery<JobStatus[]>({
        queryKey: ["gitStatus"],
        queryFn: () => JobsStatusApiService.getStats(),
    });
    const usersListQuery = useQuery({
        queryKey: ["usersPageStateStatus"],
        queryFn: async () => {
            const isFromCache = usersPageStorage.hasCachedState();
            const state = await usersPageStorage.load();

            return { state, isFromCache };
        },
    });
    const gitTasksQuery = useGitTasksData({ dateStart, dateEnd, enabled: isTasksPage });
    const tasksStatsQuery = useTasksStats({ dateStart, dateEnd, enabled: isTasksPage });

    const loadedStatusList = jobsStatusQuery.data;
    const usersListState = usersListQuery.data?.state;
    const {
        gitAnalyzerInfo,
        tasksData,
        jiraUsers: jiraUsersData,
        gitlabData,
        gitlabUsers: gitlabUsersData,
        gitlabMrComments,
        presence,
        confluenceData,
    } = useContext(DataContext);
    const { services, isLoading, isSucceeded } = useServiceStatuses();
    const {
        git,
        gitlab,
        gitlabComments,
        jiraUsers,
        gitlabUsers,
        jira,
        calendar,
        confluence,
    } = services;

    const isPopupLoading =
        isLoading ||
        jobsStatusQuery.isLoading ||
        usersListQuery.isLoading ||
        (isTasksPage && (gitTasksQuery.isLoading || tasksStatsQuery.isLoading));
    const isPopupSucceeded =
        isSucceeded &&
        !jobsStatusQuery.isError &&
        !usersListQuery.isError &&
        (!isTasksPage || (!gitTasksQuery.isError && !tasksStatsQuery.isError));

    const title = useMemo(() => {
        if (isPopupLoading) {
            return "Данные загружаются";
        }
        if (isPopupSucceeded) {
            return "Данные загружены";
        }
        return "Данные загружены с ошибками";
    }, [isPopupLoading, isPopupSucceeded]);

    const jiraLastUpdateInfo =
        loadedStatusList && getLastUpdatedProjectInfo(loadedStatusList, "Jira");

    const gitLastUpdateInfo =
        loadedStatusList && getLastUpdatedProjectInfo(loadedStatusList, "Git");

    const gitReposLastUpdateInfo =
        loadedStatusList && getLastUpdatedProjectInfo(loadedStatusList, "GitRepos");

    const gitlabLastUpdateInfo =
        loadedStatusList && getLastUpdatedProjectInfo(loadedStatusList, "GitLab");

    const cacheUsage = getManualCacheUsage();

    const jobsStatusCount = loadedStatusList?.length ?? 0;
    const jobsStatusSuccessCount = loadedStatusList?.filter((item) => item.success).length ?? 0;
    const jobsStatusFailedCount = jobsStatusCount - jobsStatusSuccessCount;
    const jobsStatusSummary = [
        `статусов: ${formatNumber(jobsStatusCount)}`,
        `успешных: ${formatNumber(jobsStatusSuccessCount)}`,
        <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>
            неуспешных: {formatNumber(jobsStatusFailedCount)}
        </Box>,
    ];

    const usersListSummary = summary(
        `ролей: ${formatNumber(usersListState?.roles.length ?? 0)}`,
        `имён: ${formatNumber(Object.keys(usersListState?.userNames ?? {}).length)}`,
        `назначений ролей: ${formatNumber(Object.keys(usersListState?.userRoles ?? {}).length)}`,
        `связей email: ${formatNumber(Object.keys(usersListState?.linkedEmails ?? {}).length)}`
    );

    const gitCommitDates = gitAnalyzerInfo.flatMap((item) =>
        item.commitsArray.map((commit) => commit.commitDate)
    );
    const gitCommitsCount = gitAnalyzerInfo.reduce(
        (acc, item) => acc + (item.commitsArray.length || item.commitsCount),
        0
    );

    const gitSummary = summary(
        `коммитов: ${formatNumber(gitCommitsCount)}`,
        `репозиториев: ${formatNumber(uniqueCount(gitAnalyzerInfo.map((item) => item.repositoryName)))}`,
        getDateRangeSummary(gitCommitDates)
    );

    const gitTasksList = gitTasksQuery.data ?? [];
    const gitTasksCommits = gitTasksList.flatMap((item) => item.commits);
    const gitTasksSummary = summary(
        `задач: ${formatNumber(gitTasksList.length)}`,
        `коммитов: ${formatNumber(gitTasksCommits.length)}`,
        `репозиториев: ${formatNumber(uniqueCount(gitTasksCommits.map((item) => item.repositoryName)))}`,
        getDateRangeSummary(gitTasksCommits.map((item) => item.commitDate))
    );

    const jiraSummary = summary(
        `изменений: ${formatNumber(tasksData.length)}`,
        `задач: ${formatNumber(uniqueCount(tasksData.map((item) => item.issueNumber)))}`,
        getDateRangeSummary(tasksData.map((item) => item.date))
    );

    const jiraUsersSummary = summary(
        `пользователей: ${formatNumber(jiraUsersData.length)}`,
        `с email: ${formatNumber(jiraUsersData.filter((user) => Boolean(user.email)).length)}`
    );

    const openedMrs = gitlabData.flatMap((item) => item.openedDates);
    const mergedMrs = gitlabData.flatMap((item) => item.mergedDates);
    const allMrs = [...openedMrs, ...mergedMrs];
    const gitlabSummary = summary(
        `MR: ${formatNumber(allMrs.length)}`,
        `opened: ${formatNumber(openedMrs.length)}`,
        `merged: ${formatNumber(mergedMrs.length)}`,
        getDateRangeSummary(allMrs.map((item) => item.dt))
    );

    const gitlabUsersSummary = summary(
        `пользователей: ${formatNumber(gitlabUsersData.length)}`,
        `с email: ${formatNumber(gitlabUsersData.filter((user) => Boolean(user.email)).length)}`
    );

    const gitlabCommentItems = gitlabMrComments.flatMap((item) => item.items);
    const gitlabCommentsSummary = summary(
        `комментариев: ${formatNumber(gitlabCommentItems.length)}`,
        `MR: ${formatNumber(uniqueCount(gitlabCommentItems.map((item) => item.mrId)))}`,
        getDateRangeSummary(gitlabCommentItems.map((item) => item.dt))
    );

    const tasksStats = tasksStatsQuery.data ?? [];
    const taskStatsOpened = tasksStats.flatMap((item) => item.opened);
    const taskStatsMerged = tasksStats.flatMap((item) => item.merged);
    const taskStatsComments = tasksStats.flatMap((item) => item.comments);
    const taskStatsEvents = [...taskStatsOpened, ...taskStatsMerged, ...taskStatsComments];
    const taskStatsSummary = summary(
        `задач: ${formatNumber(tasksStats.length)}`,
        `opened: ${formatNumber(taskStatsOpened.length)}`,
        `merged: ${formatNumber(taskStatsMerged.length)}`,
        `comments: ${formatNumber(taskStatsComments.length)}`,
        getDateRangeSummary(taskStatsEvents.map((item) => item.dt))
    );

    const calendarSummary = summary(
        `записей: ${formatNumber(presence.length)}`,
        `сотрудников: ${formatNumber(uniqueCount(presence.map((item) => item.email)))}`,
        getDateRangeSummary(presence.map((item) => item.date))
    );

    const confluenceSummary = summary(
        `изменений: ${formatNumber(confluenceData.length)}`,
        `страниц: ${formatNumber(uniqueCount(confluenceData.map((item) => item.pageId ?? item.objectId)))}`,
        `churn: ${formatNumber(confluenceData.reduce((acc, item) => acc + item.churn, 0))}`,
        getDateRangeSummary(confluenceData.map((item) => item.date))
    );

    return (
        <Paper elevation={2} sx={{ width: 640, maxHeight: "84vh", overflow: "auto", p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6" component="div">
                    {title}
                </Typography>
                <IconButton onClick={closeBlock} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <ServiceGroup title="Users List">
                <LoadableItemBlock
                    loadingStatus={getLoadingStatus(usersListQuery)}
                    source="Users List"
                    method="GET /users-page/state"
                    withoutDateUpdateBlock
                    summary={usersListSummary}
                    isFromCache={usersListQuery.data?.isFromCache}
                />
            </ServiceGroup>

            <ServiceGroup title="Git Analyzer">
                <LoadableItemBlock
                    loadedResource={gitLastUpdateInfo}
                    source="Commits"
                    method="GET /Git/commits?startDate&endDate"
                    loadingStatus={git}
                    summary={gitSummary}
                />
                {isTasksPage && (
                    <LoadableItemBlock
                        loadingStatus={getLoadingStatus(gitTasksQuery)}
                        source="Git Tasks"
                        method="GET /Git/tasks?startDate&endDate"
                        withoutDateUpdateBlock
                        summary={gitTasksSummary}
                    />
                )}
            </ServiceGroup>

            <ServiceGroup title="Jira">
                <LoadableItemBlock
                    loadedResource={jiraLastUpdateInfo}
                    source="Jira Tasks"
                    method="GET /Jira/tasks?startDate&endDate"
                    loadingStatus={jira}
                    summary={jiraSummary}
                />
                <LoadableItemBlock
                    loadingStatus={jiraUsers}
                    source="Jira Users"
                    method="GET /Jira/users"
                    withoutDateUpdateBlock
                    summary={jiraUsersSummary}
                    isFromCache={cacheUsage.jiraUsers}
                />
            </ServiceGroup>

            <ServiceGroup title="GitLab">
                <LoadableItemBlock
                    loadingStatus={gitlab}
                    loadedResource={gitlabLastUpdateInfo}
                    source="Merge Requests"
                    method="GET /GitLab/merge-requests?startDate&endDate"
                    summary={gitlabSummary}
                />
                <LoadableItemBlock
                    loadingStatus={gitlabUsers}
                    source="GitLab Users"
                    method="GET /GitLab/gitlabUsers"
                    withoutDateUpdateBlock
                    summary={gitlabUsersSummary}
                    isFromCache={cacheUsage.gitlabUsers}
                />
                <LoadableItemBlock
                    loadingStatus={gitlabComments}
                    loadedResource={gitReposLastUpdateInfo}
                    source="MR Comments"
                    method="GET /GitLab/comments?startDate&endDate"
                    summary={gitlabCommentsSummary}
                />
                {isTasksPage && (
                    <LoadableItemBlock
                        loadingStatus={getLoadingStatus(tasksStatsQuery)}
                        source="Task MR Events"
                        method="GET /GitLab/tasks/:dateStart/:dateEnd"
                        withoutDateUpdateBlock
                        summary={taskStatsSummary}
                    />
                )}
            </ServiceGroup>

            <ServiceGroup title="Calendar">
                <LoadableItemBlock
                    loadingStatus={calendar}
                    source="Presence"
                    method="GET /presence?date_from&date_to"
                    withoutDateUpdateBlock
                    summary={calendarSummary}
                />
            </ServiceGroup>

            <ServiceGroup title="Confluence">
                <LoadableItemBlock
                    loadingStatus={confluence}
                    source="Articles"
                    method="GET /Confluence/articles?startDate&endDate"
                    withoutDateUpdateBlock
                    summary={confluenceSummary}
                />
            </ServiceGroup>

            <ServiceGroup title="Jobs Status">
                <LoadableItemBlock
                    loadingStatus={getLoadingStatus(jobsStatusQuery)}
                    source="Jobs List"
                    sourceHref={environment.hangfireDashboardUrl}
                    method="GET /jobs/list"
                    withoutDateUpdateBlock
                    summary={jobsStatusSummary}
                />
            </ServiceGroup>
        </Paper>
    );
};

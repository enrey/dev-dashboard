import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ConfluenceApiService } from "shared/api/confluence-api.service";
import { GitlabApiService } from "shared/api/giltab-api.service";
import { GitInfoService } from "shared/api/git-info-api.service";
import { JiraApiService } from "shared/api/jira-api.service";
import { PresenceApiService } from "shared/api/presence-api.service";
import { mapFieldToLowerCase } from "shared/utils/mapFieldToLowerCase";

import {
    GitAnalyzerInfoModel,
    JiraInfoItem,
    JiraUserInfo,
    GitlabInfo,
    GitlabUserInfo,
    GitlabCommentModel,
    DailyPresence,
    ConfluenceInfo,
    TaskResponseDto,
    TasksStatsResponseDto,
} from "shared/models";

interface DateRangeParams {
    dateStart: string;
    dateEnd: string;
    enabled?: boolean;
}

const manualCacheUsage = {
    gitlabUsers: false,
    jiraUsers: false,
    presenceUsers: false,
};

export const getManualCacheUsage = () => manualCacheUsage;

/**
 * Хук для получения данных Git Analyzer
 */
export const useGitAnalyzerInfo = ({ dateStart, dateEnd, enabled = true }: DateRangeParams): UseQueryResult<GitAnalyzerInfoModel[]> => {
    return useQuery({
        queryKey: ["gitAnalyzerInfo", dateStart, dateEnd],
        queryFn: () => GitInfoService.getGitAnalyzerInfo({ dateStart, dateEnd }),
        enabled,
    });
};

/**
 * Хук для получения задач из Git Analyzer
 */
export const useGitTasksData = ({ dateStart, dateEnd, enabled = true }: DateRangeParams): UseQueryResult<TaskResponseDto[]> => {
    return useQuery({
        queryKey: ["gitTasksData", dateStart, dateEnd],
        queryFn: () => GitInfoService.getTasksFromGitAnalyzer(dateStart, dateEnd),
        enabled,
    });
};

/**
 * Хук для получения статистики Jira
 */
export const useJiraStats = ({ dateStart, dateEnd, enabled = true }: DateRangeParams): UseQueryResult<JiraInfoItem[]> => {
    return useQuery({
        queryKey: ["jiraStats", dateStart, dateEnd],
        queryFn: async () => {
            const result = await JiraApiService.getStats({ dateStart, dateEnd });
            return mapFieldToLowerCase(result, "changerEmail") as JiraInfoItem[];
        },
        enabled,
    });
};

/**
 * Хук для получения пользователей Jira (с кешированием в sessionStorage)
 */
export const useJiraUsers = (enabled = true): UseQueryResult<JiraUserInfo[]> => {
    return useQuery({
        queryKey: ["jiraUsers"],
        queryFn: async () => {
            const sessionData = sessionStorage.getItem("jiraUsers");
            manualCacheUsage.jiraUsers = Boolean(sessionData);
            const result = sessionData
                ? JSON.parse(sessionData)
                : await JiraApiService.getUsers();

            if (!sessionData) {
                sessionStorage.setItem("jiraUsers", JSON.stringify(result));
            }

            return mapFieldToLowerCase(result, "email") as JiraUserInfo[];
        },
        enabled,
        staleTime: Infinity, // Данные не устаревают, т.к. кешируются в sessionStorage
    });
};

/**
 * Хук для получения статистики GitLab
 */
export const useGitlabStats = ({ dateStart, dateEnd, enabled = true }: DateRangeParams): UseQueryResult<GitlabInfo[]> => {
    return useQuery({
        queryKey: ["gitlabStats", dateStart, dateEnd],
        queryFn: async () => {
            const result = await GitlabApiService.getStats(dateStart, dateEnd);
            return mapFieldToLowerCase(result, "email") as GitlabInfo[];
        },
        enabled,
    });
};

/**
 * Хук для получения пользователей GitLab (с кешированием в sessionStorage)
 */
export const useGitlabUsers = (enabled = true): UseQueryResult<GitlabUserInfo[]> => {
    return useQuery({
        queryKey: ["gitlabUsers"],
        queryFn: async () => {
            const sessionData = sessionStorage.getItem("getGitLabUsers");
            manualCacheUsage.gitlabUsers = Boolean(sessionData);
            const result = sessionData
                ? JSON.parse(sessionData)
                : await GitlabApiService.getUsers();

            if (!sessionData) {
                sessionStorage.setItem("getGitLabUsers", JSON.stringify(result));
            }

            return result;
        },
        enabled,
        staleTime: Infinity,
    });
};

/**
 * Хук для получения комментариев в MR GitLab
 */
export const useGitlabMrComments = ({ dateStart, dateEnd, enabled = true }: DateRangeParams): UseQueryResult<GitlabCommentModel[]> => {
    return useQuery({
        queryKey: ["gitlabMrComments", dateStart, dateEnd],
        queryFn: async () => {
            const result = await GitlabApiService.getMergeRequestsComments(dateStart, dateEnd);
            return mapFieldToLowerCase(result, "email") as GitlabCommentModel[];
        },
        enabled,
    });
};

/**
 * Хук для получения статистики присутствия
 */
export const usePresenceStats = ({ dateStart, dateEnd, enabled = true }: DateRangeParams): UseQueryResult<DailyPresence[]> => {
    return useQuery({
        queryKey: ["presenceStats", dateStart, dateEnd],
        queryFn: () => PresenceApiService.getStats({ dateStart, dateEnd }),
        enabled,
    });
};

/**
 * Хук для получения пользователей из календаря (с кешированием в sessionStorage)
 */
export const usePresenceUsers = (enabled = true): UseQueryResult<any[]> => {
    return useQuery({
        queryKey: ["presenceUsers"],
        queryFn: async () => {
            const sessionData = sessionStorage.getItem("presenceUsers");
            manualCacheUsage.presenceUsers = Boolean(sessionData);
            const result = sessionData
                ? JSON.parse(sessionData)
                : await PresenceApiService.getUsers();

            if (!sessionData) {
                sessionStorage.setItem("presenceUsers", JSON.stringify(result));
            }

            return result;
        },
        enabled,
        staleTime: Infinity,
    });
};

/**
 * Хук для получения статистики Confluence
 */
export const useConfluenceStats = ({ dateStart, dateEnd, enabled = true }: DateRangeParams): UseQueryResult<ConfluenceInfo[]> => {
    return useQuery({
        queryKey: ["confluenceStats", dateStart, dateEnd],
        queryFn: () => ConfluenceApiService.getStats(dateStart, dateEnd),
        enabled,
    });
};

/**
 * Хук для получения статистики по задачам (commits comments)
 */
export const useTasksStats = ({ dateStart, dateEnd, enabled = true }: DateRangeParams): UseQueryResult<TasksStatsResponseDto[]> => {
    return useQuery({
        queryKey: ["tasksStats", dateStart, dateEnd],
        queryFn: () => GitlabApiService.getCommitsComments(dateStart, dateEnd),
        enabled,
    });
};

/**
 * Хук для получения всех данных сразу
 * Возвращает объект со всеми запросами и общим статусом загрузки
 */
export const useAllStats = ({ dateStart, dateEnd, enabled = true }: DateRangeParams) => {
    const gitAnalyzerInfo = useGitAnalyzerInfo({ dateStart, dateEnd, enabled });
    const gitTasksData = useGitTasksData({ dateStart, dateEnd, enabled });
    const jiraStats = useJiraStats({ dateStart, dateEnd, enabled });
    const jiraUsers = useJiraUsers(enabled);
    const gitlabStats = useGitlabStats({ dateStart, dateEnd, enabled });
    const gitlabUsers = useGitlabUsers(enabled);
    const gitlabMrComments = useGitlabMrComments({ dateStart, dateEnd, enabled });
    const presenceStats = usePresenceStats({ dateStart, dateEnd, enabled });
    const presenceUsers = usePresenceUsers(enabled);
    const confluenceStats = useConfluenceStats({ dateStart, dateEnd, enabled });
    const tasksStats = useTasksStats({ dateStart, dateEnd, enabled });

    const queries = [
        gitAnalyzerInfo,
        gitTasksData,
        jiraStats,
        jiraUsers,
        gitlabStats,
        gitlabUsers,
        gitlabMrComments,
        presenceStats,
        presenceUsers,
        confluenceStats,
        tasksStats,
    ];

    const isLoading = queries.some(q => q.isLoading);
    const isError = queries.some(q => q.isError);
    const isSuccess = queries.every(q => q.isSuccess);

    return {
        gitAnalyzerInfo,
        gitTasksData,
        jiraStats,
        jiraUsers,
        gitlabStats,
        gitlabUsers,
        gitlabMrComments,
        presenceStats,
        presenceUsers,
        confluenceStats,
        tasksStats,
        isLoading,
        isError,
        isSuccess,
    };
};





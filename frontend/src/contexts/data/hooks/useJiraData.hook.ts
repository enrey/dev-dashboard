import { useContext } from "react";

import { useJiraStats, useJiraUsers, useTasksStats } from "shared/hooks";
import { JiraInfoItem, JiraUserInfo, TasksStatsResponseDto } from "shared/models";
import { formatCorrectDate } from "shared/utils";

import { FilterContext } from "../../filter";

export interface UseJiraDataReturn {
    tasksData: JiraInfoItem[];
    jiraUsers: JiraUserInfo[];
    tasksStats: TasksStatsResponseDto[];
}

interface UseJiraDataOptions {
    includeTaskData?: boolean;
}

/**
 * Хук для получения Jira данных
 */
export const useJiraData = (options: UseJiraDataOptions = {}): UseJiraDataReturn => {
    const { includeTaskData = false } = options;
    const { filter } = useContext(FilterContext);

    const dateStart = formatCorrectDate(filter.dateStart);
    const dateEnd = formatCorrectDate(filter.dateEnd);

    // Запросы через React Query
    const { data: tasksData = [] } = useJiraStats({ dateStart, dateEnd });
    const { data: jiraUsers = [] } = useJiraUsers();
    const { data: tasksStats = [] } = useTasksStats({
        dateStart,
        dateEnd,
        enabled: includeTaskData,
    });

    return {
        tasksData,
        jiraUsers,
        tasksStats,
    };
};



import { PropsWithChildren } from "react";

import {    
    DailyPresence,
    GitlabCommentModel,
    GitlabInfo,
    GitlabUserInfo,
    JiraInfoItem,
    JiraUserInfo,
    GitAnalyzerInfoModel,
    GitAnalyzerChartData,
    ChartUser,
    TaskResponseDto,
    TasksStatsResponseDto,
    ConfluenceInfo,
    PresenceUser,
} from "shared/models";

import { FilterData } from "../../shared/components";

export interface DataContextProviderProps {
    children: PropsWithChildren<any>;
}

export interface InitialDataContext {
    gitAnalyzerInfo: GitAnalyzerInfoModel[];
    tasksData: JiraInfoItem[];
    jiraUsers: JiraUserInfo[];
    gitlabData: GitlabInfo[];
    gitlabUsers: GitlabUserInfo[];
    presenceUsers: PresenceUser[];
    gitlabMrComments: GitlabCommentModel[];
    presence: DailyPresence[];
    gitTasksList: TaskResponseDto[];
    tasksStats: TasksStatsResponseDto[];
    confluenceData: ConfluenceInfo[];
}

export interface DataContextSelectors {
    gitInfo: GitAnalyzerInfoModel[];
    users: ChartUser[];
    dataSource: GitAnalyzerChartData[];
    filteredDataSource: (value: FilterData) => GitAnalyzerChartData[];
    projects: string[];
}

export type DataContextData = InitialDataContext &
    DataContextSelectors;

// Типы для доменных хуков
export interface UseUsersDataReturn {
    users: ChartUser[];
    jiraUsers: JiraUserInfo[];
}

export interface UseGitDataReturn {
    gitAnalyzerInfo: GitAnalyzerInfoModel[];
    gitTasksList: TaskResponseDto[];
    gitInfo: GitAnalyzerInfoModel[];
    projects: string[];
}

export interface UseJiraDataReturn {
    tasksData: JiraInfoItem[];
    jiraUsers: JiraUserInfo[];
    tasksStats: TasksStatsResponseDto[];
}

export interface UseGitlabDataReturn {
    gitlabData: GitlabInfo[];
    gitlabUsers: GitlabUserInfo[];
    gitlabMrComments: GitlabCommentModel[];
}

export interface UseConfluenceDataReturn {
    confluenceData: ConfluenceInfo[];
}

export interface UsePresenceDataReturn {
    presence: DailyPresence[];
    presenceUsers: PresenceUser[];
}

export interface UseAggregatedDataReturn {
    dataSource: GitAnalyzerChartData[];
    filteredDataSource: (filterParams: FilterData) => GitAnalyzerChartData[];
}

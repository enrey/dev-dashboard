import { DatasourceStatusEnum } from "shared/enums";
import {
    ChartUser,
    ConfluenceInfo,
    DailyPresence,
    GitlabCommentModel,
    GitlabInfo,
    JiraInfoItem,
} from "shared/models";

import { GitAnalyzerFlatData } from "./GitAnalyzerFlatData.model";

export interface GitAnalyzerChartData {
    user: ChartUser;
    login: string;
    gitStatistics: GitAnalyzerFlatData[];
    totalCommits: number;
    totalAdded: number;
    totalDeleted: number;
    totalChurn: number;
    totalChangedFiles: number;
    churn: { date: string; churn: number }[];
    totalProjects: string[];
    allIssues: number;
    bugsIssues: number;
    mrOpened: number;
    mrMerged: number;
    gitlabStatistics?: GitlabInfo;
    totalComments: number;
    gitlabCommentsStatistics: GitlabCommentModel;
    totalDailyMessages: number;
    dataSources: DatasourceStatusEnum[];
    gitUrl: string;
    jiraUrl: string;
    tasks: JiraInfoItem[];
    presence: DailyPresence[];
    confluence: ConfluenceInfo[];
    totalConfluenceChurn: number;
    totalUniqConfluence: number;
}

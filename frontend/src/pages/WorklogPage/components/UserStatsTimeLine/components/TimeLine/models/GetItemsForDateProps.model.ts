import {
    ConfluenceInfo,
    GitAnalyzerFlatData,
    GitlabCommentItem,
    GitlabInfo,
    JiraInfoItem,
} from "shared/models";

export interface GetItemsForDateProps {
    date: Date;
    tasks: JiraInfoItem[];
    gitlabStatistics?: GitlabInfo;
    gitlabComments: GitlabCommentItem[];
    gitStatistics: GitAnalyzerFlatData[];
    confluence: ConfluenceInfo[];
}

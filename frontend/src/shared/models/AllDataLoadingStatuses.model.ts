import { SourceLoadStatus } from "../enums";

export interface AllDataLoadingStatuses {
    isGitLoading: SourceLoadStatus;
    isJiraLoading: SourceLoadStatus;
    isGitlabLoading: SourceLoadStatus;
    isGitlabCommentsLoading: SourceLoadStatus;
    isMMCommentsLoading: SourceLoadStatus;
    isCalendarLoading: SourceLoadStatus;
}

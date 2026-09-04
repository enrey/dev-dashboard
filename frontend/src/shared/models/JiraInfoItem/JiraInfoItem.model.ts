import { TaskType, TaskChangeType } from "shared/enums";

export interface JiraInfoItem {
    changerEmail: string;
    date: string;
    issueName: string;
    issueNumber: string;
    issueUrl: string;
    project: string;
    statusFrom: string | null;
    statusTo: string | null;
    issueType: TaskType;
    changeType: TaskChangeType;
}

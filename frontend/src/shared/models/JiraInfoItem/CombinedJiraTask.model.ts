import { TaskType } from "shared/enums";

export interface CombinedJiraTask {
    issueNumber: string;
    issueUrl: string;
    status: { statusFrom: string; statusTo: string }[];
    issueType: TaskType;
}

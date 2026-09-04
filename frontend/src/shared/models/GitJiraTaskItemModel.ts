import { MainTaskStatus, TaskType } from "shared/enums";

import { ConvertedGitTaskModel } from "./ConvertedGitTask.model";

import { Contributor } from ".";

export interface GitJiraTaskItem extends ConvertedGitTaskModel {
    url: string;
    assignee: string;
    assigneeEmail: string;
    assigneeCurrent: string;
    contributors: Contributor[];
    dateAnalysis: string;
    dateApprove: string;
    dateClosed: string;
    dateCreated: string;
    dateEndDev: string;
    dateStartDev: string;
    daysBeforeTestDate: string;
    type: TaskType;
    taskName: string;
    project: string;
    status: MainTaskStatus;
}

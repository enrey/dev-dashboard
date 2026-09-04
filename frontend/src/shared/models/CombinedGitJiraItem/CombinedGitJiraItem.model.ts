import { MainTaskStatus, TaskType } from "shared/enums";

import { ContributorPresence } from "../Contributor";
import { Contributor, PersonStaticsStoreDto } from "../index";

export interface CombinedGitJiraItem {
    added: number;
    assignee: string;
    assigneeCurrent: string;
    assigneeEmail: string;
    commits: PersonStaticsStoreDto[];
    contributors: ContributorPresence[];
    dateAnalysis: string;
    dateApprove: string;
    dateClosed: string;
    dateCreated: string;
    dateEndDev: string;
    dateStartDev: string;
    daysBeforeTestDate: string;
    deleted: number;
    project: string;
    status: MainTaskStatus;
    task: string;
    taskName: string;
    titles: string[];
    totalChanges: number;
    firstContributor: Contributor;
    firstContributorName: string;
    totalCommits: number;
    type: TaskType;
    url: string;
    webRepository: string;
}

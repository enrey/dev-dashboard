import { ExtendedTaskWithContributor } from "./ExtendedTaskWithContributor.model";
import { GitTaskAndJira } from "./GitTaskAndJira.model";
import { InitialTask } from "./InitialTask.model";
import { TaskWithCommentatorsAndContributorEmailModel } from "./TaskWithCommentatorsAndContributorEmail.model";
import { TaskWithExtendedCommitsAndCommentaries } from "./TaskWithExtendedCommitsAndCommentaries.model";
import { TaskWithExtendedMrs } from "./TaskWithExtendedMrs.model";
import { TaskWithMrAndJiraDataModel } from "./TaskWithMrAndJiraData.model";

export type CommonTaskType =
    | InitialTask
    | ExtendedTaskWithContributor
    | GitTaskAndJira
    | TaskWithCommentatorsAndContributorEmailModel
    | TaskWithExtendedCommitsAndCommentaries
    | TaskWithExtendedMrs
    | TaskWithMrAndJiraDataModel;

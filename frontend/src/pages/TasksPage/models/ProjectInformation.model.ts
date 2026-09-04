import { CommonTaskType } from "./CommonTaskType.model";

export interface ProjectInformationModel {
    projectTaskList: CommonTaskType[];
    totalTasks: number;
    bugsQuantity: number;
    featuresQuantity: number;
    subtasksQuantity: number;
    projectName: string;
    unidentifiedTasks: number;
}

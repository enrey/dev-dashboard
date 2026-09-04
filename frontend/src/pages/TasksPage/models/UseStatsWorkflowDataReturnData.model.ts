import { CommonTaskType } from "./CommonTaskType.model";
import { FilterStatsModel } from "./FilterStats.model";
import { ProjectInformationModel } from "./ProjectInformation.model";
import { UnknownTaskModel } from "./UnknownTask.model";

export interface UseStatsWorkflowDataReturnDataModel {
    allFilterStats: FilterStatsModel;
    displayUnknownTasksConditions: boolean;
    projectsInformation: ProjectInformationModel[];
    tasksList: CommonTaskType[];
    totalItem: number;
    unknownTasks: UnknownTaskModel[];
}

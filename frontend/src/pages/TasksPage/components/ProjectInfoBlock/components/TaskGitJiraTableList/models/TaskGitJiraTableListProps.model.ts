import { UseStatsWorkflowDataReturnDataModel } from "pages/TasksPage/models";

export type TaskGitJiraTableListProps = Pick<
    UseStatsWorkflowDataReturnDataModel,
    "tasksList" | "displayUnknownTasksConditions" | "unknownTasks" | "totalItem"
>;

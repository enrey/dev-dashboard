import { UseStatsWorkflowDataReturnDataModel } from "pages/TasksPage/models";

export type ProjectInfoBlockProps = Omit<
    UseStatsWorkflowDataReturnDataModel,
    "allFilterStats"
>;

import { UseStatsWorkflowDataReturnDataModel } from "pages/TasksPage/models";

export type HeaderWithFastProjectFilterProps = Pick<
    UseStatsWorkflowDataReturnDataModel,
    "allFilterStats" | "projectsInformation"
>;

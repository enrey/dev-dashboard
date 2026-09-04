import { FullContributorModel } from "shared/models";

import { TaskWithMrAndJiraDataModel } from "./TaskWithMrAndJiraData.model";

export interface ExtendedTaskWithContributor extends TaskWithMrAndJiraDataModel {
    firstContributor: FullContributorModel;
}

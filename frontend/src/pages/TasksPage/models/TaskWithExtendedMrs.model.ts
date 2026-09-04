import { ItemWithContributor } from "shared/models";

import { TaskWithCommentatorsAndContributorEmailModel } from "./TaskWithCommentatorsAndContributorEmail.model";

export interface TaskWithExtendedMrs
    extends TaskWithCommentatorsAndContributorEmailModel {
    opened: ItemWithContributor[];
    merged: ItemWithContributor[];
}

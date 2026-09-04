import { ItemWithContributor, PersonStaticsStoreDtoWithName } from "shared/models";

import { TaskWithCommentatorsAndContributorEmailModel } from "./TaskWithCommentatorsAndContributorEmail.model";

export interface TaskWithExtendedCommitsAndCommentaries
    extends TaskWithCommentatorsAndContributorEmailModel {
    commits: PersonStaticsStoreDtoWithName[];
    comments: ItemWithContributor[];
}

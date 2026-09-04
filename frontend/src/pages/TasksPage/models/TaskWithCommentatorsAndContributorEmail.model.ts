import { FullContributorModel, GitlabInfoDate } from "shared/models";

import { ExtendedTaskWithContributor } from "./ExtendedTaskWithContributor.model";

export interface TaskWithCommentatorsAndContributorEmailModel
    extends ExtendedTaskWithContributor {
    commentators: FullContributorModel[];
    contributorsEmails: string[];
    closeMr: GitlabInfoDate | null;
    openMr: GitlabInfoDate | null;
}

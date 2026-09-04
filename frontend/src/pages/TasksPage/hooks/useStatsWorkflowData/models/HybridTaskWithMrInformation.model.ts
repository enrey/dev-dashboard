import { FullContributorModel, GitlabInfoDate } from "shared/models";

import { CombinedHybridWithTaskInfo } from "./CombinedHybridWithTaskInfo.model";

export interface HybridTaskWithMrInformation extends CombinedHybridWithTaskInfo {
    openMr: GitlabInfoDate | null;
    closeMr: GitlabInfoDate | null;
    commentators: FullContributorModel[];
}

import { HybridGitAndJiraModel } from "./HybridGitAndJira.model";
import { NormalizedGitTasksListModel } from "./NormalizedGitTasksList.model";

export type CombinedHybridWithTaskInfo = HybridGitAndJiraModel &
    Partial<NormalizedGitTasksListModel>;

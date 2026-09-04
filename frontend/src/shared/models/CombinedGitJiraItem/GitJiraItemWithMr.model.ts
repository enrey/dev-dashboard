import { CombinedGitJiraItem } from "./CombinedGitJiraItem.model";
import { GitlabInfoDate } from "../GitlabInfo";

export interface GitJiraItemWithMr extends CombinedGitJiraItem {
    openMr: GitlabInfoDate | null;
    closeMr: GitlabInfoDate | null;
}

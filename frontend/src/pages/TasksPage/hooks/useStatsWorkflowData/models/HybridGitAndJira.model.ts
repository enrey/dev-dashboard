import { JiraInfoItem } from "shared/models";

import { PreparedGitTaskModel } from "./PreparedGitTask.model";

export type HybridGitAndJiraModel = PreparedGitTaskModel & Partial<JiraInfoItem>;

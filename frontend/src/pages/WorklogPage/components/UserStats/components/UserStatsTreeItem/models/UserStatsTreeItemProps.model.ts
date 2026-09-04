import { CombinedJiraTask } from "shared/models";

export interface UserStatsTreeItemProps {
    title: string;
    treeArray: CombinedJiraTask[];
    idItem: string;
}

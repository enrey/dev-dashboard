import { JiraInfoItem } from "shared/models";

export interface JiraInfoWithHistory extends JiraInfoItem {
    history?: JiraInfoItem[];
}

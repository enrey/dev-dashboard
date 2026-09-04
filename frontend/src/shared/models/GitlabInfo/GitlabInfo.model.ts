import { GitlabInfoDate } from "./GitlabInfoDate.model";

export interface GitlabInfo {
    email: string;
    mergedDates: GitlabInfoDate[];
    mergedTotal: number;
    openedDates: GitlabInfoDate[];
    openedTotal: number;
    username: string;
}

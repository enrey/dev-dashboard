import { DateAndIdItemStore } from "./DateAndIdItemStore.model";

export interface TasksStatsResponseDto {
    task: string;
    titles: string[];
    mrId: 0;
    projectId: 0;
    opened: DateAndIdItemStore[];
    merged: DateAndIdItemStore[];
    comments: DateAndIdItemStore[];
}

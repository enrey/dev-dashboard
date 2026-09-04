import { TaskWithExtendedMrs } from "pages/TasksPage/models";

export interface GitJiraTableRowProps {
    task: TaskWithExtendedMrs;
    periodBetweenStarAndEndDaysList: Date[];
}

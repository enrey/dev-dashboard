import { TaskWithExtendedMrs } from "pages/TasksPage/models";

export interface CloseMrCellProps {
    date: Date;
    task: TaskWithExtendedMrs;
    onHover: boolean;
}

import { TaskWithExtendedMrs } from "pages/TasksPage/models";

export interface OpenMrCellProps {
    date: Date;
    task: TaskWithExtendedMrs;
    onHover: boolean;
}

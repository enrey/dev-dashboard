import { TaskWithExtendedMrs } from "pages/TasksPage/models";

export interface CommentsCellProps {
    date: Date;
    task: TaskWithExtendedMrs;
    onHover: boolean;
}

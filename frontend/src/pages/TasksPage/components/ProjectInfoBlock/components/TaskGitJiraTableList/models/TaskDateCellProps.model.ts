import { TaskWithExtendedMrs } from "pages/TasksPage/models";

import { DateAndIdItemStore, PersonStaticsWithItemSize } from "shared/models";

export interface TaskDateCellProps {
    date: Date;
    task: TaskWithExtendedMrs;
    crossedDayAndCommitDate: PersonStaticsWithItemSize[];
    taskCommitsArrayWithItemSize: PersonStaticsWithItemSize[];
    onHover: boolean;
}

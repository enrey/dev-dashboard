import { TaskWithExtendedMrs } from "pages/TasksPage/models";

import { PersonStaticsWithItemSize, UnknownCommitModel } from "shared/models";


export interface UnknownTaskDateCellProps {
    date: Date;
    crossedDayAndCommitDate: PersonStaticsWithItemSize[];
    taskCommitsArrayWithItemSize: PersonStaticsWithItemSize[];
    onHover: boolean;
    task: UnknownCommitModel | TaskWithExtendedMrs;
}

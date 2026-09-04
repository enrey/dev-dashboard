import { PersonStaticsWithItemSize, UnknownCommitModel } from "shared/models";

import { TaskWithExtendedMrs } from "../../../../../models";
import { TaskTableEntityEnum } from "./TaskTableEntity.enum";

export interface DateCellProps {
    date: Date;
    isDayWeekend: boolean;
    crossedDayAndCommitDate: PersonStaticsWithItemSize[];
    task: UnknownCommitModel | TaskWithExtendedMrs;
    taskCommitsArrayWithItemSize: PersonStaticsWithItemSize[];
    entity: TaskTableEntityEnum;
}

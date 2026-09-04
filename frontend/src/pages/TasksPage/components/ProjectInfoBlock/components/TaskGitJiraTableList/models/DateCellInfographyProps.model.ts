import { UnknownCommitModel } from "shared/models";

import { TaskWithExtendedMrs } from "../../../../../models";
import { TaskTableEntityEnum } from "./TaskTableEntity.enum";

export interface DateCellInfographyProps {
    periodBetweenStarAndEndDaysList: Date[];
    task: UnknownCommitModel | TaskWithExtendedMrs;
    entity: TaskTableEntityEnum;
}

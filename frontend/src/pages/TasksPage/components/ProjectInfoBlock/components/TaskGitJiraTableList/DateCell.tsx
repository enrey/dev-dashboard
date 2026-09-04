import React, { FC, useState } from "react";

import { ContributorPresence, TableCellForDate } from "shared/components";

import { TaskDateCell } from "./TaskDateCell";
import { UnknownTaskDateCell } from "./UnknownTaskDateCell";
import { DateCellProps, TaskTableEntityEnum } from "./models";
import { TaskWithExtendedMrs } from "../../../../models";

export const DateCell: FC<DateCellProps> = (props) => {
    const {
        date,
        isDayWeekend,
        task,
        entity,
        crossedDayAndCommitDate,
        taskCommitsArrayWithItemSize,
    } = props;
    const [onHover, setOnHover] = useState(false);

    return (
        <TableCellForDate isDayWeekend={isDayWeekend} setOnHover={setOnHover}>
            <ContributorPresence contributors={task.contributors} iterateDate={date} />
            {entity === TaskTableEntityEnum.TASK ? (
                <TaskDateCell
                    crossedDayAndCommitDate={crossedDayAndCommitDate}
                    date={date}
                    onHover={onHover}
                    taskCommitsArrayWithItemSize={taskCommitsArrayWithItemSize}
                    task={task as TaskWithExtendedMrs}
                />
            ) : (
                <UnknownTaskDateCell
                    crossedDayAndCommitDate={crossedDayAndCommitDate}
                    date={date}
                    onHover={onHover}
                    taskCommitsArrayWithItemSize={taskCommitsArrayWithItemSize}
                    task={task}
                />
            )}
        </TableCellForDate>
    );
};

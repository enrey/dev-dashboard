import { FC } from "react";

import { isSameDay, isWeekend } from "date-fns";

import { PersonStaticsStoreDto } from "shared/models";
import { getItemSizeByCommitChanges } from "shared/utils";

import { DateCell } from "./DateCell";
import { DateCellInfographyProps } from "./models";

import "./DateCellInfography.scss";

export const DateCellInfography: FC<DateCellInfographyProps> = ({
    task,
    periodBetweenStarAndEndDaysList,
    entity,
}) => {
    const taskCommitsArrayWithItemSize =
        task.commits?.map((commit: PersonStaticsStoreDto) => {
            const itemSize = getItemSizeByCommitChanges(commit.total);
            return {
                ...commit,
                itemSize,
            };
        }) || [];
    const tableCellsWithCommitInfo = periodBetweenStarAndEndDaysList.map((date) => {
        const crossedDayAndCommitDate =
            taskCommitsArrayWithItemSize.filter((filterCommit) =>
                isSameDay(new Date(filterCommit.commitDate), date)
            ) || [];

        const isDayWeekend = isWeekend(date);
        return (
            <DateCell
                date={date}
                isDayWeekend={isDayWeekend}
                crossedDayAndCommitDate={crossedDayAndCommitDate}
                task={task}
                taskCommitsArrayWithItemSize={taskCommitsArrayWithItemSize}
                entity={entity}
                key={date.toISOString()}
            />
        );
    });
    return <>{tableCellsWithCommitInfo}</>;
};

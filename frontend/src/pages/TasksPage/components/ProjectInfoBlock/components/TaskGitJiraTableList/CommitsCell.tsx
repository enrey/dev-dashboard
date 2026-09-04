import { FC } from "react";

import { Box } from "@mui/material";
import { isSameDay } from "date-fns";

import { CommitItem, OverloadedCommitsLayout } from "shared/components";
import { MAX_ARRAY_ITEM_LENGTH } from "shared/constants";
import { FullPersonStaticsStoreDto, PersonStaticsWithItemSize } from "shared/models";

import { CommitsCellProps } from "./models";

export const CommitsCell: FC<CommitsCellProps> = ({
    crossedDayAndCommitDate,
    onHover,
    date,
    taskCommitsArrayWithItemSize,
}) => {
    return (
        <Box>
            {crossedDayAndCommitDate?.length > MAX_ARRAY_ITEM_LENGTH && (
                <OverloadedCommitsLayout
                    commitsToIterate={crossedDayAndCommitDate}
                    onHover={onHover}
                />
            )}

            {crossedDayAndCommitDate?.length <= MAX_ARRAY_ITEM_LENGTH &&
                taskCommitsArrayWithItemSize?.map(
                    (commit: PersonStaticsWithItemSize, i) => {
                        const isSameDayWithCalendar = isSameDay(
                            new Date(commit.commitDate),
                            date
                        );

                        if (isSameDayWithCalendar) {
                            return (
                                <CommitItem
                                    key={`DCI_${i}-${commit.sha}_${commit.email}_${commit.date}`}
                                    commit={commit as FullPersonStaticsStoreDto}
                                    onHover={onHover}
                                />
                            );
                        }
                    }
                )}
        </Box>
    );
};

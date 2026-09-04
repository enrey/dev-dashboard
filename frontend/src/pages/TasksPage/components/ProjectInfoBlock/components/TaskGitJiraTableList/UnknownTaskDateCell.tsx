import React, { FC } from "react";

import { isSameDay } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";

import { CommitItem, OverloadedCommitsLayout } from "shared/components";
import { MAX_ARRAY_ITEM_LENGTH } from "shared/constants";
import { FullPersonStaticsStoreDto, PersonStaticsWithItemSize } from "shared/models";

import { UnknownTaskDateCellProps } from "./models";

export const UnknownTaskDateCell: FC<UnknownTaskDateCellProps> = (props) => {
    const { date, crossedDayAndCommitDate, taskCommitsArrayWithItemSize, onHover, task } =
        props;
    const location = useLocation();
    const navigate = useNavigate();

    const handleClick = () => {
        // Для UnknownTask пытаемся найти email из коммитов или из firstContributor
        const email = crossedDayAndCommitDate[0]?.email ||
                     taskCommitsArrayWithItemSize[0]?.email ||
                     (task as any)?.firstContributor?.email;
        if (email) {
            navigate(
                {
                    pathname: `/worklog/${email}`,
                    search: `?selectedDate=${date.toISOString().split("T")[0]}&from=tasks`,
                },
                { state: { backgroundLocation: location } }
            );
        }
    };
    return (
        <div onClick={handleClick} style={{ cursor: "pointer" }}>
            {/* Далее используется тернарный оператор вместо &&, т.к. проп children будет ругаться,
                            что он не может быть false. Каст в element не помогает  */}
            {crossedDayAndCommitDate.length > MAX_ARRAY_ITEM_LENGTH ? (
                <OverloadedCommitsLayout
                    commitsToIterate={crossedDayAndCommitDate}
                    onHover={onHover}
                />
            ) : (
                <></>
            )}

            {crossedDayAndCommitDate.length <= MAX_ARRAY_ITEM_LENGTH ? (
                <>
                    {taskCommitsArrayWithItemSize.map(
                        (commit: PersonStaticsWithItemSize, index) => {
                            const isSameDayWithCalendar = isSameDay(
                                new Date(commit.commitDate),
                                date
                            );

                            if (isSameDayWithCalendar) {
                                return (
                                    <CommitItem
                                        key={`UDCI_${index}-${commit.sha}_${commit.email}_${commit.date}`}
                                        commit={commit as FullPersonStaticsStoreDto}
                                        onHover={onHover}
                                    />
                                );
                            }
                        }
                    )}
                </>
            ) : (
                <></>
            )}
        </div>
    );
};

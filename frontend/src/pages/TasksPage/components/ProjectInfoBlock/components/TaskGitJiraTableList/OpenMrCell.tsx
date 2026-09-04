import { FC } from "react";

import { Box } from "@mui/material";
import { isSameDay } from "date-fns";

import { ItemWithContributor } from "shared/models";

import { JiraHistoryLayout } from "./JiraHistoryLayout";
import { OpenMrCellProps, MrTypeEnum } from "./models";
import { prepareHistory } from "./utils/prepareHistory";
import { MrInfoLayout } from "./MrInfoLayout";

export const OpenMrCell: FC<OpenMrCellProps> = ({ task, date, onHover }) => {
    const history = prepareHistory(task);
    return (
        <>
            {history && history.length > 0 && (
                <JiraHistoryLayout task={history} date={date} onHover={onHover} />
            )}
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                {task.opened.map((mr: ItemWithContributor, i: any) => {
                    const isSameDayWithCalendar = isSameDay(new Date(mr.dt), date);
                    if (isSameDayWithCalendar) {
                        return (
                            <MrInfoLayout
                                key={i}
                                mr={mr}
                                mrType={MrTypeEnum.mrOpen}
                                onHover={onHover}
                            />
                        );
                    }
                })}
            </Box>
        </>
    );
};

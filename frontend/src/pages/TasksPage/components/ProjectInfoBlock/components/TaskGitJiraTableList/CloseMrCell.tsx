import { FC } from "react";

import { Box } from "@mui/material";
import { isSameDay } from "date-fns";

import { ItemWithContributor } from "shared/models";

import { CloseMrCellProps, MrTypeEnum } from "./models";
import { MrInfoLayout } from "./MrInfoLayout";

export const CloseMrCell: FC<CloseMrCellProps> = ({ task, date, onHover }) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            {task.merged.map((mr: ItemWithContributor, i: any) => {
                const isSameDayWithCalendar = isSameDay(new Date(mr.dt), date);

                if (isSameDayWithCalendar) {
                    return (
                        <MrInfoLayout
                            key={`${mr.iid}-${i}`}
                            mr={mr}
                            mrType={MrTypeEnum.mrClose}
                            onHover={onHover}
                        />
                    );
                }
            })}
        </Box>
    );
};

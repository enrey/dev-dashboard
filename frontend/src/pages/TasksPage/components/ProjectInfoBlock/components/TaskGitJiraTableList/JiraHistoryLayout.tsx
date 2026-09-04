import { FC } from "react";

import { Box, Typography } from "@mui/material";
import { isSameDay } from "date-fns";

import { MAX_ARRAY_ITEM_LENGTH } from "shared/constants";

import { JiraHistoryItem } from "./JiraHistoryItem";
import { JiraHistoryLayoutProps } from "./models";
import { dedupTasks } from "./utils/dedupTasks.util";

export const JiraHistoryLayout: FC<JiraHistoryLayoutProps> = ({
    date,
    task,
    onHover,
}) => {
    const taskByDay = task.filter((t) => isSameDay(new Date(t.date), date));
    const dedupedTasks = dedupTasks(taskByDay);

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            {dedupedTasks.length > MAX_ARRAY_ITEM_LENGTH && (
                <Typography>+{dedupedTasks.length - MAX_ARRAY_ITEM_LENGTH}</Typography>
            )}
            {dedupedTasks.slice(0, MAX_ARRAY_ITEM_LENGTH).map((t, i) => (
                <JiraHistoryItem
                    key={`${t.issueNumber}-${t.changeType}`}
                    {...t}
                    selfColor={t.selfColor}
                    onHover={onHover}
                    statuses={t.statuses}
                    descriptionChangesCount={t.descriptionChangesCount}
                />
            ))}
        </Box>
    );
};

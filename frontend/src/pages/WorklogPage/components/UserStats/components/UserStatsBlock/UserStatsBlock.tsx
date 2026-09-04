import { FC } from "react";

import { List, ListItem, Stack, Typography } from "@mui/material";

import { UserStatsBlockProps } from "./models";

export const UserStatsBlock: FC<UserStatsBlockProps> = ({ children, title }) => {
    return (
        <List>
            <ListItem disablePadding sx={{ justifyContent: "center" }}>
                <Typography variant="body1">
                    <b>{title}:</b>
                </Typography>
            </ListItem>
            <ListItem disablePadding>
                <Stack direction="row" spacing={2}>
                    {children}
                </Stack>
            </ListItem>
        </List>
    );
};

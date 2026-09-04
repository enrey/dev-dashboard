import React, { FC, Fragment } from "react";

import { Link, List, ListItem, Typography } from "@mui/material";

import { UserStatsTreeItemProps } from "./models";
import styles from "../../../../WorklogPopup.module.scss";

export const UserStatsTreeItem: FC<UserStatsTreeItemProps> = ({
    title,
    treeArray,
    idItem,
}) => {
    return (
        <ListItem
            disablePadding
            sx={{
                maxWidth: "45vw",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
            }}
        >
            <List disablePadding>
                <ListItem disablePadding>
                    <Typography variant="body1">
                        {title}: <b>{treeArray.length}</b>
                    </Typography>
                </ListItem>
                <ListItem
                    disablePadding
                    sx={{
                        paddingLeft: "12px",
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                    }}
                >
                    {treeArray.map(({ issueUrl, issueNumber }, index) => (
                        <Fragment key={`${idItem}_${index}-${issueNumber}_${issueUrl}`}>
                            <Link
                                className={styles.issue_link}
                                href={issueUrl}
                                underline="none"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {issueNumber}
                            </Link>
                        </Fragment>
                    ))}
                </ListItem>
            </List>
        </ListItem>
    );
};

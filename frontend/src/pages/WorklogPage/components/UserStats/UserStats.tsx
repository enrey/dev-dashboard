import { FC, useMemo, memo } from "react";

import { Divider, List, ListItem, Stack, Typography } from "@mui/material";

import { CombinedJiraTask } from "shared/models";
import { JiraTaskService } from "shared/services";

import { UserStatsBlock } from "./components/UserStatsBlock/UserStatsBlock";
import { UserStatsTreeItem } from "./components/UserStatsTreeItem/UserStatsTreeItem";
import { UserStatsProps } from "./models";
import { UserStatsService } from "./services";

export const UserStats: FC<UserStatsProps> = memo(({ userData }) => {
    const {
        allIssues,
        bugsIssues,
        totalCommits,
        totalChurn,
        totalAdded,
        totalDeleted,
        totalComments,
        gitlabStatistics,
        mrOpened,
        tasks,
    } = userData;

    const userTask: CombinedJiraTask[] = JiraTaskService.combineTask(tasks || []);

    const startedIssues = useMemo(
        () => UserStatsService.startedIssues(userTask),
        [userTask]
    );

    const fixedIssues = useMemo(() => UserStatsService.fixedIssues(userTask), [userTask]);

    const inprogressIssues = useMemo(
        () => UserStatsService.inprogressIssues(userTask),
        [userTask]
    );

    return (
        <Stack
            direction="row"
            spacing={5}
            divider={
                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ marginBottom: "15px!important" }}
                />
            }
        >
            <UserStatsBlock title={"Jira"}>
                <List>
                    <ListItem disablePadding>
                        <Typography variant="body1">
                            Всего задач: <b>{allIssues}</b>
                        </Typography>
                    </ListItem>
                    <ListItem disablePadding>
                        <Typography variant="body1">
                            Из них багов: <b>{bugsIssues}</b>
                        </Typography>
                    </ListItem>
                </List>
                <List>
                    <UserStatsTreeItem
                        title={"Взято в разработку"}
                        idItem={"IS"}
                        treeArray={startedIssues || []}
                    />
                    <UserStatsTreeItem
                        title={"В работе"}
                        idItem={"IP"}
                        treeArray={inprogressIssues || []}
                    />
                    <UserStatsTreeItem
                        title={"Завершено"}
                        idItem={"IF"}
                        treeArray={fixedIssues || []}
                    />
                </List>
            </UserStatsBlock>
            <UserStatsBlock title={"Git"}>
                <List>
                    <ListItem disablePadding>
                        <Typography variant="body1">
                            Commits: <b>{totalCommits}</b>
                        </Typography>
                    </ListItem>
                    <ListItem disablePadding>
                        <Typography variant="body1">
                            Churn: <b>{totalChurn}</b>
                        </Typography>
                    </ListItem>
                    <ListItem disablePadding>
                        <Typography variant="body1">
                            LOC+: <b>{totalAdded}</b>
                        </Typography>
                    </ListItem>
                    <ListItem disablePadding>
                        <Typography variant="body1">
                            LOC-: <b>{totalDeleted}</b>
                        </Typography>
                    </ListItem>
                </List>
            </UserStatsBlock>
            <UserStatsBlock title={"Gitlab"}>
                <List>
                    <ListItem disablePadding>
                        <Typography variant="body1">
                            Comments: <b>{totalComments}</b>
                        </Typography>
                    </ListItem>
                    <ListItem disablePadding>
                        <Typography variant="body1">
                            MR merged: <b>{gitlabStatistics?.mergedTotal}</b>
                        </Typography>
                    </ListItem>
                    <ListItem disablePadding>
                        <Typography variant="body1">
                            MR opened: <b>{mrOpened}</b>
                        </Typography>
                    </ListItem>
                </List>
            </UserStatsBlock>
        </Stack>
    );
});

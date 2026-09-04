import { MouseEvent, useMemo } from "react";

import CloseIcon from "@mui/icons-material/Close";
import {
    Drawer,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material";

import { LoadingIcon } from "..";
import { useServiceStatuses } from "shared/hooks";

import { FooterDataLoaderLayoutProps } from ".";

import "./FooterDataLoaderLayout.scss";

export const FooterDataLoaderLayout: React.FC<FooterDataLoaderLayoutProps> = ({
    isFooterVisible,
    onClose,
    onClickDrawer,
}) => {
    const { services, isLoading, isLoaded, isSucceeded } = useServiceStatuses();
    const {
        git,
        gitlab,
        gitlabComments,
        jiraUsers,
        gitlabUsers,
        jira,
        calendar,
        confluence,
    } = services;
    const handleCloseFooter = (event: MouseEvent) => {
        event?.stopPropagation();
        onClose?.();
    };

    const handleClickOnDrawer = () => onClickDrawer?.();

    const mw30: any = { minWidth: "30px" };

    const loaderVariant = useMemo(
        () => (isLoading ? "indeterminate" : "determinate"),
        [isLoading]
    );

    const title = useMemo(
        () =>
            isLoading
                ? "Данные загружаются"
                : isSucceeded
                  ? "Данные загружены"
                  : "Загружено не полностью",
        [isLoading, isSucceeded]
    );

    const isLoadedWithErrors = !isSucceeded && isLoaded;

    const isDataNotLoadedOrLoadedWithErrors = useMemo(
        () => !isLoaded || !isSucceeded,
        [isSucceeded, isLoaded]
    );
    return (
        <Drawer
            open={isFooterVisible && isDataNotLoadedOrLoadedWithErrors}
            anchor="bottom"
            variant="persistent"
            onClick={handleClickOnDrawer}
        >
            <Typography
                sx={{ minWidth: "220px" }}
                component="span"
                color={isLoadedWithErrors ? "secondary" : "inherit"}
            >
                {title}
            </Typography>
            <LinearProgress
                variant={loaderVariant}
                value={100}
                color="secondary"
                sx={{ width: 300 }}
            />
            <List sx={{ width: "100%", display: "flex" }} dense={true}>
                <ListItem sx={{ maxWidth: "130px" }}>
                    <ListItemAvatar sx={mw30}>
                        <LoadingIcon status={git} />
                    </ListItemAvatar>
                    <ListItemText primary="Git" />
                </ListItem>

                <ListItem>
                    <ListItemAvatar sx={mw30}>
                        <LoadingIcon status={jira} />
                    </ListItemAvatar>
                    <ListItemText primary="Jira" />
                </ListItem>

                <ListItem>
                    <ListItemAvatar sx={mw30}>
                        <LoadingIcon status={jiraUsers} />
                    </ListItemAvatar>
                    <ListItemText primary="Jira Users" />
                </ListItem>

                <ListItem>
                    <ListItemAvatar sx={mw30}>
                        <LoadingIcon status={gitlab} />
                    </ListItemAvatar>
                    <ListItemText primary="Gitlab" />
                </ListItem>

                <ListItem>
                    <ListItemAvatar sx={mw30}>
                        <LoadingIcon status={gitlabUsers} />
                    </ListItemAvatar>
                    <ListItemText primary="Gitlab Users" />
                </ListItem>

                <ListItem>
                    <ListItemAvatar sx={mw30}>
                        <LoadingIcon status={gitlabComments} />
                    </ListItemAvatar>
                    <ListItemText primary="Gitlab Comments" />
                </ListItem>

                <ListItem>
                    <ListItemAvatar sx={mw30}>
                        <LoadingIcon status={calendar} />
                    </ListItemAvatar>
                    <ListItemText primary="Calendar" />
                </ListItem>
                <ListItem>
                    <ListItemAvatar sx={mw30}>
                        <LoadingIcon status={confluence} />
                    </ListItemAvatar>
                    <ListItemText primary="Confluence" />
                </ListItem>
            </List>
            {isLoadedWithErrors && (
                <IconButton onClick={(e) => handleCloseFooter(e)}>
                    <CloseIcon />
                </IconButton>
            )}
        </Drawer>
    );
};

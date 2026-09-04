import { FC } from "react";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import GitHubIcon from "@mui/icons-material/GitHub";
import HideSourceIcon from "@mui/icons-material/HideSource";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { GitLabIcon, JiraIcon, ConfluenceIcon } from "icons";

import { DatasourceStatusEnum } from "shared/enums";

interface DataSourceIconProps {
    icon: DatasourceStatusEnum;
    width?: string | number;
}

export const DataSourceIcon: FC<DataSourceIconProps> = ({ icon, width = 14 }) => {
    if (icon === DatasourceStatusEnum.JIRA) return <JiraIcon width={width} />;
    if (icon === DatasourceStatusEnum.GITLAB) return <GitLabIcon width={width} />;
    if (icon === DatasourceStatusEnum.CONFLUENCE) return <ConfluenceIcon width={width} />;
    if (icon === DatasourceStatusEnum.MAIL)
        return (
            <MailOutlineIcon
                color="primary"
                sx={{
                    fontSize: width,
                }}
            />
        );
    if (icon === DatasourceStatusEnum.GIT)
        return (
            <GitHubIcon
                color="action"
                sx={{
                    fontSize: width,
                }}
            />
        );
    if (icon === DatasourceStatusEnum.NONE)
        return (
            <HideSourceIcon
                color="disabled"
                sx={{
                    fontSize: width,
                }}
            />
        );
    return (
        <ErrorOutlineIcon
            color="error"
            sx={{
                fontSize: width,
            }}
        />
    );
};

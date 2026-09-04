import { FC } from "react";

import { Box, Tooltip, Typography } from "@mui/material";

import { ProjectInfoProps } from "./model";
import { ProjectButton } from "../ProjectButton";
import { ProjectButtonTitle } from "../ProjectButtonTitle";

export const ProjectInfo: FC<ProjectInfoProps> = (props) => {
    const {
        projectName,
        totalTasks,
        featuresQuantity,
        subtasksQuantity,
        bugsQuantity,
        unidentifiedTasks,
    } = props;
    if (projectName === "???") {
        const tooltipText = `Всего неопознанных задач: ${totalTasks}`;
        return (
            <ProjectButton projectName={projectName}>
                <Tooltip title={tooltipText} placement="bottom">
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Typography component="span" sx={{ fontSize: "12px" }}>
                            {projectName}
                        </Typography>
                        <Typography
                            component="span"
                            sx={{ display: "flex", fontSize: "12px" }}
                        >
                            ({totalTasks})
                        </Typography>
                    </Box>
                </Tooltip>
            </ProjectButton>
        );
    }
    const tooltipText = `Всего задач: ${totalTasks}; Тасок: ${featuresQuantity}; Сабтасок: ${subtasksQuantity};
                     Багов: ${bugsQuantity}; Неопознанных задач: ${unidentifiedTasks}`;
    return (
        <ProjectButton projectName={projectName}>
            <ProjectButtonTitle
                title={projectName || "???"}
                titleTooltip={tooltipText}
                bugTaskCount={bugsQuantity}
                undefinedTaskCount={unidentifiedTasks}
                allTaskCount={subtasksQuantity + featuresQuantity}
            />
        </ProjectButton>
    );
};

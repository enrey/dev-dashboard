import { FC } from "react";

import { Box, Tooltip } from "@mui/material";

import { ProjectLabelProps } from "./models";
import tableStyles from "./UsersTable.module.scss";

export const ProjectLabel: FC<ProjectLabelProps> = ({ project }) => {
    return (
        <Tooltip title={project.length >= 23 && project}>
            <Box component={"span"} className={tableStyles.projectName} sx={{}}>
                {project}
            </Box>
        </Tooltip>
    );
};

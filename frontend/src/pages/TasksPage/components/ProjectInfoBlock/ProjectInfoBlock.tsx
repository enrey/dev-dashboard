import { memo, useContext } from "react";

import { Box } from "@mui/material";

import { EmptyBlock } from "shared/components";

import { TaskGitJiraTableList } from "./components";
import { ProjectInfoBlockProps } from "./models";
import { FilterContext } from "../../../../contexts/filter";

export const ProjectInfoBlock = memo(
    ({ projectsInformation, ...tableProps }: ProjectInfoBlockProps) => {
        const { filter } = useContext(FilterContext);
        const renderedProjectInfoList =
            filter.users.length === 0
                ? projectsInformation
                : projectsInformation.filter((project) => project.totalTasks !== 0);

        if (!renderedProjectInfoList.length) {
            return <EmptyBlock format="fullsize" />;
        }

        return (
            <Box
                sx={{
                    overflowX: "auto",
                }}
            >
                <TaskGitJiraTableList {...tableProps} />
            </Box>
        );
    }
);

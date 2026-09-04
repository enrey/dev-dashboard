import { memo } from "react";

import { Box, Typography } from "@mui/material";

import { AllProjectInfo } from "./components/AllProjectInfo";
import { ProjectInfo } from "./components/ProjectInfo";
import { HeaderWithFastProjectFilterProps } from "./models";

export const HeaderWithFastProjectFilter = memo(
    ({ allFilterStats, projectsInformation }: HeaderWithFastProjectFilterProps) => {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    alignItems: "center",
                }}
            >
                <Box>
                    <Typography
                        component="span"
                        sx={{
                            textTransform: "uppercase",
                            fontWeight: "600",
                            fontSize: "20px",
                        }}
                    >
                        Задачи по проектам
                    </Typography>
                </Box>
                <Box>
                    <AllProjectInfo allFilterStats={allFilterStats} />
                    {projectsInformation.map((project, i) => (
                        <ProjectInfo {...project} key={i} />
                    ))}
                </Box>
            </Box>
        );
    }
);

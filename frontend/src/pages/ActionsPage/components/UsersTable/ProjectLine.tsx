import { FC, useState } from "react";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Box, Button, Chip } from "@mui/material";
import { useFastProjectFilter } from "shared/hooks/useFastProjectFilter";

import { MAX_SHOWING_USER_PROJECTS } from "shared/constants";

import { ProjectLabel } from "./ProjectLabel";
import { ProjectLineProps } from "./models";
import styles from "./ProjectLine.module.scss";

export const ProjectLine: FC<ProjectLineProps> = ({ projects }) => {
    const showProjects = projects.slice(0, MAX_SHOWING_USER_PROJECTS);
    const hiddenProjects = projects.slice(MAX_SHOWING_USER_PROJECTS, projects.length);
    const lengthHiddenProjects = hiddenProjects.length;
    const [isExpand, setIsExpand] = useState<boolean>(false);
    const { handleFastProjectFilter, selectedProjectColor } = useFastProjectFilter();
    const handleExpandState = () => setIsExpand(!isExpand);
    return (
        <>
            <Box className={styles.projects}>
                {showProjects.map((project, index) => (
                    <Chip
                        key={project + index}
                        label={<ProjectLabel project={project} />}
                        size="small"
                        variant="outlined"
                        sx={{
                            color: selectedProjectColor(project),
                            fontSize: "0.65rem",
                            maxWidth: "100%",
                        }}
                        onClick={() => handleFastProjectFilter(project)}
                    />
                ))}
                {lengthHiddenProjects > 0 &&
                    isExpand &&
                    hiddenProjects.map((project, index) => (
                        <Chip
                            key={project + index}
                            label={<ProjectLabel project={project} />}
                            size="small"
                            variant="outlined"
                            sx={{
                                color: selectedProjectColor(project),
                                fontSize: "0.65rem",
                                maxWidth: "100%",
                            }}
                            onClick={() => handleFastProjectFilter(project)}
                        />
                    ))}
            </Box>
            {lengthHiddenProjects > 0 && (
                <Box>
                    <Button
                        onClick={handleExpandState}
                        size="small"
                        endIcon={isExpand ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                        className={styles.projectsButton}
                    >
                        {isExpand ? "Свернуть" : `+${lengthHiddenProjects} Развернуть`}
                    </Button>
                </Box>
            )}
        </>
    );
};

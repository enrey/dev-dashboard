import { FC } from "react";

import { Button } from "@mui/material";
import { useFastProjectFilter } from "shared/hooks/useFastProjectFilter";

import { ProjectButtonProps } from "./models";

export const ProjectButton: FC<ProjectButtonProps> = ({ children, projectName }) => {
    const { handleFastProjectFilter, selectedProjectColor } = useFastProjectFilter();
    return (
        <Button
            onClick={() => handleFastProjectFilter(projectName)}
            sx={{
                color: selectedProjectColor(projectName),
                ":hover": {
                    bgcolor: "rgba(221, 221, 221, 0.2)",
                },
            }}
        >
            {children}
        </Button>
    );
};

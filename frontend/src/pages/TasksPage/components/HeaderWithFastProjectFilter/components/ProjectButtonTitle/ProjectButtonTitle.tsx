import { FC } from "react";

import { Box, Tooltip, Typography } from "@mui/material";

import { ProjectButtonTitleProps } from "./model";

export const ProjectButtonTitle: FC<ProjectButtonTitleProps> = (props) => {
    const { titleTooltip, title, allTaskCount, bugTaskCount, undefinedTaskCount } = props;
    return (
        <Tooltip title={titleTooltip} placement="bottom">
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Typography component="span" sx={{ fontSize: "12px" }}>
                    {title}
                </Typography>
                <Typography component="span" sx={{ display: "flex", fontSize: "12px" }}>
                    ({allTaskCount || "0"}/
                    <Typography component="span" sx={{ color: "red", fontSize: "12px" }}>
                        {bugTaskCount || "0"}
                    </Typography>
                    /
                    <Typography component="span" sx={{ color: "blue", fontSize: "12px" }}>
                        {undefinedTaskCount || "0"}
                    </Typography>
                    )
                </Typography>
            </Box>
        </Tooltip>
    );
};

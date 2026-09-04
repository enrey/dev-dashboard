import { Tooltip, Link, Box } from "@mui/material";

import { ShowTask } from "shared/components";

import { MrInfoLayoutPropsModel, MrTypeEnum } from "./models";

export const MrInfoLayout = ({ mrType, mr, onHover }: MrInfoLayoutPropsModel) => {
    const title = `${mr.contributor.name || mr.email}: ${mr.title}`;
    return (
        <ShowTask onHover={onHover} label={title}>
            {mrType === MrTypeEnum.mrClose ? (
                <Tooltip title={title}>
                    <Link
                        sx={{ textDecoration: "none" }}
                        target="_blank"
                        rel="noopener"
                        href={mr.url}
                    >
                        <Box
                            sx={{
                                width: "8px",
                                height: "8px",
                                border:
                                    mr.contributor.selfColor
                                        ? `1px solid ${mr.contributor.selfColor}`
                                        : "1px solid #d400c6",
                                mb: "1px",
                                zIndex: 1100,
                                position: "relative",
                            }}
                        />
                    </Link>
                </Tooltip>
            ) : (
                <Tooltip title={title} className="scaleUp">
                    <Link
                        sx={{ textDecoration: "none" }}
                        target="_blank"
                        rel="noopener"
                        href={mr.url}
                    >
                        <Box
                            sx={{
                                width: "8px",
                                height: "8px",
                                mb: "1px",
                                backgroundColor:
                                    mr.contributor.selfColor || "#009688",
                                zIndex: 1100,
                                position: "relative",
                            }}
                        />
                    </Link>
                </Tooltip>
            )}
        </ShowTask>
    );
};

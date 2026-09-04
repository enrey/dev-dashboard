import { Fragment } from "react";

import { ListItem, Box, Chip, ListItemAvatar, ListItemText } from "@mui/material";

import { LastUpdateTimeLayout } from "..";
import { LoadingIcon } from "../..";
import { LoadingStatus } from "shared/enums";

import { LoadableItemBlockProps } from ".";

export const LoadableItemBlock: React.FC<LoadableItemBlockProps> = ({
    source,
    sourceHref,
    method,
    loadingStatus,
    loadedResource,
    withoutDateUpdateBlock,
    summary = [],
    isFromCache = false,
}) => {
    const listItemStyle: any = {
        alignItems: "flex-start",
        gap: 1,
        paddingTop: "6px",
        paddingBottom: "6px",
    };

    const { success } = loadedResource || {};

    const minWidth40: any = {
        minWidth: "32px",
    };
    return (
        <ListItem sx={listItemStyle} divider>
            <Box display="flex" sx={{ pt: "2px" }}>
                <ListItemAvatar sx={minWidth40}>
                    <LoadingIcon status={loadingStatus} isLoadSuccessful={success} />
                </ListItemAvatar>
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <ListItemText
                        primary={
                            sourceHref ? (
                                <Box
                                    component="a"
                                    href={sourceHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    sx={{ color: "inherit", textDecoration: "none" }}
                                >
                                    {source}
                                </Box>
                            ) : (
                                source
                            )
                        }
                        primaryTypographyProps={{ fontWeight: 600, fontSize: "0.95rem" }}
                        sx={{ my: 0, flex: "0 1 auto" }}
                    />
                    {isFromCache && (
                        <Chip
                            label="из кеша"
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                    )}
                </Box>
                {method && (
                    <Box
                        component="span"
                        sx={{
                            display: "block",
                            color: "text.disabled",
                            fontFamily: "var(--ds-font-family-mono)",
                            fontSize: "0.7rem",
                            lineHeight: 1.3,
                            mt: 0.1,
                        }}
                    >
                        {method}
                    </Box>
                )}
                {summary.length > 0 && (
                    <Box
                        component="span"
                        sx={{
                            display: "block",
                            color: "text.secondary",
                            fontSize: "0.78rem",
                            lineHeight: 1.35,
                            mt: 0.25,
                        }}
                    >
                        {summary.map((item, index) => (
                            <Fragment key={index}>
                                {index > 0 && " · "}
                                {item}
                            </Fragment>
                        ))}
                    </Box>
                )}
                {loadingStatus === LoadingStatus.done && (
                    <LastUpdateTimeLayout
                        source={source}
                        loadedResource={loadedResource}
                        withoutDateUpdateBlock={withoutDateUpdateBlock}
                    />
                )}
            </Box>
        </ListItem>
    );
};

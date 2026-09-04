import { FC } from "react";

import { Box, Typography, Tooltip } from "@mui/material";
import { isSameDay } from "date-fns";

import { ShowTask } from "shared/components";
import { MAX_ARRAY_ITEM_LENGTH } from "shared/constants";
import { DateAndIdItemStore } from "shared/models";

import { CommentsCellProps } from "./models";

export const CommentsCell: FC<CommentsCellProps> = ({ task, onHover, date }) => {
    const crossedDayAndComments =
        task?.comments.filter((comment) => isSameDay(new Date(comment.dt), date)) ||
        [];
    const commits =
        crossedDayAndComments?.length > MAX_ARRAY_ITEM_LENGTH
            ? crossedDayAndComments.slice(0, MAX_ARRAY_ITEM_LENGTH)
            : crossedDayAndComments;
    const showCount = crossedDayAndComments?.length > MAX_ARRAY_ITEM_LENGTH;

    return (
        <Box>
            {showCount && (
                <Typography>
                    +{crossedDayAndComments?.length - MAX_ARRAY_ITEM_LENGTH}
                </Typography>
            )}
            {commits.map((comment, i) => {
                const title = `${comment.email}: ${comment.comment}`;
                return (
                    <ShowTask onHover={onHover} label={title} key={`${comment.iid}-${i}`}>
                        <Tooltip
                            title={
                                <>
                                    <p style={{ marginTop: 0, fontWeight: "bold" }}>
                                        {comment.email}:
                                    </p>
                                    <p style={{ marginBottom: 0 }}>{comment.comment}</p>
                                </>
                            }
                            arrow
                        >
                            <Box
                                className="arrow-comment"
                                sx={{
                                    mb: "1px",
                                    borderBottom: "8px solid #009688",
                                    zIndex: 1100,
                                    position: "relative",
                                }}
                            />
                        </Tooltip>
                    </ShowTask>
                );
            })}
        </Box>
    );
};

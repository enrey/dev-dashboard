import { memo } from "react";

import { Box, Typography } from "@mui/material";

import AttentionIcon from "assets/attention_icon.svg";

import { emptyBlockStyles } from "./constants";

import { EmptyBlockProps } from ".";

export const EmptyBlock = memo(({ format = "blocksize", text }: EmptyBlockProps) => (
    <Box
        sx={
            format === "fullsize"
                ? (emptyBlockStyles.fullSizeStyle as object)
                : emptyBlockStyles.blockStyle
        }
        component="div"
    >
        <img className="attention-icon" src={AttentionIcon} alt="Обратите внимание" />
        <Typography sx={{ textAlign: "center" }}>
            {text || "По текущим фильтрам нет результатов"}
        </Typography>
    </Box>
));

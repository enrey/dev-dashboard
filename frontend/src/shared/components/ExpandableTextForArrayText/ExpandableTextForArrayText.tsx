import { memo, useState } from "react";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Box, Button, Tooltip } from "@mui/material";

import { MAX_TEXT_LENGTH, MIN_ELEMENT_QUANTITY, MIN_TEXT_LENGTH } from "./constants";

import { ExpandableTextForArrayTextProps } from ".";

import "./ExpandableTextForArrayText.scss";

export const ExpandableTextForArrayText = memo(
    ({ textArray }: ExpandableTextForArrayTextProps) => {
        const [isExpand, setIsExpand] = useState<boolean>(false);
        
        if (textArray.length > MIN_ELEMENT_QUANTITY) {
            const slicedTextArray: string[] = textArray.slice(
                0,
                MIN_ELEMENT_QUANTITY - textArray.length
            );

            const slicedLayout = slicedTextArray.map((text, i) => {
                const trimmedTitle = text.slice(0, MIN_TEXT_LENGTH) + "...";

                return text.length > MIN_TEXT_LENGTH && text.length >= MAX_TEXT_LENGTH ? (
                    <li key={`${text}_${i}`} style={{ listStyleType: "none" }}>
                        <Tooltip title={text}>
                            <Box>{trimmedTitle}</Box>
                        </Tooltip>
                    </li>
                ) : (
                    <li key={`${text}_${i}`} style={{ listStyleType: "none" }}>
                        {text}
                    </li>
                );
            });

            const handleExpandState = () => setIsExpand(!isExpand);

            return (
                <>
                    <ul>
                        {!isExpand && slicedLayout}
                        {isExpand &&
                            textArray.map((text, i) => {
                                return <li key={`${text}_${i}`}>{text}</li>;
                            })}
                    </ul>
                    <div>
                        <Button
                            onClick={handleExpandState}
                            endIcon={
                                isExpand ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                            }
                            sx={{ textTransform: "none", paddingLeft: "0px" }}
                        >
                            {isExpand ? "Свернуть" : "Развернуть"}
                        </Button>
                    </div>
                </>
            );
        }

        const defaultLayout = textArray.map((text, i) => {
            const trimmedTitle = text.slice(0, MIN_TEXT_LENGTH) + "...";

            return text.length > MIN_TEXT_LENGTH && text.length >= MAX_TEXT_LENGTH ? (
                <li key={`${text}_${i}`} style={{ listStyleType: "none" }}>
                    <Tooltip title={text}>
                        <Box>{trimmedTitle}</Box>
                    </Tooltip>
                </li>
            ) : (
                <li key={`${text}_${i}`} style={{ listStyleType: "none" }}>
                    {text}
                </li>
            );
        });

        return (
            <>
                <ul>{defaultLayout}</ul>
            </>
        );
    }
);

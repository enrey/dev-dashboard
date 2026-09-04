import { memo } from "react";

import { Box } from "@mui/material";
import { isSameDay } from "date-fns";

import { CustomWidthTooltip } from "../CustomWidthTooltip";

import { ContributorPresenceProps } from ".";

export const ContributorPresence = memo(
    ({ contributors, iterateDate }: ContributorPresenceProps) => {
        const presenceLayout = contributors?.map((contributor, i) => {
            return contributor?.presence?.map((presence) => {
                if (presence && isSameDay(new Date(presence.date), iterateDate)) {
                    return (
                        <CustomWidthTooltip
                            key={`${contributor.email}-${i}`}
                            maxWidth={130}
                            title={`Имя: ${contributor.name} Тип: ${presence.type}`}
                            placement="right"
                        >
                            <Box component="div">{presence.type}</Box>
                        </CustomWidthTooltip>
                    );
                }
            });
        });
        return (
            <Box
                sx={{
                    position: "absolute",
                    top: "2px",
                    width: "80%",
                    textAlign: "center",
                    overflow: "hidden",
                    fontSize: "12px",
                    color: "#888",
                    textShadow: "1px 1px 1px #ddd",
                }}
            >
                {presenceLayout}
            </Box>
        );
    }
);

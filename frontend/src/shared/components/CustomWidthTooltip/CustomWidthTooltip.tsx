import styled from "@emotion/styled";
import { Tooltip, tooltipClasses } from "@mui/material";

import { CustomWidthTooltipProps } from ".";

export const CustomWidthTooltip = styled(
    ({ className, ...props }: CustomWidthTooltipProps) => (
        <Tooltip {...props} classes={{ popper: className }} />
    )
)(({ maxWidth }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth,
    },
}));

import { FC, memo } from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Button, Link } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { CloseDrawerProps } from "./models";
import { containerStyle } from "../../constants";

export const CloseDrawer: FC<CloseDrawerProps> = memo(({ openFrom }) => {
    const locationParams = useLocation();

    // Удаляем selectedDate из query параметров при закрытии popup
    const searchParams = new URLSearchParams(locationParams.search);
    searchParams.delete('selectedDate');
    const cleanSearch = searchParams.toString();

    return (
        <Link
            to={{
                pathname: openFrom,
                search: cleanSearch,
            }}
            component={RouterLink}
        >
            <Button
                sx={{
                    position: "sticky",
                    ...containerStyle,
                }}
                aria-label="close"
                size="small"
                variant="contained"
            >
                <KeyboardArrowDownIcon />
            </Button>
        </Link>
    );
});

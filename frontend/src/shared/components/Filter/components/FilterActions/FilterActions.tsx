import { FC } from "react";

import AutorenewIcon from "@mui/icons-material/Autorenew";
import { Button } from "@mui/material";

import { FilterActionsProps } from "./models";

export const FilterActions: FC<FilterActionsProps> = ({ handleUpdateData }) => {
    return (
        <Button
            onClick={() => handleUpdateData(true)}
            variant="contained"
            endIcon={<AutorenewIcon />}
            color="secondary"
        >
            Обновить
        </Button>
    );
};
import { FC, useContext } from "react";

import { Backdrop } from "@mui/material";

import { LoaderBlock } from "./LoaderBlock";
import { LoaderPopupContext } from "../../../contexts/popup";

export const BackDropBlock: FC = () => {
    const { isOpen, setOpen } = useContext(LoaderPopupContext);
    const handleClose = () => setOpen(false);
    return (
        <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isOpen}
        >
            <LoaderBlock closeBlock={handleClose} />
        </Backdrop>
    );
};

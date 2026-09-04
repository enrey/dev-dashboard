import { FC, memo, useCallback } from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { WorklogPage } from "./WorklogPage";

export const WorklogModal: FC = memo(() => {
    const navigate = useNavigate();

    const handleClose = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <Dialog
            open
            onClose={handleClose}
            fullWidth
            maxWidth="xl"
            PaperProps={{
                sx: {
                    overflow: "hidden",
                },
            }}
            // Отключаем анимацию для более быстрого открытия
            transitionDuration={{ enter: 225, exit: 195 }}
        >
            <Box
                sx={{
                    position: "relative",
                    height: "80vh",
                    bgcolor: "background.default",
                }}
            >
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        bgcolor: "background.paper",
                        "&:hover": {
                            bgcolor: "background.paper",
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Box sx={{ height: "100%" }}>
                    <WorklogPage variant="modal" />
                </Box>
            </Box>
        </Dialog>
    );
});



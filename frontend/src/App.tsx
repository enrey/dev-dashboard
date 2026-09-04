import React, { FC, useContext, useEffect, useState } from "react";

import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ru from "date-fns/locale/ru";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { Sidebar } from "shared/components/Sidebar";

import { BackDropBlock, FooterDataLoaderLayout } from "shared/components";

import { LoaderPopupContextProvider, LoaderPopupContext } from "./contexts/popup";
import { SidebarContextProvider } from "./contexts/sidebar";
import { ThemeContextProvider } from "./contexts/theme";
import { Routing } from "./routing";
import { ThemeWrapper as Theme } from "./shared/components/Theme";
import { useServiceStatuses } from "./shared/hooks";

export const App: FC = () => {
    const { isOpen, setOpen } = useContext(LoaderPopupContext);
    const { isLoading } = useServiceStatuses();
    const [isFooterVisible, setIsFooterVisible] = useState<boolean>(true);

    // Автоматически показываем футер при начале загрузки
    useEffect(() => {
        if (isLoading) {
            setIsFooterVisible(true);
        }
    }, [isLoading]);

    const handleOpenPopupWithLoadedData = () => setOpen(true);

    const handleOnCloseFooter = () => setIsFooterVisible(false);
    const Router = import.meta.env.VITE_HASH_ROUTING === "true" ? HashRouter : BrowserRouter;
    const routerBasename = import.meta.env.VITE_HASH_ROUTING === "true"
        ? undefined
        : import.meta.env.BASE_URL;

    return (
        <ThemeContextProvider>
            <Theme>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                    <Router basename={routerBasename}>
                        <SidebarContextProvider>
                            <Box className="app-layout" sx={{ display: "flex" }}>
                                <Sidebar />
                                <Box
                                    component="main"
                                    className="app-main"
                                    sx={{
                                        flexGrow: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "100vh",
                                        overflow: "auto",
                                    }}
                                >
                                    <Box className="app-main-content">
                                        <Routing />
                                    </Box>
                                </Box>
                            </Box>
                            <FooterDataLoaderLayout
                                isFooterVisible={isFooterVisible}
                                onClose={handleOnCloseFooter}
                                onClickDrawer={handleOpenPopupWithLoadedData}
                            />
                            {isOpen && <BackDropBlock />}
                        </SidebarContextProvider>
                    </Router>
                    <ReactQueryDevtools initialIsOpen={false} />
                </LocalizationProvider>
            </Theme>
        </ThemeContextProvider>
    );
};

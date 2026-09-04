import React, { FC, PropsWithChildren, useContext } from "react";

import { CssBaseline, createTheme, PaletteMode, ThemeProvider } from "@mui/material";
import { ruRU } from "@mui/material/locale";

import { ThemeContext, ThemeModeEnum } from "../../../contexts/theme";
import { getPalette } from "../../utils/colorMode";

interface ThemeWrapperProps {
    children: PropsWithChildren<any>;
}

export const ThemeWrapper: FC<ThemeWrapperProps> = ({ children }) => {
    const { mode } = useContext(ThemeContext);
    const theme = React.useMemo(() => {
        const customPalette = getPalette();
        const getDesignTokens = (mode: PaletteMode) => ({
            palette: {
                mode,
                ...(mode === ThemeModeEnum.light
                    ? customPalette.light
                    : customPalette.dark),
            },
            typography: {
                fontFamily: "'Fira Sans', 'Inter', 'Segoe UI', 'Roboto', sans-serif",
                h1: {
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                },
                h2: {
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                },
                h3: {
                    fontWeight: 600,
                },
                button: {
                    textTransform: "none",
                    fontWeight: 500,
                },
            },
            shape: {
                borderRadius: 10,
            },
            transitions: {
                duration: {
                    shortest: 150,
                    shorter: 220,
                    short: 280,
                },
                easing: {
                    easeInOut: "cubic-bezier(0.2, 0, 0, 1)",
                },
            },
            ruRU,
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            margin: 0,
                            backgroundColor: "var(--ds-bg)",
                            color: "var(--ds-text-primary)",
                            transition:
                                "background-color var(--ds-transition-base) var(--ds-transition-ease)",
                        },
                        "*": {
                            scrollbarWidth: "thin",
                            scrollbarColor: "#64748b #e2e8f0",
                        },
                        "*:focus-visible": {
                            outline: `2px solid var(--ds-secondary)`,
                            outlineOffset: "2px",
                        },
                    },
                },
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            borderRadius: 10,
                        },
                    },
                },
            },
        });

        return createTheme(getDesignTokens(mode));
    }, [mode]);

    React.useEffect(() => {
        document.body.dataset.themeMode = mode;
    }, [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

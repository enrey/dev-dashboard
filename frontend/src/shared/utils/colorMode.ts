import { PaletteOptions } from "@mui/material/styles/createPalette";

export const dashboardColors = {
    primary: {
        main: "#1E40AF",
        light: "#3B82F6",
        dark: "#1E3A8A",
        contrastText: "#FFFFFF",
    },
    accent: {
        main: "#F59E0B",
        light: "#FBBF24",
        dark: "#B45309",
    },
} as const;

export const dashboardTypographyColors = {
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    textMuted: "#64748B",
    textDisabled: "#94A3B8",
    border: "#CBD5E1",
};

export const dashboardDarkTypographyColors = {
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    textDisabled: "#64748B",
    border: "#334155",
};

export interface PaletteTheme {
    light: PaletteOptions;
    dark: PaletteOptions;
}

export const getPalette = (): PaletteTheme => {
    const light: PaletteOptions = {
        primary: {
            main: dashboardColors.primary.main,
            light: dashboardColors.primary.light,
            dark: dashboardColors.primary.dark,
            contrastText: dashboardColors.primary.contrastText,
        },
        secondary: {
            main: dashboardColors.primary.light,
            light: "#60A5FA",
            dark: "#1D4ED8",
        },
        background: {
            default: "#F8FAFC",
            paper: "#FFFFFF",
        },
        text: {
            primary: dashboardTypographyColors.textPrimary,
            secondary: dashboardTypographyColors.textSecondary,
            disabled: dashboardTypographyColors.textDisabled,
        },
        warning: {
            main: dashboardColors.accent.main,
            light: dashboardColors.accent.light,
            dark: dashboardColors.accent.dark,
        },
    };

    const dark: PaletteOptions = {
        primary: {
            main: dashboardColors.primary.main,
            light: dashboardColors.primary.light,
            dark: dashboardColors.primary.dark,
            contrastText: dashboardColors.primary.contrastText,
        },
        secondary: {
            main: dashboardColors.primary.light,
            light: "#60A5FA",
            dark: "#1D4ED8",
        },
        background: {
            default: "#0B1220",
            paper: "#111827",
        },
        text: {
            primary: dashboardDarkTypographyColors.textPrimary,
            secondary: dashboardDarkTypographyColors.textSecondary,
            disabled: dashboardDarkTypographyColors.textDisabled,
        },
        warning: {
            main: dashboardColors.accent.main,
            light: dashboardColors.accent.light,
            dark: dashboardColors.accent.dark,
        },
    };

    return { light, dark };
};

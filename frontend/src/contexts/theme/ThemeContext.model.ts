import { PropsWithChildren } from "react";

import { ThemeModeEnum } from "./ThemeContext.enum";

export interface ThemeContextProviderProps {
    children: PropsWithChildren<any>;
}

export type ModeData = ThemeModeEnum

export interface ThemeContextData {
    mode: ModeData;
    toggleColorMode: () => void;
}


import { useCallback, useState } from "react";

import { ThemeModeEnum } from "./ThemeContext.enum";
import { ModeData, ThemeContextData } from "./ThemeContext.model";

export const useThemeContext = (props: ModeData): ThemeContextData => {
    const [mode, setMode] = useState<ModeData>(props);
    const toggleColorMode = useCallback(() => {
        setMode((prevMode) => (prevMode === ThemeModeEnum.light ? ThemeModeEnum.dark : ThemeModeEnum.light));
    }, []);

    return { mode, toggleColorMode };
};
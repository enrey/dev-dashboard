import { createContext, FC } from "react";

import { ThemeModeEnum } from "./ThemeContext.enum";
import { ThemeContextData, ThemeContextProviderProps } from "./ThemeContext.model";
import { useThemeContext } from "./useThemeContext";


const ContextInitialValue: ThemeContextData = {
    mode: ThemeModeEnum.light,
    toggleColorMode: () => {
    },
};

export const ThemeContext = createContext(ContextInitialValue);
export const ThemeContextProvider: FC<ThemeContextProviderProps> = ({ children }) => {

    const contextValue = useThemeContext(ContextInitialValue.mode);
    return (
        <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
    );
};
import { createContext, FC } from "react";

import { SidebarContextData, SidebarContextProviderProps } from "./SidebarContext.model";
import { useSidebarContext } from "./useSidebarContext";

const ContextInitialValue: SidebarContextData = {
    isCollapsed: false,
    toggleSidebar: () => {},
};

export const SidebarContext = createContext(ContextInitialValue);

export const SidebarContextProvider: FC<SidebarContextProviderProps> = ({ children }) => {
    const contextValue = useSidebarContext();
    
    return (
        <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>
    );
};


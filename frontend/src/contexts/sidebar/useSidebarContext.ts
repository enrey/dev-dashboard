import { useCallback, useEffect, useState } from "react";

import { SidebarContextData } from "./SidebarContext.model";

const STORAGE_KEY = "sidebar-collapsed";

export const useSidebarContext = (): SidebarContextData => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : true;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    const toggleSidebar = useCallback(() => {
        setIsCollapsed((prev) => !prev);
    }, []);

    return { isCollapsed, toggleSidebar };
};


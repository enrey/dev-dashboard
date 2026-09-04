export interface SidebarContextData {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export interface SidebarContextProviderProps {
    children: React.ReactNode;
}


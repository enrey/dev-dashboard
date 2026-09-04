import { FC, useContext } from "react";

import AppsIcon from "@mui/icons-material/Apps";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GitHubIcon from "@mui/icons-material/GitHub";
import GroupIcon from "@mui/icons-material/Group";
import {
    Avatar,
    Badge,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import UploadDataIcon from "assets/uploaded_data.png";
import { ROUTES } from "shared/constants";

import { LoaderPopupContext } from "../../../contexts/popup";
import { useServiceStatuses } from "shared/hooks";
import { LoadingStatus } from "shared/enums";
import { SidebarContext } from "../../../contexts/sidebar";
import { ThemeContext } from "../../../contexts/theme";
import { useFilterQueryParams } from "../../hooks/useFilterQueryParams.hook";

import "./Sidebar.scss";

const DRAWER_WIDTH_EXPANDED = 280;
const DRAWER_WIDTH_COLLAPSED = 64;

interface NavigationItem {
    text: string;
    icon: JSX.Element;
    path: string;
}

export const Sidebar: FC = () => {
    const { isCollapsed, toggleSidebar } = useContext(SidebarContext);
    const { toggleColorMode } = useContext(ThemeContext);
    const { setOpen, isOpen } = useContext(LoaderPopupContext);
    const { isLoaded, services } = useServiceStatuses();
    const { linkWithQuery } = useFilterQueryParams();
    const theme = useTheme();
    const location = useLocation();

    const navigationItems: NavigationItem[] = [
        {
            text: "Саммари",
            icon: <DashboardIcon />,
            path: ROUTES.SUMMARY,
        },
        {
            text: "По пользователям",
            icon: <GitHubIcon />,
            path: ROUTES.ACTIONS,
        },
        {
            text: "По задачам",
            icon: <AppsIcon />,
            path: ROUTES.STATS_WORKFLOW,
        },
        {
            text: "Роли пользователей",
            icon: <GroupIcon />,
            path: ROUTES.USERS,
        },
    ];

    const drawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const handleOpenPopupWithLoadedData = () => setOpen(!isOpen);
    const hasLoadingErrors = Object.values(services).some(
        (status) => status === LoadingStatus.error
    );

    return (
        <Drawer
            variant="permanent"
            className={
                isCollapsed ? "sidebar-root sidebar-root--collapsed" : "sidebar-root"
            }
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    transition: theme.transitions.create("width", {
                        easing: theme.transitions.easing.easeInOut,
                        duration: theme.transitions.duration.standard,
                    }),
                    overflowX: "hidden",
                    zIndex: 1300,
                },
            }}
        >
            {/* Header Section */}
            <Toolbar
                className="sidebar-toolbar"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isCollapsed ? "center" : "space-between",
                    px: isCollapsed ? 1 : 2.25,
                    minHeight: "60px !important",
                }}
            >
                {!isCollapsed && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        <Avatar
                            variant="square"
                            sx={{ width: 32, height: 32 }}
                        >
                            DF
                        </Avatar>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            className="sidebar-title"
                        >
                            Dashboard
                        </Typography>
                    </Box>
                )}
                {isCollapsed && (
                    <Avatar
                        variant="square"
                        sx={{ width: 32, height: 32 }}
                    >
                        DF
                    </Avatar>
                )}
                {!isCollapsed && (
                    <IconButton
                        onClick={toggleSidebar}
                        className="sidebar-collapse-btn"
                        aria-label="Свернуть боковое меню"
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Toolbar>

            {isCollapsed && (
                <Box className="sidebar-collapsed-toggle">
                    <IconButton
                        onClick={toggleSidebar}
                        size="small"
                        aria-label="Развернуть боковое меню"
                    >
                        <ChevronRightIcon />
                    </IconButton>
                </Box>
            )}

            <Divider />

            {/* Navigation Section */}
            <List className="sidebar-list" sx={{ flexGrow: 1 }}>
                {navigationItems.map((item) => (
                    <ListItem
                        key={item.path}
                        disablePadding
                        className="sidebar-item"
                        sx={{ display: "block" }}
                    >
                        <ListItemButton
                            component={Link}
                            to={linkWithQuery(item.path)}
                            selected={isActive(item.path)}
                            className="sidebar-item-button"
                            sx={{
                                minHeight: 48,
                                justifyContent: isCollapsed ? "center" : "initial",
                                px: isCollapsed ? 0 : 2.5,
                                "&.Mui-selected": {
                                    borderRight: `3px solid ${theme.palette.primary.main}`,
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: isCollapsed ? 0 : 3,
                                    justifyContent: "center",
                                    color: isActive(item.path)
                                        ? "primary.main"
                                        : "inherit",
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            {!isCollapsed && (
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: "0.9rem",
                                        fontWeight: isActive(item.path) ? 600 : 400,
                                    }}
                                />
                            )}
                        </ListItemButton>
                    </ListItem>
                ))}

                {/* Data Upload Status Button */}
                {isLoaded && (
                    <ListItem disablePadding sx={{ display: "block" }}>
                        <ListItemButton
                            onClick={handleOpenPopupWithLoadedData}
                            className="sidebar-item-button"
                            sx={{
                                minHeight: 48,
                                justifyContent: isCollapsed ? "center" : "initial",
                                px: isCollapsed ? 0 : 2.5,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: isCollapsed ? 0 : 3,
                                    justifyContent: "center",
                                }}
                            >
                                <Badge
                                    color={hasLoadingErrors ? "error" : "success"}
                                    variant={hasLoadingErrors ? "standard" : "dot"}
                                    badgeContent={hasLoadingErrors ? "!" : undefined}
                                    sx={{
                                        "& .MuiBadge-badge": {
                                            fontWeight: 700,
                                        },
                                    }}
                                >
                                    <img
                                        style={{ width: "24px" }}
                                        src={UploadDataIcon}
                                        alt="Статус загрузки"
                                    />
                                </Badge>
                            </ListItemIcon>
                            {!isCollapsed && (
                                <ListItemText
                                    primary="Статус загрузки"
                                    primaryTypographyProps={{
                                        fontSize: "0.95rem",
                                    }}
                                />
                            )}
                        </ListItemButton>
                    </ListItem>
                )}
            </List>

            <Divider />

            {/* Theme Toggle Section */}
            <Box className="sidebar-footer" sx={{ p: 2 }}>
                <ListItemButton
                    onClick={toggleColorMode}
                    className="sidebar-item-button"
                    sx={{
                        minHeight: 48,
                        justifyContent: isCollapsed ? "center" : "initial",
                        px: isCollapsed ? 0 : 2.5,
                        borderRadius: 1.5,
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: isCollapsed ? 0 : 3,
                            justifyContent: "center",
                        }}
                    >
                        {theme.palette.mode === "dark" ? (
                            <Brightness7Icon />
                        ) : (
                            <Brightness4Icon />
                        )}
                    </ListItemIcon>
                    {!isCollapsed && (
                        <ListItemText
                            primary={
                                theme.palette.mode === "dark"
                                    ? "Светлая тема"
                                    : "Тёмная тема"
                            }
                            primaryTypographyProps={{
                                fontSize: "0.95rem",
                            }}
                        />
                    )}
                </ListItemButton>
            </Box>
        </Drawer>
    );
};

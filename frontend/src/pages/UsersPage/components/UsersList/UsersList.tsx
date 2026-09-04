import React, { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import PersonIcon from "@mui/icons-material/Person";
import {
    List,
    ListItem,
    ListItemText,
    Avatar,
    Box,
    Typography,
    Chip,
    IconButton,
    TextField,
    Stack,
} from "@mui/material";

import type { ChartUser } from "shared/models";

import type { UserRole } from "shared/models";

interface UsersListProps {
    users: ChartUser[];
    userRoles: Record<string, UserRole[]>;
    userNames: Record<string, string>;
    linkedEmails: Record<string, string[]>;
    allUsers: ChartUser[];
    onRemoveRole: (userEmail: string, roleId: string) => void;
    onUpdateUserName: (userEmail: string, newName: string) => void;
    onLinkUsers: (targetEmail: string, sourceEmail: string) => void;
    onUnlinkEmail: (parentEmail: string, emailToUnlink: string) => void;
}

export const UsersList: React.FC<UsersListProps> = ({ 
    users, 
    userRoles, 
    userNames,
    linkedEmails,
    allUsers,
    onRemoveRole,
    onUpdateUserName,
    onLinkUsers,
    onUnlinkEmail
}) => {
    const [dragOverUser, setDragOverUser] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>("");
    const [draggedUserEmail, setDraggedUserEmail] = useState<string | null>(null);

    const handleDragOver = (event: React.DragEvent, userEmail: string) => {
        event.preventDefault();
        setDragOverUser(userEmail);
    };

    const handleDragLeave = () => {
        setDragOverUser(null);
    };

    const handleDrop = (event: React.DragEvent, targetEmail: string) => {
        event.preventDefault();
        setDragOverUser(null);

        try {
            // Сначала проверяем, это пользователь или роль
            const userEmailData = event.dataTransfer.getData("application/user-email");
            
            if (userEmailData) {
                // Это перетаскивание пользователя
                onLinkUsers(targetEmail, userEmailData);
                setDraggedUserEmail(null);
            } else {
                // Это перетаскивание роли
                const roleData = event.dataTransfer.getData("application/json");
                const role: UserRole = JSON.parse(roleData);

                // Генерируем custom event для назначения роли
                const assignEvent = new CustomEvent("assignRole", {
                    detail: { userEmail: targetEmail, role },
                });
                window.dispatchEvent(assignEvent);
            }
        } catch (error) {
            console.error("Error handling drop:", error);
        }
    };

    const handleUserDragStart = (event: React.DragEvent, userEmail: string) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("application/user-email", userEmail);
        setDraggedUserEmail(userEmail);
    };

    const handleUserDragEnd = () => {
        setDraggedUserEmail(null);
    };

    const handleStartEdit = (user: ChartUser) => {
        setEditingUser(user.email);
        setEditingName(userNames[user.email] || user.name);
    };

    const handleSaveEdit = (userEmail: string) => {
        if (editingName.trim()) {
            onUpdateUserName(userEmail, editingName.trim());
        }
        setEditingUser(null);
        setEditingName("");
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditingName("");
    };

    const handleKeyDown = (event: React.KeyboardEvent, userEmail: string) => {
        if (event.key === "Enter") {
            handleSaveEdit(userEmail);
        } else if (event.key === "Escape") {
            handleCancelEdit();
        }
    };

    if (!users || users.length === 0) {
        return (
            <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    Пользователи не найдены
                </Typography>
            </Box>
        );
    }

    // Разделяем пользователей на две группы: с ролями и без ролей
    const usersWithRoles = users.filter((user) => {
        const roles = userRoles[user.email];
        return roles && roles.length > 0;
    });
    const usersWithoutRoles = users.filter((user) => {
        const roles = userRoles[user.email];
        return !roles || roles.length === 0;
    });

    const getDisplayName = (user: ChartUser) => userNames[user.email] || user.name;

    // Сортируем пользователей с ролями: сначала по имени роли, потом по ФИО внутри роли
    const sortedUsersWithRoles = usersWithRoles.sort((a, b) => {
        const roleA = (userRoles[a.email] || [])[0]?.name || '';
        const roleB = (userRoles[b.email] || [])[0]?.name || '';
        const roleCompare = roleA.localeCompare(roleB, 'ru');
        if (roleCompare !== 0) return roleCompare;
        return getDisplayName(a).localeCompare(getDisplayName(b), 'ru');
    });
    const sortedUsersWithoutRoles = usersWithoutRoles.sort((a, b) =>
        getDisplayName(a).localeCompare(getDisplayName(b), 'ru')
    );

    // Объединяем: сначала с ролями, потом без ролей
    const sortedUsers = [...sortedUsersWithRoles, ...sortedUsersWithoutRoles];

    return (
        <List>
            {sortedUsers.map((user) => {
                const userRolesList = userRoles[user.email] || [];
                const hasRole = userRolesList.length > 0;
                const displayName = userNames[user.email] || user.name;
                const isEditing = editingUser === user.email;
                const userLinkedEmails = linkedEmails[user.email] || [];
                const isDragging = draggedUserEmail === user.email;
                const canDropHere = draggedUserEmail && draggedUserEmail !== user.email;
                
                // Для визуализации используем первую роль или дефолтный цвет
                const primaryRoleColor = hasRole ? userRolesList[0].color : "primary.main";

                return (
                    <ListItem
                        key={user.email}
                        draggable={!isEditing}
                        onDragStart={(e) => handleUserDragStart(e, user.email)}
                        onDragEnd={handleUserDragEnd}
                        sx={{
                            mb: 1,
                            border: "2px solid",
                            borderColor: canDropHere && dragOverUser === user.email
                                ? "success.main"
                                : dragOverUser === user.email
                                ? "primary.main"
                                : hasRole
                                ? primaryRoleColor
                                : "divider",
                            borderRadius: 1,
                            transition: "all 0.2s",
                            bgcolor: dragOverUser === user.email && canDropHere
                                ? "success.light"
                                : dragOverUser === user.email
                                ? "action.hover"
                                : hasRole
                                ? `${primaryRoleColor}10`
                                : "background.paper",
                            opacity: isDragging ? 0.5 : 1,
                            cursor: !isEditing ? "grab" : "default",
                            "&:active": {
                                cursor: !isEditing ? "grabbing" : "default",
                            },
                            "&:hover": {
                                bgcolor: hasRole
                                    ? `${primaryRoleColor}20`
                                    : "action.hover",
                            },
                            flexDirection: "column",
                            alignItems: "flex-start",
                        }}
                        onDragOver={(e) => handleDragOver(e, user.email)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, user.email)}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            <Avatar
                                sx={{
                                    mr: 2,
                                    bgcolor: primaryRoleColor,
                                }}
                            >
                                <PersonIcon />
                            </Avatar>
                            {isEditing ? (
                                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    <TextField
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={() => handleSaveEdit(user.email)}
                                        onKeyDown={(e) => handleKeyDown(e, user.email)}
                                        autoFocus
                                        size="small"
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            "& .MuiInputBase-input": {
                                                fontWeight: 500,
                                            },
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="body1"
                                        fontWeight={500}
                                        sx={{
                                            cursor: "pointer",
                                            "&:hover": {
                                                textDecoration: "underline",
                                            },
                                        }}
                                        onClick={() => handleStartEdit(user)}
                                    >
                                        {displayName}
                                    </Typography>
                                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                        {userLinkedEmails.map((linkedEmail) => {
                                            const linkedUser = allUsers.find((u) => u.email === linkedEmail);
                                            return (
                                                <Box 
                                                    key={linkedEmail}
                                                    sx={{ 
                                                        display: "flex", 
                                                        alignItems: "center", 
                                                        gap: 0.5,
                                                        pl: 1,
                                                    }}
                                                >
                                                    <Typography variant="body2" color="text.secondary">
                                                        {linkedEmail}
                                                        {linkedUser && ` (${linkedUser.name})`}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onUnlinkEmail(user.email, linkedEmail)}
                                                        sx={{
                                                            padding: "2px",
                                                            color: "warning.main",
                                                            "&:hover": {
                                                                bgcolor: "warning.light",
                                                                color: "white",
                                                            },
                                                        }}
                                                    >
                                                        <LinkOffIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            )}
                        </Box>
                        {hasRole && (
                            <Box sx={{ mt: 1, ml: 7, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                {userRolesList.map((role) => (
                                    <Box 
                                        key={role.id}
                                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                                    >
                                        <Chip
                                            label={role.name}
                                            size="small"
                                            sx={{
                                                bgcolor: role.color,
                                                color: "white",
                                                fontWeight: 600,
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => onRemoveRole(user.email, role.id)}
                                            sx={{
                                                color: "error.main",
                                                padding: "4px",
                                                "&:hover": {
                                                    bgcolor: "error.light",
                                                    color: "white",
                                                },
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </ListItem>
                );
            })}
        </List>
    );
};


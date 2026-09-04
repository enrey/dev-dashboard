import React, { useContext, useState, useCallback, useMemo } from "react";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Alert, Box, Button, CircularProgress, Container, Grid, Paper, Typography } from "@mui/material";

import { UsersList, RolesList, RolesFilter } from "./components";
import { useUsersPageState } from "./hooks/useUsersPageState";
import type { UserRole } from "shared/models";
import { useUsersData } from "../../contexts/data";

export const UsersPage: React.FC = () => {
    const { users } = useUsersData();

    // Используем хук для работы с сохраняемым состоянием
    const {
        roles,
        userRoles,
        userNames,
        linkedEmails,
        setRoles,
        setUserRoles,
        setUserNames,
        setLinkedEmails,
        isLoading,
        loadError,
        saveStatus,
        reload,
    } = useUsersPageState();

    // Фильтры
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [showWithoutRoles, setShowWithoutRoles] = useState(false);

    // Обработчик назначения роли пользователю
    const handleAssignRole = useCallback((userEmail: string, role: UserRole) => {
        setUserRoles((prev: Record<string, UserRole[]>) => {
            const currentRoles = prev[userEmail] || [];
            // Проверяем, есть ли уже такая роль
            const hasRole = currentRoles.some((r: UserRole) => r.id === role.id);
            if (hasRole) {
                return prev; // Роль уже назначена
            }
            return {
                ...prev,
                [userEmail]: [...currentRoles, role],
            };
        });
    }, [setUserRoles]);

    // Обработчик удаления роли у пользователя
    const handleRemoveRole = useCallback((userEmail: string, roleId: string) => {
        setUserRoles((prev: Record<string, UserRole[]>) => {
            const currentRoles = prev[userEmail] || [];
            const updatedRoles = currentRoles.filter((r: UserRole) => r.id !== roleId);
            
            if (updatedRoles.length === 0) {
                // Если ролей не осталось, удаляем запись
                const updated = { ...prev };
                delete updated[userEmail];
                return updated;
            }
            
            return {
                ...prev,
                [userEmail]: updatedRoles,
            };
        });
    }, [setUserRoles]);

    // Обработчик переключения фильтра по роли
    const handleToggleRole = useCallback((roleId: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        );
    }, []);

    // Обработчик переключения фильтра "Без ролей"
    const handleToggleWithoutRoles = useCallback(() => {
        setShowWithoutRoles((prev) => !prev);
    }, []);

    // Обработчик изменения имени пользователя
    const handleUpdateUserName = useCallback((userEmail: string, newName: string) => {
        setUserNames((prev: Record<string, string>) => ({
            ...prev,
            [userEmail]: newName,
        }));
    }, [setUserNames]);

    // Обработчик связывания пользователей
    const handleLinkUsers = useCallback((targetEmail: string, sourceEmail: string) => {
        if (targetEmail === sourceEmail) return;

        setLinkedEmails((prev: Record<string, string[]>) => {
            const targetLinked = prev[targetEmail] || [];
            // Если source уже связан с кем-то, переносим все его связи
            const sourceLinked = prev[sourceEmail] || [];
            
            const newLinked = {
                ...prev,
                [targetEmail]: [...targetLinked, sourceEmail, ...sourceLinked],
            };
            
            // Удаляем связи source пользователя
            delete newLinked[sourceEmail];
            
            return newLinked;
        });

        // Переносим роли source к target
        setUserRoles((prev: Record<string, UserRole[]>) => {
            const sourceRoles = prev[sourceEmail] || [];
            const targetRoles = prev[targetEmail] || [];
            
            if (sourceRoles.length > 0) {
                const updated = { ...prev };
                // Объединяем роли, убирая дубликаты
                const mergedRoles = [...targetRoles];
                sourceRoles.forEach((role: UserRole) => {
                    if (!mergedRoles.some((r: UserRole) => r.id === role.id)) {
                        mergedRoles.push(role);
                    }
                });
                updated[targetEmail] = mergedRoles;
                delete updated[sourceEmail];
                return updated;
            }
            return prev;
        });
    }, [setLinkedEmails, setUserRoles]);

    // Обработчик отсоединения email
    const handleUnlinkEmail = useCallback((parentEmail: string, emailToUnlink: string) => {
        setLinkedEmails((prev: Record<string, string[]>) => {
            const updated = { ...prev };
            const parentLinked = updated[parentEmail] || [];
            updated[parentEmail] = parentLinked.filter((email: string) => email !== emailToUnlink);
            
            // Если больше нет связанных email, удаляем запись
            if (updated[parentEmail].length === 0) {
                delete updated[parentEmail];
            }
            
            return updated;
        });
    }, [setLinkedEmails]);

    // Обработчик добавления новой роли
    const handleAddRole = useCallback((name: string, color: string) => {
        const newRole: UserRole = {
            id: `role_${Date.now()}`,
            name,
            color,
        };
        setRoles((prev: UserRole[]) => [...prev, newRole]);
    }, [setRoles]);

    // Обработчик удаления роли
    const handleDeleteRole = useCallback((roleId: string) => {
        setRoles((prev: UserRole[]) => prev.filter((role: UserRole) => role.id !== roleId));
        
        // Удаляем эту роль у всех пользователей
        setUserRoles((prev: Record<string, UserRole[]>) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((email) => {
                updated[email] = updated[email].filter((role: UserRole) => role.id !== roleId);
                // Если ролей не осталось, удаляем запись
                if (updated[email].length === 0) {
                    delete updated[email];
                }
            });
            return updated;
        });

        // Удаляем из фильтров
        setSelectedRoles((prev: string[]) => prev.filter((id: string) => id !== roleId));
    }, [setRoles, setUserRoles]);

    // Объединяем пользователей из источников с сохранёнными (у которых есть роли)
    const mergedUsers = useMemo(() => {
        const usersMap = new Map(users.map((u) => [u.email, u]));

        // Добавляем сохранённых пользователей с ролями, которых нет в текущей выборке
        Object.keys(userRoles).forEach((email) => {
            if (!usersMap.has(email)) {
                usersMap.set(email, {
                    email,
                    name: userNames[email] || email,
                    order: 1,
                });
            }
        });

        return [...usersMap.values()];
    }, [users, userRoles, userNames]);

    // Фильтрация пользователей
    const filteredUsers = useMemo(() => {
        // Получаем список всех связанных email'ов (которые не должны показываться отдельно)
        const allLinkedEmails = new Set<string>();
        Object.values(linkedEmails).forEach((emails) => {
            emails.forEach((email) => allLinkedEmails.add(email));
        });

        // Фильтруем пользователей, исключая связанных
        const availableUsers = mergedUsers.filter((user) => !allLinkedEmails.has(user.email));

        // Если не выбрано ни одного фильтра - показываем всех доступных
        if (selectedRoles.length === 0 && !showWithoutRoles) {
            return availableUsers;
        }

        return availableUsers.filter((user) => {
            const userRolesList = userRoles[user.email] || [];
            const hasRole = userRolesList.length > 0;

            // Если выбран фильтр "Без ролей"
            if (showWithoutRoles && !hasRole) {
                return true;
            }

            // Если выбраны конкретные роли
            if (selectedRoles.length > 0 && hasRole) {
                // Проверяем, есть ли хотя бы одна из выбранных ролей
                return userRolesList.some((role) => selectedRoles.includes(role.id));
            }

            return false;
        });
    }, [mergedUsers, userRoles, linkedEmails, selectedRoles, showWithoutRoles]);

    return (
        <Container
            sx={{
                bgcolor: "background.default",
                color: "text.primary",
                display: "flex",
                flexDirection: "column",
                minHeight: "100%",
                py: 3,
            }}
            maxWidth={false}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4">
                    Управление ролями пользователей
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 180 }}>
                        {saveStatus === "saving" && (
                            <>
                                <CircularProgress size={16} />
                                <Typography variant="caption">Сохранение...</Typography>
                            </>
                        )}
                        {saveStatus === "saved" && (
                            <>
                                <CheckCircleOutlineIcon color="success" fontSize="small" />
                                <Typography variant="caption">Сохранено</Typography>
                            </>
                        )}
                        {saveStatus === "error" && (
                            <>
                                <ErrorOutlineIcon color="error" fontSize="small" />
                                <Typography variant="caption">Ошибка сохранения</Typography>
                            </>
                        )}
                        {saveStatus === "idle" && isLoading && (
                            <>
                                <CircularProgress size={16} />
                                <Typography variant="caption">Загрузка...</Typography>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {loadError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={(
                        <Button color="inherit" size="small" onClick={() => void reload()}>
                            Повторить
                        </Button>
                    )}
                >
                    Не удалось загрузить данные с сервера. Проверьте соединение и попробуйте ещё раз.
                </Alert>
            )}

            {saveStatus === "error" && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Не удалось сохранить изменения. Проверьте соединение с сервером.
                </Alert>
            )}

            <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                {/* Колонка 1: Список пользователей с ролями */}
                <Grid item xs={12} md={8}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            height: "calc(100vh - 200px)",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Пользователи
                        </Typography>
                        <RolesFilter
                            roles={roles}
                            selectedRoles={selectedRoles}
                            showWithoutRoles={showWithoutRoles}
                            onToggleRole={handleToggleRole}
                            onToggleWithoutRoles={handleToggleWithoutRoles}
                        />
                        <Box sx={{ overflow: "auto", flexGrow: 1 }}>
                            <UsersList
                                users={filteredUsers}
                                userRoles={userRoles}
                                userNames={userNames}
                                linkedEmails={linkedEmails}
                                allUsers={users}
                                onRemoveRole={handleRemoveRole}
                                onUpdateUserName={handleUpdateUserName}
                                onLinkUsers={handleLinkUsers}
                                onUnlinkEmail={handleUnlinkEmail}
                            />
                        </Box>
                        <Box sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
                            <Typography variant="body2" color="text.secondary">
                                Всего: {filteredUsers.length}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Колонка 2: Доступные роли */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            height: "calc(100vh - 200px)",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Доступные роли
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                            Перетащите роль на пользователя, чтобы назначить её
                        </Typography>
                        <Box sx={{ overflow: "auto", flexGrow: 1 }}>
                            <RolesList 
                                roles={roles} 
                                onAssignRole={handleAssignRole}
                                onAddRole={handleAddRole}
                                onDeleteRole={handleDeleteRole}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

import React from "react";

import DeleteIcon from "@mui/icons-material/Delete";
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
} from "@mui/material";

import type { UserWithRole } from "../../models/UserWithRole.model";

interface UsersWithRolesProps {
    usersWithRoles: UserWithRole[];
    onRemoveRole: (userEmail: string) => void;
}

export const UsersWithRoles: React.FC<UsersWithRolesProps> = ({
    usersWithRoles,
    onRemoveRole,
}) => {
    if (usersWithRoles.length === 0) {
        return (
            <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    Роли ещё не назначены
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Перетащите роль на пользователя из левой колонки
                </Typography>
            </Box>
        );
    }

    return (
        <List>
            {usersWithRoles.map((user) => (
                <ListItem
                    key={user.email}
                    sx={{
                        mb: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "background.paper",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        "&:hover": {
                            bgcolor: "action.hover",
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <Avatar sx={{ mr: 2, bgcolor: user.role.color }}>
                            <PersonIcon />
                        </Avatar>
                        <ListItemText
                            primary={user.name}
                            secondary={user.email}
                            primaryTypographyProps={{
                                fontWeight: 500,
                            }}
                            sx={{ flexGrow: 1 }}
                        />
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => onRemoveRole(user.email)}
                            size="small"
                            sx={{
                                color: "error.main",
                                "&:hover": {
                                    bgcolor: "error.light",
                                    color: "white",
                                },
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ mt: 1, width: "100%" }}>
                        <Chip
                            label={user.role.name}
                            size="small"
                            sx={{
                                bgcolor: user.role.color,
                                color: "white",
                                fontWeight: 600,
                            }}
                        />
                    </Box>
                </ListItem>
            ))}
        </List>
    );
};


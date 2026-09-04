import React, { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { 
    List, 
    ListItem, 
    Chip, 
    Box, 
    Button, 
    TextField, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
} from "@mui/material";

import type { UserRole } from "shared/models";

interface RolesListProps {
    roles: UserRole[];
    onAssignRole: (userEmail: string, role: UserRole) => void;
    onAddRole: (name: string, color: string) => void;
    onDeleteRole: (roleId: string) => void;
}

export const RolesList: React.FC<RolesListProps> = ({ 
    roles, 
    onAssignRole,
    onAddRole,
    onDeleteRole
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleColor, setNewRoleColor] = useState("#1976d2");

    const predefinedColors = [
        "#1976d2", // blue
        "#2e7d32", // green
        "#ed6c02", // orange
        "#9c27b0", // purple
        "#d32f2f", // red
        "#0288d1", // light blue
        "#388e3c", // darker green
        "#f57c00", // darker orange
        "#7b1fa2", // darker purple
        "#c62828", // darker red
        "#00796b", // teal
        "#5d4037", // brown
    ];

    const handleDragStart = (event: React.DragEvent, role: UserRole) => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("application/json", JSON.stringify(role));
    };

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
        setNewRoleName("");
        setNewRoleColor("#1976d2");
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const handleSaveRole = () => {
        if (newRoleName.trim()) {
            onAddRole(newRoleName.trim(), newRoleColor);
            handleCloseDialog();
        }
    };

    React.useEffect(() => {
        const handleAssignRole = (event: Event) => {
            const customEvent = event as CustomEvent<{
                userEmail: string;
                role: UserRole;
            }>;
            const { userEmail, role } = customEvent.detail;
            onAssignRole(userEmail, role);
        };

        window.addEventListener("assignRole", handleAssignRole);

        return () => {
            window.removeEventListener("assignRole", handleAssignRole);
        };
    }, [onAssignRole]);

    return (
        <>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                fullWidth
                sx={{ mb: 2 }}
            >
                Добавить роль
            </Button>

            <List>
                {roles.map((role) => (
                    <ListItem
                        key={role.id}
                        sx={{
                            mb: 2,
                            display: "flex",
                            justifyContent: "center",
                            cursor: "grab",
                            "&:active": {
                                cursor: "grabbing",
                            },
                            px: 0,
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, role)}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 1.5,
                                border: "2px dashed",
                                borderColor: role.color,
                                borderRadius: 2,
                                bgcolor: `${role.color}15`,
                                width: "100%",
                                transition: "all 0.2s",
                                "&:hover": {
                                    bgcolor: `${role.color}25`,
                                    transform: "scale(1.02)",
                                },
                            }}
                        >
                            <DragIndicatorIcon sx={{ color: role.color }} />
                            <Chip
                                label={role.name}
                                sx={{
                                    bgcolor: role.color,
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                    flexGrow: 1,
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteRole(role.id);
                                }}
                                sx={{
                                    color: "error.main",
                                    padding: "4px",
                                    "&:hover": {
                                        bgcolor: "error.light",
                                        color: "white",
                                    },
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </ListItem>
                ))}
            </List>

            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Добавить новую роль</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Название роли"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            fullWidth
                            autoFocus
                            placeholder="Например: QA, Designer, PM..."
                        />
                        
                        <Box>
                            <Box sx={{ mb: 1, fontWeight: 500 }}>Выберите цвет:</Box>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(6, 1fr)",
                                    gap: 1,
                                }}
                            >
                                {predefinedColors.map((color) => (
                                    <Box
                                        key={color}
                                        onClick={() => setNewRoleColor(color)}
                                        sx={{
                                            width: "100%",
                                            paddingTop: "100%",
                                            bgcolor: color,
                                            borderRadius: 1,
                                            cursor: "pointer",
                                            border: newRoleColor === color ? "3px solid" : "2px solid",
                                            borderColor: newRoleColor === color ? "primary.main" : "divider",
                                            transition: "all 0.2s",
                                            "&:hover": {
                                                transform: "scale(1.1)",
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <TextField
                            label="Или введите свой цвет"
                            value={newRoleColor}
                            onChange={(e) => setNewRoleColor(e.target.value)}
                            fullWidth
                            placeholder="#1976d2"
                            InputProps={{
                                startAdornment: (
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            bgcolor: newRoleColor,
                                            borderRadius: 1,
                                            mr: 1,
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    />
                                ),
                            }}
                        />

                        {newRoleName && (
                            <Box sx={{ textAlign: "center" }}>
                                <Box sx={{ mb: 1, color: "text.secondary" }}>Предпросмотр:</Box>
                                <Chip
                                    label={newRoleName}
                                    sx={{
                                        bgcolor: newRoleColor,
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: "0.9rem",
                                    }}
                                />
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button 
                        onClick={handleSaveRole} 
                        variant="contained"
                        disabled={!newRoleName.trim()}
                    >
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};


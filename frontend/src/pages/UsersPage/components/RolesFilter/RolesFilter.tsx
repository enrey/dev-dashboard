import React from "react";

import {
    Box,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Chip,
    Divider,
} from "@mui/material";

import type { UserRole } from "shared/models";

interface RolesFilterProps {
    roles: UserRole[];
    selectedRoles: string[];
    showWithoutRoles: boolean;
    onToggleRole: (roleId: string) => void;
    onToggleWithoutRoles: () => void;
}

export const RolesFilter: React.FC<RolesFilterProps> = ({
    roles,
    selectedRoles,
    showWithoutRoles,
    onToggleRole,
    onToggleWithoutRoles,
}) => {
    return (
        <Box
            sx={{
                mb: 2,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
            }}
        >
            <FormGroup row sx={{ gap: 2 }}>
                {roles.map((role) => (
                    <FormControlLabel
                        key={role.id}
                        control={
                            <Checkbox
                                checked={selectedRoles.includes(role.id)}
                                onChange={() => onToggleRole(role.id)}
                                sx={{
                                    color: role.color,
                                    "&.Mui-checked": {
                                        color: role.color,
                                    },
                                }}
                            />
                        }
                        label={
                            <Chip
                                label={role.name}
                                size="small"
                                sx={{
                                    bgcolor: selectedRoles.includes(role.id)
                                        ? role.color
                                        : `${role.color}30`,
                                    color: selectedRoles.includes(role.id)
                                        ? "white"
                                        : "text.primary",
                                    fontWeight: selectedRoles.includes(role.id) ? 600 : 400,
                                }}
                            />
                        }
                    />
                ))}
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={showWithoutRoles}
                            onChange={onToggleWithoutRoles}
                            sx={{
                                color: "grey.500",
                                "&.Mui-checked": {
                                    color: "grey.700",
                                },
                            }}
                        />
                    }
                    label={
                        <Chip
                            label="Без ролей"
                            size="small"
                            sx={{
                                bgcolor: showWithoutRoles ? "grey.700" : "grey.300",
                                color: showWithoutRoles ? "white" : "text.primary",
                                fontWeight: showWithoutRoles ? 600 : 400,
                            }}
                        />
                    }
                />
            </FormGroup>
        </Box>
    );
};


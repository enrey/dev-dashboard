import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";

import {
    Container,
    Box,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Chip,
    Divider,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { Filter } from "shared/components";
import type { UserRole } from "shared/models";

import { UsersTable } from "./components/UsersTable";
import { useAggregatedData } from "../../contexts/data";
import { FilterContext } from "../../contexts/filter";
import { usersPageStorage } from "shared/services";
import styles from "./ActionsPage.module.scss";

export const ActionsPage: React.FC = () => {
    const { filter, setTableSort } = useContext(FilterContext);
    const { filteredDataSource } = useAggregatedData();
    const [searchParams, setSearchParams] = useSearchParams();
    const fromParam = searchParams.get("from");
    const [isReturningFromWorklog, setIsReturningFromWorklog] = useState(
        () => fromParam === "actions"
    );

    // Состояние для фильтра по ролям
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [rolesLoaded, setRolesLoaded] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [showWithoutRoles, setShowWithoutRoles] = useState(
        () => searchParams.get("noRoles") === "1"
    );

    // По умолчанию для страницы /actions сортируем сотрудников по алфавиту в столбце «Сотрудник».
    useEffect(() => {
        setTableSort({ order: "asc", orderBy: "displayName" });
    }, [setTableSort]);

    useEffect(() => {
        let isMounted = true;
        usersPageStorage
            .load()
            .then((state) => {
                if (isMounted) {
                    setRoles(state.roles);

                    // Инициализируем selectedRoles из query string (по названиям ролей)
                    const rolesParam = searchParams.get("roles");
                    if (rolesParam) {
                        const roleNames = rolesParam.split(",").filter(Boolean);
                        const validIds = roleNames
                            .map((name) => state.roles.find((r) => r.name === name))
                            .filter((r): r is UserRole => !!r)
                            .map((r) => r.id);
                        setSelectedRoles(validIds);
                    }
                    setRolesLoaded(true);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setRoles([]);
                    setRolesLoaded(true);
                }
            });

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Синхронизация selectedRoles и showWithoutRoles в query string
    useEffect(() => {
        if (!rolesLoaded) return;

        setSearchParams(
            (prev) => {
                const newParams = new URLSearchParams(prev);
                if (selectedRoles.length > 0) {
                    const roleNames = selectedRoles
                        .map((id) => roles.find((r) => r.id === id)?.name)
                        .filter(Boolean)
                        .join(",");
                    newParams.set("roles", roleNames);
                } else {
                    newParams.delete("roles");
                }
                if (showWithoutRoles) {
                    newParams.set("noRoles", "1");
                } else {
                    newParams.delete("noRoles");
                }
                return newParams;
            },
            { replace: true }
        );
    }, [selectedRoles, showWithoutRoles, rolesLoaded, setSearchParams]);

    const handleToggleRole = useCallback((roleId: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
        );
    }, []);

    const handleToggleWithoutRoles = useCallback(() => {
        setShowWithoutRoles((prev) => !prev);
    }, []);

    // ОПТИМИЗАЦИЯ: Мемоизация отфильтрованных данных для предотвращения лишних перерисовок таблицы
    const filteredData = useMemo(() => {
        return filteredDataSource(filter);
    }, [filteredDataSource, filter]);

    // Очищаем параметры поиска при возвращении на страницу действий
    useEffect(() => {
        if (fromParam === "actions") {
            setIsReturningFromWorklog(true);

            // Удаляем параметр 'from=actions' из URL
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.delete("from");
                return newParams;
            });
        }
    }, [fromParam, setSearchParams]);

    // Сбрасываем флаг после первого рендера
    useEffect(() => {
        if (isReturningFromWorklog) {
            const timer = setTimeout(() => {
                setIsReturningFromWorklog(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isReturningFromWorklog]);

    return (
        <Container
            className={styles.actionsPage}
            maxWidth={false}
            disableGutters
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "calc(100% + clamp(0.75rem, 1.5vw, var(--ds-space-5)))",
                minHeight: 0,
                minWidth: 0,
            }}
        >
            <Filter skipUrlSync={isReturningFromWorklog}>
                <Box className={styles.filterRow}>
                    <FormGroup row className={styles.roleGroup} sx={{ gap: 0.5 }}>
                        {roles.map((role) => (
                            <FormControlLabel
                                key={role.id}
                                sx={{ mr: 0.5 }}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={selectedRoles.includes(role.id)}
                                        onChange={() => handleToggleRole(role.id)}
                                        sx={{
                                            color: role.color,
                                            padding: "4px",
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
                                            height: 20,
                                            fontSize: "0.7rem",
                                            bgcolor: selectedRoles.includes(role.id)
                                                ? role.color
                                                : `${role.color}30`,
                                            color: selectedRoles.includes(role.id)
                                                ? "white"
                                                : "text.primary",
                                            fontWeight: selectedRoles.includes(role.id)
                                                ? 600
                                                : 400,
                                            "& .MuiChip-label": {
                                                padding: "0 6px",
                                            },
                                        }}
                                    />
                                }
                            />
                        ))}
                        <Divider
                            orientation="vertical"
                            flexItem
                            className={styles.roleFilterDivider}
                        />
                        <FormControlLabel
                            sx={{ mr: 0 }}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={showWithoutRoles}
                                    onChange={handleToggleWithoutRoles}
                                    sx={{
                                        color: "grey.500",
                                        padding: "4px",
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
                                        height: 20,
                                        fontSize: "0.7rem",
                                        bgcolor: showWithoutRoles
                                            ? "grey.700"
                                            : "grey.300",
                                        color: showWithoutRoles
                                            ? "white"
                                            : "text.primary",
                                        fontWeight: showWithoutRoles ? 600 : 400,
                                        "& .MuiChip-label": {
                                            padding: "0 6px",
                                        },
                                    }}
                                />
                            }
                        />
                    </FormGroup>
                </Box>
            </Filter>
            <UsersTable
                filter={filter}
                data={filteredData}
                selectedRoles={selectedRoles}
                showWithoutRoles={showWithoutRoles}
            />
        </Container>
    );
};

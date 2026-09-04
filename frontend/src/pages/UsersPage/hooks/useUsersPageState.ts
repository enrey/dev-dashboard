import { useState, useEffect, useCallback, useRef } from "react";

import { useUsersData } from "../../../contexts/data";
import type { UserRole } from "shared/models";
import { usersPageStorage } from "shared/services";

interface UseUsersPageStateReturn {
    roles: UserRole[];
    userRoles: Record<string, UserRole[]>;
    userNames: Record<string, string>;
    linkedEmails: Record<string, string[]>;
    isLoading: boolean;
    loadError: string | null;
    saveStatus: "idle" | "saving" | "saved" | "error";
    setRoles: React.Dispatch<React.SetStateAction<UserRole[]>>;
    setUserRoles: React.Dispatch<React.SetStateAction<Record<string, UserRole[]>>>;
    setUserNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setLinkedEmails: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    reload: () => Promise<void>;
}

const AUTOSAVE_DELAY = 1000; // 1 секунда
const SAVE_STATUS_RESET_DELAY = 2000;

/**
 * Хук для работы с состоянием страницы пользователей.
 * Автоматически загружает данные при монтировании и сохраняет при изменениях.
 */
export const useUsersPageState = (): UseUsersPageStateReturn => {
    const { users } = useUsersData();
    const [roles, setRolesState] = useState<UserRole[]>([]);
    const [userRoles, setUserRolesState] = useState<Record<string, UserRole[]>>({});
    const [userNames, setUserNamesState] = useState<Record<string, string>>({});
    const [linkedEmails, setLinkedEmailsState] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const isInitialLoadRef = useRef(true);
    const skipNextAutosaveRef = useRef(false);

    const loadState = useCallback(async () => {
        setIsLoading(true);
        try {
            const loadedState = await usersPageStorage.load();
            const error = usersPageStorage.getLoadError();

            if (error) {
                setLoadError(error);
                return;
            }

            setLoadError(null);
            skipNextAutosaveRef.current = true;
            setRolesState(loadedState.roles);
            setUserRolesState(loadedState.userRoles);
            setUserNamesState(loadedState.userNames);
            setLinkedEmailsState(loadedState.linkedEmails);
        } finally {
            isInitialLoadRef.current = false;
            setIsLoading(false);
        }
    }, []);

    // Загрузка данных при монтировании
    useEffect(() => {
        void loadState();
    }, [loadState]);

    // Синхронизация userNames с текущим списком пользователей
    useEffect(() => {
        if (users.length > 0 && !isInitialLoadRef.current) {
            setUserNamesState((prev) => {
                const updated = { ...prev };
                let hasChanges = false;
                // Добавляем всех пользователей, у которых ещё нет записи
                users.forEach((user) => {
                    if (!updated[user.email]) {
                        updated[user.email] = user.name;
                        hasChanges = true;
                    }
                });
                return hasChanges ? updated : prev;
            });
        }
    }, [users]);

    // Автосохранение при изменении состояния
    useEffect(() => {
        // Пропускаем первый рендер (начальную загрузку)
        if (isInitialLoadRef.current) {
            return;
        }

        if (skipNextAutosaveRef.current) {
            skipNextAutosaveRef.current = false;
            return;
        }

        // Очищаем предыдущий таймер
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Запускаем новый таймер для сохранения
        saveTimeoutRef.current = setTimeout(() => {
            setSaveStatus("saving");
            usersPageStorage
                .save({
                    roles,
                    userRoles,
                    userNames,
                    linkedEmails,
                    version: 1,
                })
                .then(() => {
                    setSaveStatus("saved");
                    if (saveStatusTimeoutRef.current) {
                        clearTimeout(saveStatusTimeoutRef.current);
                    }
                    saveStatusTimeoutRef.current = setTimeout(() => {
                        setSaveStatus("idle");
                    }, SAVE_STATUS_RESET_DELAY);
                })
                .catch(() => {
                    setSaveStatus("error");
                });
        }, AUTOSAVE_DELAY);

        // Очистка при размонтировании
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (saveStatusTimeoutRef.current) {
                clearTimeout(saveStatusTimeoutRef.current);
            }
        };
    }, [roles, userRoles, userNames, linkedEmails]);

    // Используем оригинальные сеттеры напрямую, они поддерживают функциональные обновления
    const setRoles = setRolesState;
    const setUserRoles = setUserRolesState;
    const setUserNames = setUserNamesState;
    const setLinkedEmails = setLinkedEmailsState;

    const reload = useCallback(async () => {
        await loadState();
    }, [loadState]);

    return {
        roles,
        userRoles,
        userNames,
        linkedEmails,
        isLoading,
        loadError,
        saveStatus,
        setRoles,
        setUserRoles,
        setUserNames,
        setLinkedEmails,
        reload,
    };
};

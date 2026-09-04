import type { UserPageState } from "shared/models";

import { UsersPageApiService } from "shared/api/users-page-api.service";

const INITIAL_STATE_VERSION = 1;

/**
 * Сервис для работы с хранилищем данных страницы пользователей.
 * Текущая реализация использует backend API.
 */
class UsersPageStorageService {
    private lastLoadError: string | null = null;
    private cachedState: UserPageState | null = null;
    private loadPromise: Promise<UserPageState> | null = null;
    private defaultState: UserPageState = {
        roles: [
            { id: "dev", name: "Dev", color: "#1976d2" },
            { id: "devops", name: "DevOps", color: "#2e7d32" },
            { id: "tester", name: "Tester", color: "#ed6c02" },
            { id: "analyst", name: "Analyst", color: "#9c27b0" },
            { id: "manager", name: "Manager", color: "#d32f2f" },
        ],
        userRoles: {},
        userNames: {},
        linkedEmails: {},
        version: INITIAL_STATE_VERSION,
    };

    /**
     * Загрузка состояния из backend
     */
    async load(): Promise<UserPageState> {
        if (this.cachedState) {
            return this.cachedState;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this.loadFromApi().finally(() => {
            this.loadPromise = null;
        });

        return this.loadPromise;
    }

    private async loadFromApi(): Promise<UserPageState> {
        try {
            const state = await UsersPageApiService.getState();
            this.lastLoadError = null;

            this.cachedState = state;
            return state;
        } catch (error) {
            console.error("Error loading users page state:", error);
            this.lastLoadError = error instanceof Error ? error.message : "Unknown error";
            return this.defaultState;
        }
    }

    /**
     * Сохранение состояния в backend
     */
    async save(state: UserPageState): Promise<void> {
        try {
            const toSave: UserPageState = {
                ...state,
                version: this.cachedState?.version ?? state.version ?? INITIAL_STATE_VERSION,
            };
            await UsersPageApiService.saveState(toSave);
            this.cachedState = toSave;
        } catch (error) {
            console.error("Error saving users page state:", error);
            throw error;
        }
    }

    /**
     * Частичное обновление состояния
     */
    async update(updates: Partial<UserPageState>): Promise<void> {
        try {
            const version = this.cachedState?.version ?? INITIAL_STATE_VERSION;
            const result = await UsersPageApiService.updateState({ ...updates, version });
            this.cachedState = this.cachedState
                ? { ...this.cachedState, ...updates, version: result.version }
                : null;
        } catch (error) {
            console.error("Error updating users page state:", error);
            throw error;
        }
    }

    /**
     * Миграция данных между версиями
     */
    private migrate(oldState: UserPageState): UserPageState {
        // В будущем здесь будет логика миграции
        console.warn("State migration is not implemented, using default state");
        return this.defaultState;
    }

    /**
     * Экспорт данных (для резервного копирования)
     */
    async export(): Promise<string> {
        const state = await this.load();
        return JSON.stringify(state, null, 2);
    }

    /**
     * Импорт данных (восстановление из резервной копии)
     */
    async import(data: string): Promise<boolean> {
        try {
            const parsed: UserPageState = JSON.parse(data);
            await this.save(parsed);
            return true;
        } catch (error) {
            console.error("Error importing users page state:", error);
            return false;
        }
    }

    getLoadError(): string | null {
        return this.lastLoadError;
    }

    hasCachedState(): boolean {
        return this.cachedState !== null;
    }
}

export const usersPageStorage = new UsersPageStorageService();

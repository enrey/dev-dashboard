/**
 * Unit-тест для хука useDataContext
 * Тестирует логику управления данными, преобразования и селекторы
 * Использует MSW для мокирования API запросов
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { useDataContext } from "../useDataContext";
import { InitialDataContext } from "../DataContext.model";
import { FilterContext } from "../../filter";
import { FilterData } from "../../../shared/components";
import { DatasourceStatusEnum } from "../../../shared/enums";
import { server } from '../../../mocks/server';
import { 
    mockGitAnalyzerInfo, 
    mockTasksData, 
    mockJiraUsers 
} from '../../../mocks/handlers';

// Mock данных - импортируются из handlers

const mockInitialData: InitialDataContext = {
    gitAnalyzerInfo: [],
    tasksData: [],
    jiraUsers: [],
    gitlabData: [],
    gitlabUsers: [],
    presenceUsers: [],
    gitlabMrComments: [],
    presence: [],
    gitTasksList: [],
    tasksStats: [],
    confluenceData: [],
};

// Mock FilterContext
const mockFilterContext = {
    filter: {
        dateStart: new Date("2024-01-01"),
        dateEnd: new Date("2024-01-31"),
        users: [],
        projects: [],
        sources: [],
        searchParamsString: "",
    } as FilterData,
    initFilter: {
        dateStart: new Date("2024-01-01"),
        dateEnd: new Date("2024-01-31"),
        users: [],
        projects: [],
        sources: [],
        searchParamsString: "",
    } as FilterData,
    tableSort: {
        order: "asc" as const,
        orderBy: "totalComments" as any,
    },
    chartTypes: [],
    setFilter: vi.fn(),
    setTableSort: vi.fn(),
    setChartTypes: vi.fn(),
};

// Wrapper для тестов с провайдерами
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <FilterContext.Provider value={mockFilterContext}>
                {children}
            </FilterContext.Provider>
        </QueryClientProvider>
    );
};

describe("useDataContext (с React Query и MSW)", () => {
    beforeEach(() => {
        // Очищаем sessionStorage перед каждым тестом
        sessionStorage.clear();
    });

    describe("Инициализация", () => {
        it("должен использовать данные из React Query хуков", async () => {
            // MSW автоматически вернет данные из handlers
            const { result } = renderHook(() => useDataContext(mockInitialData), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.tasksData.length).toBeGreaterThan(0);
                expect(result.current.gitAnalyzerInfo.length).toBeGreaterThan(0);
                expect(result.current.jiraUsers.length).toBeGreaterThan(0);
                expect(result.current.gitlabUsers.length).toBeGreaterThan(0);
                expect(result.current.confluenceData.length).toBeGreaterThan(0);
                expect(result.current.gitlabData.length).toBeGreaterThan(0);
                expect(result.current.presenceUsers.length).toBeGreaterThan(0);
                expect(result.current.gitlabMrComments.length).toBeGreaterThan(0);
                expect(result.current.presence.length).toBeGreaterThan(0);
            });
        });

        it("замапированное", async () => {
            const { result } = renderHook(() => useDataContext(mockInitialData), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.dataSource.length).toBeGreaterThan(0);
                expect(JSON.stringify(result.current.dataSource)).not.toMatch(
                    /it2g\.ru|172\.17\.44\.21|registry\.it2g/i
                );
            });
        });        

        it("должен возвращать все необходимые поля DataContextData", () => {
            const { result } = renderHook(() => useDataContext(mockInitialData), {
                wrapper: createWrapper(),
            });

            // Проверяем наличие всех полей из InitialDataContext
            expect(result.current).toHaveProperty("gitAnalyzerInfo");
            expect(result.current).toHaveProperty("tasksData");
            expect(result.current).toHaveProperty("jiraUsers");
            expect(result.current).toHaveProperty("gitlabData");
            expect(result.current).toHaveProperty("gitlabUsers");
            expect(result.current).toHaveProperty("presenceUsers");
            expect(result.current).toHaveProperty("gitlabMrComments");
            expect(result.current).toHaveProperty("presence");
            expect(result.current).toHaveProperty("gitTasksList");
            expect(result.current).toHaveProperty("tasksStats");
            expect(result.current).toHaveProperty("confluenceData");

            // Проверяем наличие селекторов
            expect(result.current).toHaveProperty("gitInfo");
            expect(result.current).toHaveProperty("users");
            expect(result.current).toHaveProperty("dataSource");
            expect(result.current).toHaveProperty("filteredDataSource");
            expect(result.current).toHaveProperty("projects");

            expect(result.current.dataSource).toBeDefined();
        });
    });
   

    describe("Интеграция с React Query и MSW", () => {
        it("должен загружать данные через API с помощью MSW", async () => {
            const { result } = renderHook(() => useDataContext(mockInitialData), {
                wrapper: createWrapper(),
            });

            // Проверяем, что данные загружаются через MSW
            await waitFor(() => {
                expect(result.current.gitAnalyzerInfo.length).toBeGreaterThan(0);
            });

            await waitFor(() => {
                expect(result.current.jiraUsers.length).toBeGreaterThan(0);
            });
        });
    });
});

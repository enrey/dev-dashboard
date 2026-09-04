import { DataContextData, InitialDataContext } from "./DataContext.model";
import { useAggregatedData } from "./hooks/useAggregatedData.hook";
import { useConfluenceData } from "./hooks/useConfluenceData.hook";
import { useGitData } from "./hooks/useGitData.hook";
import { useGitlabData } from "./hooks/useGitlabData.hook";
import { useJiraData } from "./hooks/useJiraData.hook";
import { usePresenceData } from "./hooks/usePresenceData.hook";
import { useUsersData } from "./hooks/useUsersData.hook";

/**
 * Хук для получения всех данных контекста
 * Использует доменные хуки для оптимизации производительности
 * Сохраняет обратную совместимость с существующим кодом
 */
export const useDataContext = (_props: InitialDataContext): DataContextData => {
    // Используем доменные хуки
    const { users } = useUsersData();
    const { gitAnalyzerInfo, gitTasksList, gitInfo, projects } = useGitData();
    const { tasksData, jiraUsers, tasksStats } = useJiraData();
    const { gitlabData, gitlabUsers, gitlabMrComments } = useGitlabData();
    const { confluenceData } = useConfluenceData();
    const { presence, presenceUsers } = usePresenceData();
    const { dataSource, filteredDataSource } = useAggregatedData();

    // Объединяем все данные в один объект для обратной совместимости
    return {
        gitAnalyzerInfo,
        tasksData,
        jiraUsers,
        gitlabData,
        gitlabUsers,
        presenceUsers,
        gitlabMrComments,
        presence,
        gitTasksList,
        tasksStats,
        confluenceData,
        gitInfo,
        users,
        dataSource,
        filteredDataSource,
        projects,
    };
};

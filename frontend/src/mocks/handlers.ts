/**
 * MSW обработчики для мокирования API запросов
 */
import { http, HttpResponse } from 'msw';
import type { UserPageState } from "shared/models";

// Импортируем моковые данные из JSON файлов в каталоге data
import confluenceStatsData from './data/confluenceStats.json';
import gitAnalyzerInfoData from './data/gitAnalyzerInfo.json';
import gitlabMrCommentsData from './data/gitlabMrComments.json';
import gitlabStatsData from './data/gitlabStats.json';
import gitlabUsersData from './data/gitlabUsers.json';
import gitTasksDataFile from './data/gitTasksData.json';
import jiraStatsData from './data/jiraStats.json';
import jiraUsersData from './data/jiraUsers.json';
import jobsStatusData from './data/jobsStatus.json';
import presenceStatsData from './data/presenceStats.json';
import presenceUsersData from './data/presenceUsers.json';
import tasksStatsData from './data/tasksStats.json';
import usersPageStateData from './data/usersPageState.json';

// Экспортируем данные для использования в тестах
// Извлекаем массивы из обёртки {json: [...]}
export const mockGitAnalyzerInfo = (gitAnalyzerInfoData as any).json || gitAnalyzerInfoData;
export const mockTasksData = (jiraStatsData as any).json || jiraStatsData;
export const mockJiraUsers = (jiraUsersData as any).json || jiraUsersData;
export const mockGitTasksData = (gitTasksDataFile as any).json || gitTasksDataFile;
export const mockGitlabStats = (gitlabStatsData as any).json || gitlabStatsData;
export const mockGitlabUsers = (gitlabUsersData as any).json || gitlabUsersData;
export const mockGitlabMrComments = (gitlabMrCommentsData as any).json || gitlabMrCommentsData;
export const mockPresenceStats = (presenceStatsData as any).json || presenceStatsData;
export const mockPresenceUsers = (presenceUsersData as any).json || presenceUsersData;
export const mockConfluenceStats = (confluenceStatsData as any).json || confluenceStatsData;
export const mockTasksStats = (tasksStatsData as any).json || tasksStatsData;
export const mockJobsStatus = (jobsStatusData as any).json || jobsStatusData;

const initialUserPageState = ((usersPageStateData as any).json || usersPageStateData) as UserPageState;
let demoUserPageState: UserPageState = initialUserPageState;

/**
 * Обработчики MSW для API endpoints
 * Используем wildcard паттерны для гибкости
 * MSW автоматически игнорирует query параметры при сопоставлении путей
 */
export const handlers = [
    // Git Analyzer Info
    http.get('*/api/Git/commits', () => {
        return HttpResponse.json(mockGitAnalyzerInfo);
    }),

    // Git Tasks Data
    http.get('*/api/Git/tasks', () => {
        return HttpResponse.json(mockGitTasksData);
    }),

    // Jira Stats
    http.get('*/api/Jira/tasks', () => {
        return HttpResponse.json(mockTasksData);
    }),

    // Jira Users
    http.get('*/api/Jira/users', () => {
        return HttpResponse.json(mockJiraUsers);
    }),

    // GitLab Stats (merge requests)
    http.get('*/api/GitLab/merge-requests', () => {
        return HttpResponse.json(mockGitlabStats);
    }),

    // GitLab Users
    http.get('*/api/GitLab/gitlabUsers', () => {
        return HttpResponse.json(mockGitlabUsers);
    }),

    // GitLab Comments
    http.get('*/api/GitLab/comments', () => {
        return HttpResponse.json(mockGitlabMrComments);
    }),

    // Presence Stats
    http.get('*/api_v2/integration/presence', () => {
        return HttpResponse.json(mockPresenceStats);
    }),

    // Presence Users
    http.get('*/api_v2/integration/users', () => {
        return HttpResponse.json(mockPresenceUsers);
    }),

    // Confluence Stats (articles)
    http.get('*/api/Confluence/articles', () => {
        return HttpResponse.json(mockConfluenceStats);
    }),

    // Tasks Stats
    http.get('*/api/GitLab/tasks/:dateStart/:dateEnd', () => {
        return HttpResponse.json(mockTasksStats);
    }),

    http.get('*/api/users-page/state', () => {
        return HttpResponse.json(demoUserPageState);
    }),

    http.post('*/api/users-page/state', async ({ request }) => {
        demoUserPageState = await request.json() as UserPageState;
        return HttpResponse.json({ success: true, version: demoUserPageState.version });
    }),

    http.patch('*/api/users-page/state', async ({ request }) => {
        const updates = await request.json() as Partial<UserPageState>;
        demoUserPageState = {
            ...demoUserPageState,
            ...updates,
            version: demoUserPageState.version + 1,
        };
        return HttpResponse.json({ success: true, version: demoUserPageState.version });
    }),

    http.delete('*/api/users-page/state', () => {
        demoUserPageState = initialUserPageState;
        return new HttpResponse(null, { status: 204 });
    }),

    http.get('*/api/users-page/state/exists', () => {
        return HttpResponse.json({ exists: true });
    }),

    http.get('*/api/jobs/list', () => {
        return HttpResponse.json(mockJobsStatus);
    }),
];

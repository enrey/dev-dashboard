import { useContext, useMemo } from "react";

import orderBy from "lodash/orderBy";

import {
    useGitAnalyzerInfo,
    useJiraStats,
    useJiraUsers,
    useGitlabStats,
    useGitlabMrComments,
    useConfluenceStats,
} from "shared/hooks";
import { ChartUser, GitAnalyzerInfoModel, JiraInfoItem, JiraUserInfo, GitlabInfo, GitlabCommentModel, ConfluenceInfo } from "shared/models";
import { formatCorrectDate } from "shared/utils";

import { FilterContext } from "../../filter";
import { mapConfluenceDataToUsers } from "../../mappers/mapConfluenceDataToUsers";
import { mapGitAnalyzerFlatDataToGitUsers } from "../../mappers/mapGitAnalyzerFlatDataToGitUsers";

/**
 * Создает индексы для быстрого поиска пользователей по различным источникам данных
 */
const createUserIndexes = (
    jiraUsers: JiraUserInfo[],
    gitAnalyzerInfo: GitAnalyzerInfoModel[],
    tasksData: JiraInfoItem[],
    gitlabData: GitlabInfo[],
    gitlabMrComments: GitlabCommentModel[],
    confluenceData: ConfluenceInfo[]
) => {
    return {
        jiraUsersMap: new Map(jiraUsers.map((user) => [user.email.toLowerCase(), user])),
        emailsWithGitData: new Set(gitAnalyzerInfo.map((item) => item.email)),
        emailsWithTasksData: new Set(tasksData.map((task) => task.changerEmail)),
        emailsWithGitlabData: new Set(gitlabData.map((item) => item.email.toLowerCase())),
        emailsWithGitlabComments: new Set(gitlabMrComments.map((comment) => comment.email)),
        emailsWithConfluenceData: new Set(confluenceData.map((item) => item.changer.toLowerCase())),
    };
};

/**
 * Объединяет пользователей из разных источников (Git, Confluence, Jira)
 */
const mergeUserSources = (
    gitAnalyzerInfo: GitAnalyzerInfoModel[],
    confluenceData: ConfluenceInfo[],
    jiraUsers: JiraUserInfo[],
    jiraUsersMap: Map<string, JiraUserInfo>
) => {
    const gitUsersMap = mapGitAnalyzerFlatDataToGitUsers(gitAnalyzerInfo);
    const confluenceUsersMap = mapConfluenceDataToUsers(confluenceData);

    // Объединяем Git и Confluence пользователей правильно - Git имеет приоритет
    const allExistingUsers = new Map<string, ChartUser>();

    // Сначала добавляем Git пользователей
    gitUsersMap.forEach((user, email) => {
        allExistingUsers.set(email, user);
    });

    // Затем добавляем Confluence пользователей только если их еще нет
    confluenceUsersMap.forEach((user, email) => {
        if (!allExistingUsers.has(email)) {
            allExistingUsers.set(email, user);
        }
    });

    const filteredJiraUsers = jiraUsers
        .filter((o) => {
            const email = o.email?.toLowerCase()?.trim();
            // Проверяем что email валидный и пользователь еще не добавлен
            return email && email.length > 0 && email.includes("@") && !allExistingUsers.has(email);
        })
        .map((a) => ({
            order: 1,
            email: a.email.toLowerCase().trim(),
            name: a.displayName,
        }));

    return { allExistingUsers, filteredJiraUsers };
};

/**
 * Исправляет имена пользователей, заменяя латиницу на кириллицу из Jira
 */
const fixLatinNames = (users: ChartUser[], jiraUsersMap: Map<string, JiraUserInfo>) => {
    return users.map((user) => {
        const regex = /^[a-zA-Z]+/g;
        let name = user.name;
        if (user.name.match(regex)) {
            // Используем jiraUsersMap для O(1) поиска
            name = jiraUsersMap.get(user.email)?.displayName || user.name;
        }
        return { ...user, name };
    });
};

/**
 * Фильтрует пользователей, оставляя только тех, у кого есть данные в источниках
 */
const filterActiveUsers = (
    users: ChartUser[],
    emailsWithGitData: Set<string>,
    emailsWithTasksData: Set<string>,
    emailsWithGitlabData: Set<string>,
    emailsWithGitlabComments: Set<string>,
    emailsWithConfluenceData: Set<string>
) => {
    return users.filter((user) => {
        const emailLower = user.email.toLowerCase();
        return (
            emailsWithGitData.has(user.email) ||
            emailsWithTasksData.has(user.email) ||
            emailsWithGitlabData.has(emailLower) ||
            emailsWithGitlabComments.has(user.email) ||
            emailsWithConfluenceData.has(emailLower)
        );
    });
};

export interface UseUsersDataReturn {
    users: ChartUser[];
    jiraUsers: JiraUserInfo[];
}

/**
 * Хук для получения данных пользователей из различных источников
 */
export const useUsersData = (): UseUsersDataReturn => {
    const { filter } = useContext(FilterContext);

    const dateStart = formatCorrectDate(filter.dateStart);
    const dateEnd = formatCorrectDate(filter.dateEnd);

    // Запросы через React Query
    const { data: gitAnalyzerInfo = [] } = useGitAnalyzerInfo({ dateStart, dateEnd });
    const { data: tasksData = [] } = useJiraStats({ dateStart, dateEnd });
    const { data: jiraUsers = [] } = useJiraUsers();
    const { data: gitlabData = [] } = useGitlabStats({ dateStart, dateEnd });
    const { data: gitlabMrComments = [] } = useGitlabMrComments({ dateStart, dateEnd });
    const { data: confluenceData = [] } = useConfluenceStats({ dateStart, dateEnd });

    const users = useMemo(() => {
        // Создаем индексы для быстрого поиска
        const {
            jiraUsersMap,
            emailsWithGitData,
            emailsWithTasksData,
            emailsWithGitlabData,
            emailsWithGitlabComments,
            emailsWithConfluenceData,
        } = createUserIndexes(jiraUsers, gitAnalyzerInfo, tasksData, gitlabData, gitlabMrComments, confluenceData);

        // Объединяем пользователей из разных источников
        const { allExistingUsers, filteredJiraUsers } = mergeUserSources(
            gitAnalyzerInfo,
            confluenceData,
            jiraUsers,
            jiraUsersMap
        );

        // Исправляем имена на латинице
        const correctedNamesUsers = fixLatinNames([...allExistingUsers.values()], jiraUsersMap);

        // Объединяем всех пользователей
        const allUsers = [...correctedNamesUsers, ...filteredJiraUsers];

        // Фильтруем пользователей с данными
        const filteredAllUsers = filterActiveUsers(
            allUsers,
            emailsWithGitData,
            emailsWithTasksData,
            emailsWithGitlabData,
            emailsWithGitlabComments,
            emailsWithConfluenceData
        );

        const result = orderBy(filteredAllUsers, [(user) => user.email], ["asc"]);

        return result;
    }, [gitAnalyzerInfo, jiraUsers, confluenceData, tasksData, gitlabData, gitlabMrComments]);

    return {
        users,
        jiraUsers,
    };
};


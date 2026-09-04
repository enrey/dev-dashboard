import { GitAnalyzerChartData } from "shared/models";

/**
 * Схлопывает данные связанных пользователей
 * @param data - исходные данные пользователей
 * @param linkedEmails - карта связанных email (основной -> [связанные])
 * @returns данные со схлопнутыми связанными пользователями
 */
export const collapseLinkedUsers = (
    data: GitAnalyzerChartData[],
    linkedEmails: Record<string, string[]>
): GitAnalyzerChartData[] => {
    // Создаем Set всех связанных email, которые не должны отображаться отдельно
    const linkedEmailsSet = new Set<string>();
    Object.values(linkedEmails).forEach((emails) => {
        emails.forEach((email) => linkedEmailsSet.add(email.toLowerCase()));
    });

    // Создаем карту данных по email для быстрого доступа
    const dataByEmail = new Map<string, GitAnalyzerChartData>();
    data.forEach((item) => {
        dataByEmail.set(item.user.email.toLowerCase(), item);
    });

    const result: GitAnalyzerChartData[] = [];

    data.forEach((item) => {
        const email = item.user.email.toLowerCase();

        // Пропускаем связанные email - они будут объединены с основным
        if (linkedEmailsSet.has(email)) {
            return;
        }

        // Проверяем, есть ли у этого пользователя связанные email
        const linked = linkedEmails[email] || [];

        if (linked.length === 0) {
            // Нет связанных - просто добавляем
            result.push(item);
            return;
        }

        // Есть связанные - объединяем данные
        const linkedData = linked
            .map((linkedEmail) => dataByEmail.get(linkedEmail.toLowerCase()))
            .filter((data): data is GitAnalyzerChartData => data !== undefined);

        if (linkedData.length === 0) {
            // Связанные email есть, но для них нет данных
            result.push(item);
            return;
        }

        // Объединяем статистику
        const merged: GitAnalyzerChartData = {
            ...item,
            // Объединяем числовые показатели
            totalCommits: item.totalCommits + linkedData.reduce((sum, d) => sum + d.totalCommits, 0),
            totalAdded: item.totalAdded + linkedData.reduce((sum, d) => sum + d.totalAdded, 0),
            totalDeleted: item.totalDeleted + linkedData.reduce((sum, d) => sum + d.totalDeleted, 0),
            totalChurn: item.totalChurn + linkedData.reduce((sum, d) => sum + d.totalChurn, 0),
            totalChangedFiles: item.totalChangedFiles + linkedData.reduce((sum, d) => sum + d.totalChangedFiles, 0),
            allIssues: item.allIssues + linkedData.reduce((sum, d) => sum + d.allIssues, 0),
            bugsIssues: item.bugsIssues + linkedData.reduce((sum, d) => sum + d.bugsIssues, 0),
            mrOpened: item.mrOpened + linkedData.reduce((sum, d) => sum + d.mrOpened, 0),
            mrMerged: item.mrMerged + linkedData.reduce((sum, d) => sum + d.mrMerged, 0),
            totalComments: item.totalComments + linkedData.reduce((sum, d) => sum + d.totalComments, 0),
            totalConfluenceChurn: item.totalConfluenceChurn + linkedData.reduce((sum, d) => sum + d.totalConfluenceChurn, 0),
            totalUniqConfluence: item.totalUniqConfluence + linkedData.reduce((sum, d) => sum + d.totalUniqConfluence, 0),
            totalDailyMessages: item.totalDailyMessages + linkedData.reduce((sum, d) => sum + d.totalDailyMessages, 0),

            // Объединяем массивы
            gitStatistics: [
                ...item.gitStatistics,
                ...linkedData.flatMap((d) => d.gitStatistics),
            ],

            // Объединяем проекты (уникальные)
            totalProjects: [
                ...new Set([
                    ...item.totalProjects,
                    ...linkedData.flatMap((d) => d.totalProjects),
                ]),
            ],

            // Объединяем источники данных (уникальные)
            dataSources: [
                ...new Set([
                    ...item.dataSources,
                    ...linkedData.flatMap((d) => d.dataSources),
                ]),
            ],

            // Объединяем churn данные
            churn: [
                ...item.churn,
                ...linkedData.flatMap((d) => d.churn),
            ],

            // Объединяем задачи
            tasks: [
                ...item.tasks,
                ...linkedData.flatMap((d) => d.tasks),
            ],

            // Объединяем gitlab статистику (берем первую доступную)
            gitlabStatistics: item.gitlabStatistics || linkedData.find((d) => d.gitlabStatistics)?.gitlabStatistics,

            // Объединяем gitlab комментарии
            gitlabCommentsStatistics: {
                email: item.gitlabCommentsStatistics.email || item.user.email,
                username: item.gitlabCommentsStatistics.username || item.login || linkedData.find((d) => d.gitlabCommentsStatistics.username)?.gitlabCommentsStatistics.username || "",
                totalComments: item.gitlabCommentsStatistics.totalComments + linkedData.reduce((sum, d) => sum + d.gitlabCommentsStatistics.totalComments, 0),
                items: [
                    ...item.gitlabCommentsStatistics.items,
                    ...linkedData.flatMap((d) => d.gitlabCommentsStatistics.items),
                ],
            },

            // Объединяем URL (берем первый доступный)
            gitUrl: item.gitUrl || linkedData.find((d) => d.gitUrl)?.gitUrl || "",
            jiraUrl: item.jiraUrl || linkedData.find((d) => d.jiraUrl)?.jiraUrl || "",
            login: item.login || linkedData.find((d) => d.login)?.login || "",

            // Объединяем presence
            presence: [
                ...(item.presence || []),
                ...linkedData.flatMap((d) => d.presence || []),
            ],

            // Объединяем confluence
            confluence: [
                ...(item.confluence || []),
                ...linkedData.flatMap((d) => d.confluence || []),
            ],
        };

        result.push(merged);
    });

    return result;
};


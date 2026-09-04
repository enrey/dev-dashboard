import { JiraInfoItem } from "shared/models";

/**
 * Дедуплицирует Jira задачи по номеру задачи для Git страницы
 * Группирует задачи по issueNumber и создает одну запись для каждой уникальной задачи
 */
export const dedupGitJiraTasks = (tasks: JiraInfoItem[]): JiraInfoItem[] => {
    const groupedByIssueNumber = new Map<string, JiraInfoItem[]>();

    // Группируем задачи по issueNumber
    tasks.forEach(task => {
        const key = task.issueNumber;
        if (!groupedByIssueNumber.has(key)) {
            groupedByIssueNumber.set(key, []);
        }
        groupedByIssueNumber.get(key)!.push(task);
    });

    const result: JiraInfoItem[] = [];

    // Для каждого уникального номера задачи берем первую задачу как представитель
    groupedByIssueNumber.forEach((tasksOfIssue, issueNumber) => {
        if (tasksOfIssue.length === 0) return;

        // Берем первую задачу как базовую, но обновляем информацию о статусе
        // чтобы показать все статусы, через которые прошла задача
        const firstTask = tasksOfIssue[0];

        // Собираем все уникальные статусы
        const allStatuses = Array.from(new Set([
            ...tasksOfIssue.map(t => t.statusFrom).filter(s => s !== null && s !== ''),
            ...tasksOfIssue.map(t => t.statusTo).filter(s => s !== null && s !== '')
        ]));

        // Создаем обновленную задачу с информацией о всех статусах
        const dedupedTask: JiraInfoItem = {
            ...firstTask,
            // Обновляем statusTo, чтобы показать финальный статус
            statusTo: allStatuses.length > 1
                ? `${allStatuses[0]} → ${allStatuses[allStatuses.length - 1]}`
                : firstTask.statusTo
        };

        result.push(dedupedTask);
    });

    return result;
};

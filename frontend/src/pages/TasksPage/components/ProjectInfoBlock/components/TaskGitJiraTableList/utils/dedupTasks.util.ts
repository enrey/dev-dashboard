import { TaskChangeType } from "shared/enums";

import { HistoryTaskColor } from "../models";

export interface DedupedTask {
    issueNumber: string;
    issueUrl: string;
    issueName: string;
    project: string;
    issueType: any;
    changeType: TaskChangeType;
    changerEmail: string;
    date: string;
    selfColor: string;
    // Для Status изменений
    statuses?: string[];
    // Для Description изменений
    descriptionChangesCount?: number;
}

/**
 * Дедуплицирует задачи по номеру задачи и типу изменения
 */
export const dedupTasks = (tasks: HistoryTaskColor[]): DedupedTask[] => {
    const groupedByIssueAndType = new Map<string, Map<TaskChangeType, HistoryTaskColor[]>>();

    // Группируем задачи по issueNumber и changeType
    tasks.forEach(task => {
        const key = task.issueNumber;
        if (!groupedByIssueAndType.has(key)) {
            groupedByIssueAndType.set(key, new Map());
        }
        const typeMap = groupedByIssueAndType.get(key)!;
        if (!typeMap.has(task.changeType)) {
            typeMap.set(task.changeType, []);
        }
        typeMap.get(task.changeType)!.push(task);
    });

    const result: DedupedTask[] = [];

    // Обрабатываем каждую группу
    groupedByIssueAndType.forEach((typeMap, issueNumber) => {
        typeMap.forEach((tasksOfType, changeType) => {
            if (tasksOfType.length === 0) return;

            // Берем данные из первой задачи как базовые
            const firstTask = tasksOfType[0];

            if (changeType === TaskChangeType.Status) {
                // Собираем все уникальные статусы
                const statuses = Array.from(new Set(
                    tasksOfType
                        .map(t => t.statusTo)
                        .filter(status => status !== null && status !== undefined)
                        .concat(
                            tasksOfType
                                .map(t => t.statusFrom)
                                .filter(status => status !== null && status !== undefined)
                        )
                )).filter(status => status.trim() !== '');

                result.push({
                    issueNumber,
                    issueUrl: firstTask.issueUrl,
                    issueName: firstTask.issueName,
                    project: firstTask.project,
                    issueType: firstTask.issueType,
                    changeType,
                    changerEmail: firstTask.changerEmail,
                    date: firstTask.date,
                    selfColor: firstTask.selfColor,
                    statuses
                });
            } else if (changeType === TaskChangeType.Description) {
                result.push({
                    issueNumber,
                    issueUrl: firstTask.issueUrl,
                    issueName: firstTask.issueName,
                    project: firstTask.project,
                    issueType: firstTask.issueType,
                    changeType,
                    changerEmail: firstTask.changerEmail,
                    date: firstTask.date,
                    selfColor: firstTask.selfColor,
                    descriptionChangesCount: tasksOfType.length
                });
            }
        });
    });

    return result;
};

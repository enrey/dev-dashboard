import { compareAsc } from "date-fns";

import { TaskChangeType } from "shared/enums";
import { JiraInfoItem } from "shared/models";

export const getLastTaskData = (tasksData: JiraInfoItem[]): JiraInfoItem[] => {
    let lastTaskData: JiraInfoItem[] = [];

    /**
     * Получаем последнюю запись изменения в задаче
     */
    tasksData
        .filter((task) => task.changeType === TaskChangeType.Status)
        .forEach((task) => {
            const index = lastTaskData.findIndex(
                (i) => i.issueNumber === task.issueNumber
            );
            if (index === -1) {
                lastTaskData = [...lastTaskData, task];
                return;
            }
            const compareDate = compareAsc(
                new Date(lastTaskData[index].date),
                new Date(task.date)
            );
            if (compareDate === -1) {
                lastTaskData[index] = task;
            }
        });
    /**
     * Добавляем историю по всем оставшимся таскам
     */
    lastTaskData = lastTaskData.map((task) => {
        const taskHistory = tasksData.filter((t) => t.issueNumber === task.issueNumber);
        return { ...task, history: taskHistory };
    });

    return lastTaskData;
};

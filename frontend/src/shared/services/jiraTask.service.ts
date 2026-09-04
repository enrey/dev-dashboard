import { TaskChangeType, TaskType } from "shared/enums";
import { CombinedJiraTask, JiraInfoItem } from "shared/models";

export class JiraTaskService {
    public static bugsInTasks(tasks: CombinedJiraTask[]): CombinedJiraTask[] {
        if (tasks.length === 0) return [];
        return tasks.filter((o) => o.issueType === TaskType.Bug);
    }

    /**
     * Объединение задач в единый массив с номером задачи, её ссылкой и всеми статусами
     */
    public static combineTask(tasks: JiraInfoItem[]): CombinedJiraTask[] {
        const combineArray: CombinedJiraTask[] = [];
        const filteredTask = tasks.filter(
            ({ changeType }) => changeType === TaskChangeType.Status
        );
        filteredTask.forEach((task) => {
            const { statusTo, statusFrom, issueNumber, issueUrl, issueType } = task;
            const status = { statusTo: statusTo!, statusFrom: statusFrom! };
            const index = combineArray.findIndex(
                (combineTask) => combineTask.issueNumber === issueNumber
            );
            if (index !== -1) {
                combineArray[index].status = [...combineArray[index].status, status];
                return;
            }
            combineArray.push({ issueNumber, status: [status], issueUrl, issueType });
        });
        return combineArray;
    }
}

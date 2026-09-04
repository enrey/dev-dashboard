import { GitJiraTaskItem } from "shared/models";

export const getProjectNameFromJiraTasks = (task: GitJiraTaskItem) =>
    task?.number.slice(0, task.number.lastIndexOf("-"));

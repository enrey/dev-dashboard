import { JiraInfoItem } from "shared/models";

export const getProjectsList = (tasksData: JiraInfoItem[]): string[] => {
    const projectListFromTasksData: string[] = tasksData.map((task) => task.project);

    const projectListObject = new Set(projectListFromTasksData);
    const uniqProjectList = [...projectListObject];
    return uniqProjectList;
};

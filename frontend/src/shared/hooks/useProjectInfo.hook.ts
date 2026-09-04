import { useContext } from "react";

import { MainTaskStatus, TaskType } from "shared/enums";
import { TotalNumberTasksModel } from "shared/models";
import { getProjectsList } from "shared/utils";

import { useJiraData } from "../../contexts/data";
import { FilterContext } from "../../contexts/filter";

export const useProjectsInfo = () => {
    const { filter } = useContext(FilterContext);
    const { tasksData } = useJiraData();
    const { users: usersFromFilter, projects: projectsFromFilter } = filter;

    const getInfoByProjectName = (projectName: string) => {
        const parsedUsersEmailToStringListName = usersFromFilter.map(
            (user) => user.email
        );

        let projectTasksList = tasksData.filter(
            (task) =>
                task.project === projectName && task.statusTo !== MainTaskStatus.Closed
        );

        // Фильтрация по именам
        if (parsedUsersEmailToStringListName.length) {
            projectTasksList = projectTasksList.filter((task) =>
                parsedUsersEmailToStringListName.includes(task.changerEmail)
            );
        }

        const total = projectTasksList.filter(
            (task) => task.statusTo !== MainTaskStatus.Closed
        ).length;

        const bugsQuantity = projectTasksList.filter(
            (task) =>
                task.issueType === TaskType.Bug && task.statusTo !== MainTaskStatus.Closed
        ).length;

        const featuresQuantity = projectTasksList.filter(
            (task) =>
                (task.issueType === TaskType.NewFeature ||
                    task.issueType === TaskType.Improvement) &&
                task.statusTo !== MainTaskStatus.Closed
        ).length;

        const subtasksQuantity = projectTasksList.filter(
            (task) =>
                task.issueType !== TaskType.Bug &&
                task.issueType !== TaskType.Improvement &&
                task.issueType !== TaskType.NewFeature &&
                task.statusTo !== MainTaskStatus.Closed
        ).length;

        const totalNumberTasks: TotalNumberTasksModel = {
            total,
            bugsQuantity,
            subtasksQuantity,
            featuresQuantity,
        };

        const projectInfo = {
            projectTasksList,
            totalNumberTasks,
        };

        return projectInfo;
    };

    let projectListInfo = getProjectsList(tasksData).map((name) => ({
        name,
        info: getInfoByProjectName(name),
    }));

    // Фильтрация по проектам
    if (projectsFromFilter.length) {
        projectListInfo = projectsFromFilter.map((name) => ({
            name,
            info: getInfoByProjectName(name),
        }));
    }

    return {
        projectListInfo,
        projectList: getProjectsList(tasksData),
    };
};

import { TaskType } from "shared/enums";

import {
    CommonTaskType,
    ProjectInformationModel,
    TaskWithMrAndJiraDataModel,
} from "../../../models";

/** Вся статистика по каждому проекту  */
export const getProjectsStats = (
    projectName: string,
    taskWithMrContributor: CommonTaskType[],
    parsedUsersEmailToStringList: string[]
) => {
    const projectTaskList: unknown[] = taskWithMrContributor.filter((task) => {
        /** Фильтр по участникам */
        if (parsedUsersEmailToStringList.length) {
            const parsedToStringContributorsEmail = task?.contributors
                .map((contributor) => [contributor.email])
                .join("")
                .toLowerCase();

            const userIncludeInProject = parsedUsersEmailToStringList.filter((user) =>
                parsedToStringContributorsEmail?.includes(user.toLowerCase())
            );
            return task?.project === projectName && userIncludeInProject.length > 0;
        }
        return task?.project === projectName;
    });

    const totalTasks = +projectTaskList.length;

    const bugsQuantity = projectTaskList.filter(
        (task) =>
            (task as TaskWithMrAndJiraDataModel)?.issueType &&
            (task as TaskWithMrAndJiraDataModel)?.issueType === TaskType.Bug
    ).length;

    const featuresQuantity = projectTaskList.filter(
        (task) =>
            (task as TaskWithMrAndJiraDataModel)?.issueType &&
            ((task as TaskWithMrAndJiraDataModel)?.issueType === TaskType.NewFeature ||
                (task as TaskWithMrAndJiraDataModel)?.issueType === TaskType.Improvement)
    ).length;

    const subtasksQuantity = projectTaskList.filter(
        (task) =>
            (task as TaskWithMrAndJiraDataModel)?.issueType &&
            (task as TaskWithMrAndJiraDataModel)?.issueType !== TaskType.Bug &&
            (task as TaskWithMrAndJiraDataModel)?.issueType !== TaskType.Improvement &&
            (task as TaskWithMrAndJiraDataModel)?.issueType !== TaskType.NewFeature
    ).length;

    const unidentifiedTasks =
        totalTasks - featuresQuantity - bugsQuantity - subtasksQuantity;

    return {
        projectTaskList,
        totalTasks,
        bugsQuantity,
        featuresQuantity,
        subtasksQuantity,
        projectName,
        unidentifiedTasks,
    } as ProjectInformationModel;
};

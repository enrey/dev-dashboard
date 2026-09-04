import { uniqBy } from "lodash";

import { JiraInfoItem, JiraUserInfo, TasksStatsResponseDto } from "shared/models";

import { getRandomColor } from "./getRandomColor.util";
import { HybridGitAndJiraModel, PreparedGitTaskModel } from "../models";

const getPreparedGitTask = (
    tasksWithCommentary: TasksStatsResponseDto[],
    jiraUsers: JiraUserInfo[]
): PreparedGitTaskModel[] => {
    return tasksWithCommentary.map((task) => {
        return {
            ...task,
            contributors: uniqBy(
                [...task.opened, ...task.merged].map((mr) => {
                    for (const user of jiraUsers) {
                        if (user.email === mr.email) {
                            return {
                                name: user.displayName,
                                email: user.email,
                                login: user.username,
                                presence: [],
                                selfColor: getRandomColor(),
                                isMatched: true,
                            };
                        }
                    }

                    return {
                        name: mr.username,
                        email: mr.email.toLowerCase(),
                        login: mr.email.slice(0, mr.email.indexOf("@")),
                        presence: [],
                        selfColor: getRandomColor(),
                        isMatched: false,
                    };
                }),
                "email"
            ),
            project: task.task.slice(0, task.task.indexOf("-")),
        };
    });
};

export const getHybridGitAndJira = (
    tasksWithCommentary: TasksStatsResponseDto[],
    jiraUsers: JiraUserInfo[],
    lastTaskData: JiraInfoItem[]
): HybridGitAndJiraModel[] => {
    /** Создаем поле участников > ассоциируем участников с пользователями джиры >
     *  поле проект получаем из таски */
    const preparedGitTask = getPreparedGitTask(tasksWithCommentary, jiraUsers);

    return preparedGitTask
        .map((gitTask) => {
            for (const jiraTask of lastTaskData) {
                if (gitTask.task === jiraTask.issueNumber) {
                    return {
                        ...gitTask,
                        ...jiraTask,
                    };
                }
            }
            return {
                ...gitTask,
            };
        })
        .filter((task) => !!task && task.task !== "???");
};

import { uniqBy } from "lodash";

import { DailyPresence, JiraUserInfo, TaskResponseDto } from "shared/models";

import { getRandomColor } from "./getRandomColor.util";
import { NormalizedGitTasksListModel } from "../models";

/** Мапим статистику по коммитам так, чтобы вся необходимая информация была на уровень выше.
 *  Выносим выше данные о удаленных и добавленых строчках. Добавляем инофрмацию
 *  о пристутствии, если есть совпадение по email. Если таковой нет, то возвращаем пустой массив  */
const getDeletedAddedCodeTasks = (
    gitTasksList: TaskResponseDto[],
    jiraUsers: JiraUserInfo[]
) => {
    return gitTasksList.map((task) => {
        return {
            ...task,
            deleted: task.commits.reduce((init, commit) => commit.deleted + init, 0),
            added: task.commits.reduce((init, commit) => commit.added + init, 0),
            contributors: uniqBy(
                task.commits.map((commit) => {
                    return {
                        name: commit.name,
                        email: commit.email.toLowerCase(),
                        login: commit.email.slice(0, commit.email.indexOf("@")),
                        presence: [] as DailyPresence[],
                        selfColor: getRandomColor(),
                    };
                }),
                "email"
            ),
            totalChanges: task.commits.reduce((prev, cur) => prev + cur.total, 0),
            webRepository: task.commits[0].webUI,
            commits: task.commits.map((commit) => {
                for (const user of jiraUsers) {
                    if (user.email === commit.email) {
                        return {
                            ...commit,
                            name: user.displayName,
                        };
                    }
                }

                return { ...commit };
            }),
        };
    });
};
export const getNormalizedGitTasksListUtil = (
    gitTasksList: TaskResponseDto[],
    jiraUsers: JiraUserInfo[]
): NormalizedGitTasksListModel[] => {
    const deletedAddedCodeTasks = getDeletedAddedCodeTasks(gitTasksList, jiraUsers);

    return deletedAddedCodeTasks.map((task) => {
        return {
            ...task,
            contributors: task.contributors.map((contributor) => {
                for (const user of jiraUsers) {
                    if (user.email === contributor.email) {
                        return {
                            ...contributor,
                            name: user.displayName,
                            email: user.email,
                            login: user.username,
                            isMatched: true,
                        };
                    }
                }

                return { ...contributor, isMatched: false };
            }),
        };
    });
};

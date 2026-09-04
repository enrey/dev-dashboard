import { uniqBy } from "lodash";

import { JiraUserInfo, PersonStaticsStoreDto } from "shared/models";

import { getRandomColor } from "./getRandomColor.util";
import { MrInfoModel, MrsModel } from "../../../models";
import {
    CombinedHybridWithTaskInfo,
    GroupedPresence,
    HybridGitAndJiraModel,
    HybridTaskWithMrInformation,
    NormalizedGitTasksListModel,
} from "../models";
import { TaskWithUnionCommentatorsAndContributors } from "../models/TaskWithUnionCommentatorsAndContributors.model";

/** Комбиним информацию о коммитах с тасками из гита. Если нет совпадения,
 *  то добавляем данные о присутсвии к таскам из гита */
const getCombinedHybridWithTaskInfo = (
    hybridGitAndJira: HybridGitAndJiraModel[],
    normalizedGitTasksListUtil: NormalizedGitTasksListModel[]
): CombinedHybridWithTaskInfo[] => {
    return hybridGitAndJira.map((hybrid) => {
        for (const taskInfo of normalizedGitTasksListUtil) {
            if (taskInfo.task === hybrid.task) {
                return {
                    ...hybrid,
                    ...taskInfo,
                    contributors: uniqBy(
                        [...taskInfo.contributors, ...hybrid.contributors],
                        "email"
                    ),
                };
            }
        }
        return {
            ...hybrid,
        };
    });
};

/** Добавление в таски информации об открытых и закрытых МР.
 *  Добавляем поле комментаторы - если комментартора нет в участниках
 *  таски, то достаем его из комментатора. Это необходимо, чтобы достать
 *  уникальный цвет для итема
 */
const getHybridTaskWithMrInformation = (
    combinedHybridWithTaskInfo: CombinedHybridWithTaskInfo[],
    mappedOpenAndClosedMrs: MrsModel,
    jiraUsers: JiraUserInfo[]
): HybridTaskWithMrInformation[] => {
    return combinedHybridWithTaskInfo.map((task) => {
        return {
            ...task,
            openMr:
                mappedOpenAndClosedMrs.openMrs.find((openMrItem) =>
                    openMrItem.title.includes(task?.task as string)
                ) ?? null,
            closeMr:
                mappedOpenAndClosedMrs.closeMrs.find((closeMrItem) =>
                    closeMrItem.title.includes(task?.task as string)
                ) ?? null,
            commentators: uniqBy(
                task.comments.map((comment) => {
                    for (const user of jiraUsers) {
                        if (user.email.toLowerCase() === comment.email.toLowerCase()) {
                            return {
                                email: comment.email,
                                login: user.username,
                                name: user.displayName,
                                presence: [],
                                selfColor: getRandomColor(),
                                isMatched: true,
                            };
                        }
                    }
                    return {
                        name: comment.username,
                        email: comment.email,
                        login: comment.username,
                        presence: [],
                        selfColor: getRandomColor(),
                        isMatched: false,
                    };
                }),
                "email"
            ),
        };
    });
};

/** Приравниваем комментаторов к участникам.
 *  И добавляем к участникам присутствие из календаря */

const getTaskWithUnionCommentatorsAndContributors = (
    hybridTaskWithMrInformation: HybridTaskWithMrInformation[],
    groupedPresence: GroupedPresence[]
): TaskWithUnionCommentatorsAndContributors[] => {
    return hybridTaskWithMrInformation.map((task) => ({
        ...task,
        contributors: uniqBy(
            [...task.commentators, ...task.contributors].map((contributor) => {
                for (const presence of groupedPresence) {
                    if (
                        presence.email.toLowerCase() === contributor.email.toLowerCase()
                    ) {
                        return {
                            ...contributor,
                            presence: presence.presence,
                        };
                    }
                }

                return {
                    ...contributor,
                };
            }),
            "email"
        ),
    }));
};

/** Ассоциируем участников коммитов и комментариев и добавляем их в соответствующее поле */
const getHybridTaskWithUniqColorContributor = (
    taskWithUnionCommentatorsAndContributors: TaskWithUnionCommentatorsAndContributors[]
) => {
    return taskWithUnionCommentatorsAndContributors.map((task) => ({
        ...task,
        commits: (task as MrInfoModel).commits?.map((commit: PersonStaticsStoreDto) => {
            for (const contributor of task.contributors) {
                if (commit.email.toLowerCase() === contributor.email.toLowerCase()) {
                    return {
                        ...commit,
                        contributor,
                    };
                }
            }

            return { ...commit };
        }),
        comments: task.comments.map((comment) => {
            for (const contributor of task.contributors) {
                if (comment.email.toLowerCase() === contributor.email.toLowerCase()) {
                    return {
                        ...comment,
                        contributor,
                    };
                }
            }
        }),
    }));
};
export const getTaskWithMrContributor = (
    hybridGitAndJira: HybridGitAndJiraModel[],
    normalizedGitTasksListUtil: NormalizedGitTasksListModel[],
    mappedOpenAndClosedMrs: MrsModel,
    jiraUsers: JiraUserInfo[],
    groupedPresence: GroupedPresence[]
) => {
    const combinedHybridWithTaskInfo = getCombinedHybridWithTaskInfo(
        hybridGitAndJira,
        normalizedGitTasksListUtil
    );
    const hybridTaskWithMrInformation = getHybridTaskWithMrInformation(
        combinedHybridWithTaskInfo,
        mappedOpenAndClosedMrs,
        jiraUsers
    );
    const taskWithUnionCommentatorsAndContributors =
        getTaskWithUnionCommentatorsAndContributors(
            hybridTaskWithMrInformation,
            groupedPresence
        );
    const hybridTaskWithUniqColorContributor = getHybridTaskWithUniqColorContributor(
        taskWithUnionCommentatorsAndContributors
    );

    return hybridTaskWithUniqColorContributor.map((task) => ({
        ...task,
        contributorsEmails: task.contributors.map((contributors) => contributors.email),
        firstContributor: task.contributors[0],
        opened: task.opened.map((mr) => {
            for (const contributor of task.contributors) {
                if (contributor.email.toLowerCase() === mr.email.toLowerCase()) {
                    return {
                        ...mr,
                        contributor,
                    };
                }
            }
        }),
        merged: task.merged.map((mr) => {
            for (const contributor of task.contributors) {
                if (contributor.email.toLowerCase() === mr.email.toLowerCase()) {
                    return {
                        ...mr,
                        contributor,
                    };
                }
            }
        }),
    }));
};

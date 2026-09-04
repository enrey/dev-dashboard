import { Dictionary, uniqBy } from "lodash";

import { MainTaskStatus } from "shared/enums";
import { JiraUserInfo, PersonStaticsStoreDto } from "shared/models";

import { getRandomColor } from "./getRandomColor.util";
import { MapAsGroupedByProjectModel, PureUnknownTasksModel } from "../models";

export const getMapAsGroupedByProject = (
    data: Dictionary<PureUnknownTasksModel[]>,
    jiraUsers: JiraUserInfo[]
): MapAsGroupedByProjectModel[] => {
    return Object.entries(data).map(([key, value]) => {
        return {
            commits: value as PersonStaticsStoreDto[],
            titles: value.map((commit) => commit.message),
            projectName: key,
            contributors: uniqBy(
                value.map(({ email, name, presence }) => {
                    for (const user of jiraUsers) {
                        if (user.email.toLowerCase() === email.toLowerCase()) {
                            return {
                                email,
                                name: user.displayName,
                                presence,
                                login: user.username,
                                selfColor: getRandomColor(),
                                isMatched: true,
                            };
                        }
                    }
                    return {
                        email,
                        name,
                        presence,
                        login: email.slice(0, email.indexOf("@")),
                        selfColor: getRandomColor(),
                        isMatched: false,
                    };
                }),
                "name"
            ),
            totalCommits: value.length,
            totalChanges: value.reduce((prev, cur) => prev + cur.total, 0),
            repositoryName: key,
            webUI: value[0].webUI,
            added: value.reduce((prev, cur) => prev + cur.added, 0),
            deleted: value.reduce((prev, cur) => prev + cur.deleted, 0),
            status: MainTaskStatus.Undefined,
        };
    });
};

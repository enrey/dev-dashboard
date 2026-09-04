import { DailyPresence, PersonStaticsStoreDto, TaskResponseDto } from "shared/models";

import { GroupedPresence, PureUnknownTasksModel } from "../models";

export const getPureUnknownTasksUtil = (
    unknownTasks: TaskResponseDto,
    groupedPresence: GroupedPresence[],
    usersEmailList: string[]
): PureUnknownTasksModel[] => {
    let pureUnknownTasks: PureUnknownTasksModel[] = [];
    const groupPresence = (commit: PersonStaticsStoreDto): DailyPresence[] => {
        const filterGroupedPresence = groupedPresence.filter(
            (presence) => presence.email === commit.email
        );
        return filterGroupedPresence.reduce(
            (prev: DailyPresence[], cur) => cur.presence,
            []
        );
    };

    pureUnknownTasks =
        unknownTasks?.commits.map((commit) => {
            return {
                ...(commit as PersonStaticsStoreDto),
                presence: groupPresence(commit),
            };
        }) || [];

    /** Фильтрация потеряшек по участникам  */
    if (usersEmailList.length) {
        const parseUsersFilterToString = usersEmailList.join();

        pureUnknownTasks =
            pureUnknownTasks?.filter((commits) =>
                parseUsersFilterToString.includes(commits.email)
            ) || [];
    }
    return pureUnknownTasks;
};

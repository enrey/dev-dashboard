import { ReactElement, createElement } from "react";

import { orderBy as lodashOrderBy } from "lodash";

import { OrderType, UnknownCommitModel } from "shared/models";

import { TaskWithExtendedMrs } from "../../../../../models";
import { GitJiraTableRow } from "../GitJiraTableRow";
import { UnknownTaskTableRow } from "../UnknownTaskTableRow";
import { HeadCellsGitJiraValues } from "../models";

export const prepareTableBody = (
    tasksList: TaskWithExtendedMrs[],
    unknownTasks: UnknownCommitModel[],
    order: OrderType,
    orderBy: keyof HeadCellsGitJiraValues | string,
    period: Date[]
): ReactElement[] => {
    const orderArray = (array: any[]): any[] => {
        return lodashOrderBy(array, [orderBy], [order]);
    };

    const taskRow =
        orderArray(tasksList).map((task, index) =>
            createElement(GitJiraTableRow, {
                key: `GJTR_${index}-${task.titles[0]}`,
                task: task,
                periodBetweenStarAndEndDaysList: period,
            })
        ) || [];

    const unknownTaskRow =
        orderArray(unknownTasks).map((commit, index) =>
            createElement(UnknownTaskTableRow, {
                key: `UTTR_${index}-${commit.titles[0]}`,
                unknownTask: commit,
                periodBetweenStarAndEndDaysList: period,
            })
        ) || [];

    return [...taskRow, ...unknownTaskRow];
};

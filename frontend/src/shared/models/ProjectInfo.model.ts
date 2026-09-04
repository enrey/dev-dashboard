import { JiraInfoItem } from "shared/models";

import { TotalNumberTasksModel } from "./TotalNumberTasks.model";

export type ProjectInfoModel = {
    name: string;
    info: {
        projectTasksList: JiraInfoItem[];
        totalNumberTasks: TotalNumberTasksModel;
    };
};

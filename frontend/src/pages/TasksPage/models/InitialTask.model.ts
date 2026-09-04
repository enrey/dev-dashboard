import { DateAndIdItemStore, FullContributorModel } from "shared/models";

export interface InitialTask {
    contributors: FullContributorModel[];
    comments: DateAndIdItemStore[];
    merged: DateAndIdItemStore[];
    opened: DateAndIdItemStore[];
    project: string;
    task: string;
    titles: string[];
}

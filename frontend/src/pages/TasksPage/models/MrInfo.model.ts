import { FullContributorModel, PersonStaticsStoreDto } from "shared/models";

export interface MrInfoModel {
    added: number;
    commits: PersonStaticsStoreDto[];
    contributors: FullContributorModel[];
    deleted: number;
    task: string;
    titles: string[];
    totalChanges: number;
    webRepository: string;
}

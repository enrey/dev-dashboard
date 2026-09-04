import { MainTaskStatus } from "shared/enums";
import { FullContributorModel, PersonStaticsStoreDto } from "shared/models";

export interface UnknownTaskModel {
    added: number;
    commits: PersonStaticsStoreDto[];
    contributors: FullContributorModel[];
    deleted: number;
    firstContributor: FullContributorModel;
    firstContributorName: string;
    projectName: string;
    repositoryName: string;
    status: MainTaskStatus;
    titles: string[];
    totalChanges: number;
    totalCommits: number;
    webUI: string;
}

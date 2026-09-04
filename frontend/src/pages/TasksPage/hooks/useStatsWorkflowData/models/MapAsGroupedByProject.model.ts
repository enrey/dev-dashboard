import { MainTaskStatus } from "shared/enums";
import { PersonStaticsStoreDto } from "shared/models";

import { ContributorsModel } from "./Contributors.model";

export interface MapAsGroupedByProjectModel {
    commits: PersonStaticsStoreDto[];
    titles: string[];
    projectName: string;
    contributors: ContributorsModel[];
    totalCommits: number;
    totalChanges: number;
    repositoryName: string;
    webUI: string;
    added: number;
    deleted: number;
    status: MainTaskStatus;
}

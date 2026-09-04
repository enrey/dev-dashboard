import { MainTaskStatus } from "shared/enums";

import { FullContributorModel } from "./Contributor";
import { PersonStaticsStoreDtoWithName } from "./PersonStaticsStoreDto";

export interface UnknownCommitModel {
    added: number;
    commits: PersonStaticsStoreDtoWithName[];
    contributors: FullContributorModel[];
    deleted: number;
    firstContributor: FullContributorModel;
    firstContributorName: string;
    projectName: string;
    repositoryName: string;
    status: MainTaskStatus;
    titles: string[];
    totalCommits: number;
    totalChanges: number;
    webUI: string;
}

import { PersonStaticsStoreDto, TaskResponseDto } from "shared/models";

import { ContributorsModel } from "./Contributors.model";

export interface NormalizedGitTasksListModel extends TaskResponseDto {
    deleted: number;
    added: number;
    contributors: ContributorsModel[];
    totalChanges: number;
    webRepository: string;
    commits: PersonStaticsStoreDto[];
}

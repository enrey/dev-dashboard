import { TasksStatsResponseDto } from "shared/models";

import { ContributorsModel } from "./Contributors.model";

export interface PreparedGitTaskModel extends TasksStatsResponseDto {
    contributors: ContributorsModel[];
    project: string;
}

import { DeveloperModel } from "./Developer.model";
import { GitInfoModel } from "./GitInfo";

export interface AllStatsModel {
    developer: DeveloperModel;
    gitInfo: GitInfoModel[];
    commitCount: number;
}

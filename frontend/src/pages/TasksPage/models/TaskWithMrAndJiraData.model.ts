import { GitTaskAndJira } from "./GitTaskAndJira.model";
import { MrInfoModel } from "./MrInfo.model";

export type TaskWithMrAndJiraDataModel = MrInfoModel & GitTaskAndJira;

import { DailyPresence, PersonStaticsStoreDto } from "shared/models";

export interface PureUnknownTasksModel extends PersonStaticsStoreDto {
    presence: DailyPresence[];
}

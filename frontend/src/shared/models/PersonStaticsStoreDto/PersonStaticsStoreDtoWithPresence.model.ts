import { PersonStaticsStoreDto } from "./PersonStaticsStoreDto.model";
import { DailyPresence } from "../DailyPresence";

export interface PersonStaticsStoreDtoWithPresence extends PersonStaticsStoreDto {
    presence: DailyPresence[];
}

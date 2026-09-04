import { DailyPresence } from "shared/models";

export interface GroupedPresence {
    presence: DailyPresence[];
    email: string;
}

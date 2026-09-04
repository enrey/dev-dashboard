import { PresenceTypes } from "shared/enums";

export interface DailyPresence {
    date: string;
    type: PresenceTypes;
    email: string;
}

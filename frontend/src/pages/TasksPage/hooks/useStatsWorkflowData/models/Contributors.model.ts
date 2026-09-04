import { DailyPresence } from "shared/models";

export interface ContributorsModel {
    name: string;
    email: string;
    login: string;
    presence: DailyPresence[];
    selfColor: string;
    isMatched: boolean;
}

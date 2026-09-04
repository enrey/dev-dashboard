import { Contributor } from "./Contributor.model";
import { DailyPresence } from "../DailyPresence";

export interface ContributorPresence extends Contributor {
    presence: DailyPresence[];
}

import { ContributorPresence } from "./ContributorPresence.model";

/** Моделька участника с посещением и логином */
export interface FullContributorModel extends ContributorPresence {
    login: string;
    selfColor?: string;
    isMatched: boolean;
}

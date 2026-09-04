import { DailyPresence, FullContributorModel } from "shared/models";

import { HybridTaskWithMrInformation } from "./HybridTaskWithMrInformation.model";

export interface TaskWithUnionCommentatorsAndContributors
    extends Omit<HybridTaskWithMrInformation, "contributors"> {
    contributors: {
        name: string;
        email: string;
        login: string;
        presence?: DailyPresence[];
        selfColor?: string;
        isMatched: boolean;
    }[];
}

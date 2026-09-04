import { OrderType } from "shared/models";

import { HeadCellsGitJiraValues } from "./HeadCellsGitJiraValues.model";

export interface EnhancedGitJiraTableHeadProps {
    order: OrderType;
    orderBy: string;
    periodBetweenStarAndEndDaysList: Date[];
    onRequestSort: (
        event: React.MouseEvent<unknown>,
        property: keyof HeadCellsGitJiraValues
    ) => void;
}

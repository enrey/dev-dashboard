import { FilterData } from "shared/components";
import { ChartUser, GitAnalyzerChartData } from "shared/models";

export interface UserRole {
    id: string;
    name: string;
    color: string;
}

export interface UsersTableRowProps extends Omit<GitAnalyzerChartData, "user"> {
    rowNumber?: number;
    user: ChartUser & { isMatched: boolean };
    displayName: string;
    filter: FilterData;
    userNames: Record<string, string>;
    userRoles: Record<string, UserRole[]>;
    linkedEmails: Record<string, string[]>;
    days: Date[];
}

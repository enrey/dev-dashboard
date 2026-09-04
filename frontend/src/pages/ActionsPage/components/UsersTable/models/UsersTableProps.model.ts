import { FilterData } from "shared/components";
import { GitAnalyzerChartData } from "shared/models";

export interface UsersTableProps {
    data: GitAnalyzerChartData[];
    filter: FilterData;
    selectedRoles?: string[];
    showWithoutRoles?: boolean;
}

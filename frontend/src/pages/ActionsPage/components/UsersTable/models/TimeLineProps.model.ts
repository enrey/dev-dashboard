import { FilterData } from "shared/components";
import { GitAnalyzerChartData } from "shared/models";

export interface TimeLineProps {
    userData: GitAnalyzerChartData;
    filter: FilterData;
    days: Date[];
}

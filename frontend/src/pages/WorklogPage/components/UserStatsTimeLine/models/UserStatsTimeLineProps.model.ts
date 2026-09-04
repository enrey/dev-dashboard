import { GitAnalyzerChartData } from "shared/models";

export interface UserStatsTimeLineProps {
    userData: GitAnalyzerChartData;
    blinkingDateId?: string | null;
}

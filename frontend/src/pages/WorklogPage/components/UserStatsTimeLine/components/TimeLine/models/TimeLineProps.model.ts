import { GitAnalyzerChartData } from "shared/models";

export interface TimeLineProps {
    date: Date;
    userData: GitAnalyzerChartData;
    blinkingDateId?: string | null;
}

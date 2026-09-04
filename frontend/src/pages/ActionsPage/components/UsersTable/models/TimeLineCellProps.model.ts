import { GitAnalyzerChartData } from "shared/models";

import { TimeLineStats } from "./TimeLineStats.model";

export interface TimeLineCellProps extends Omit<TimeLineStats, "id"> {
    userData: GitAnalyzerChartData;
    date: Date;
}

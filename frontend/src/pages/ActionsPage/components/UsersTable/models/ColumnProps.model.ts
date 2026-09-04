import { GitAnalyzerChartData } from "shared/models";

export interface ColumnProps {
    id: string;
    label: string | JSX.Element;
    minWidth?: number;
    width?: number;
    numeric: boolean;
}

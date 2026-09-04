import { HistoryTaskColor } from "./HistoryTaskColor.model";

export interface JiraHistoryLayoutProps {
    date: Date;
    task: HistoryTaskColor[];
    onHover: boolean;
}

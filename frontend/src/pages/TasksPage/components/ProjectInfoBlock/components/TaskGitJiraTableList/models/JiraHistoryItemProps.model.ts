import { HistoryTaskColor } from "./HistoryTaskColor.model";

export interface JiraHistoryItemProps
    extends Pick<
        HistoryTaskColor,
        "changerEmail" | "changeType" | "selfColor" | "issueUrl" | "issueNumber"
    > {
    onHover: boolean;
    statusTo?: string | null;
    statuses?: string[];
    descriptionChangesCount?: number;
}

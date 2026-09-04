import { PresenceTypes } from "shared/enums";

import { TimeLineCharts } from "./TimeLineCharts.model";

export interface TimeLineStats {
    id: string;
    bgcolor: string;
    presence: PresenceTypes;
    isActivity: boolean;
    charts: TimeLineCharts[];
}

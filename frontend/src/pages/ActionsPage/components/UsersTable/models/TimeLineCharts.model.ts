import { SourceTypes } from "shared/enums";

import { TimeLineItem } from "./TimeLineItem.model";

export interface TimeLineCharts {
    items: TimeLineItem[];
    sourceType: SourceTypes;
    onHover?: boolean;
}

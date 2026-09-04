import { FilterData } from "shared/components";
import { GitAnalyzerChartData } from "shared/models";

import { OpenDrawerFrom } from "./OpenDrawerFrom.model";

export interface WorklogPopupProps {
    openFrom: OpenDrawerFrom;
    userData?: GitAnalyzerChartData;
    filter?: FilterData;
    open?: boolean;
    onClose?: void;
}

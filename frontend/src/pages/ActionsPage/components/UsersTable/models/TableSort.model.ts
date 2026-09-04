import { MouseEvent } from "react";

import { GitAnalyzerChartData } from "shared/models";

import { Order } from "./Order.model";

export interface TableSort {
    onRequestSort: (
        event: MouseEvent<unknown>,
        property: keyof GitAnalyzerChartData
    ) => void;
    order: Order;
    orderBy: string;
}

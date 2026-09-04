import { PropsWithChildren } from "react";

import { FilterData } from "../../shared/components";
import { ChartTypeEnum } from "../../shared/enums/ChartTypeEnum";
import { GitAnalyzerChartData } from "../../shared/models";

export type TableSortOrder = "asc" | "desc";

export interface TableSortState {
    order: TableSortOrder;
    orderBy: string;
}

export interface FilterContextProviderProps {
    children: PropsWithChildren<any>;
}

export interface InitialFilterContext {
    filter: FilterData;
    tableSort: TableSortState;
    chartTypes: ChartTypeEnum[];
}
interface FilterContextReturnData extends InitialFilterContext {
    initFilter: FilterData;
}

export interface FilterContextActions {
    setFilter: (data: Partial<FilterData>) => void;
    setTableSort: (sort: TableSortState) => void;
    setChartTypes: (types: ChartTypeEnum[]) => void;
}

export type FilterContextData = FilterContextReturnData & FilterContextActions;

import { useCallback, useState } from "react";

import {
    FilterContextData,
    InitialFilterContext,
    TableSortState,
} from "./FilterContext.model";
import { FilterData } from "../../shared/components";
import { ChartTypeEnum } from "../../shared/enums/ChartTypeEnum";

export const useFilterContext = ({
    filter: initFilter,
    tableSort: initTableSort,
    chartTypes: initChartTypes,
}: InitialFilterContext): FilterContextData => {
    const [filter, setFilter] = useState<FilterData>(initFilter);
    const [tableSort, setTableSort] = useState<TableSortState>(initTableSort);
    const [chartTypes, setChartTypes] = useState<ChartTypeEnum[]>(initChartTypes);

    const changeFilter = useCallback((filter: Partial<FilterData>) => {
        setFilter((prevState) => ({ ...prevState, ...filter }));
    }, []);

    const changeTableSort = useCallback((sort: TableSortState) => {
        setTableSort(sort);
    }, []);

    const changeChartTypes = useCallback((types: ChartTypeEnum[]) => {
        setChartTypes(types);
    }, []);

    return {
        initFilter,
        filter,
        setFilter: changeFilter,
        tableSort,
        setTableSort: changeTableSort,
        chartTypes,
        setChartTypes: changeChartTypes,
    };
};

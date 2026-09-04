import { createContext, FC } from "react";

import sub from "date-fns/sub";
import startOfDay from "date-fns/startOfDay";
import { getReferenceDate } from "shared/components/TimeRangePicker/utils/timeRangeUtils";

import {
    FilterContextData,
    FilterContextProviderProps,
    InitialFilterContext,
} from "./FilterContext.model";
import { useFilterContext } from "./useFilterContext";
import { ChartTypeEnum } from "../../shared/enums/ChartTypeEnum";

const referenceDate = startOfDay(getReferenceDate());

const ContextInitialValue: InitialFilterContext = {
    filter: {
        dateStart: sub(referenceDate, { weeks: 2 }),
        dateEnd: referenceDate,
        users: [],
        projects: [],
        sources: [],
        searchParamsString: "",
    },
    tableSort: {
        order: "asc",
        orderBy: "displayName",
    },
    chartTypes: [
        ChartTypeEnum.ISSUES,
        ChartTypeEnum.COMMITS,
        ChartTypeEnum.MR_OPENED,
        ChartTypeEnum.MR_CLOSED,
        ChartTypeEnum.COMMENTS,
        ChartTypeEnum.CONFLUENCE,
    ],
};

export const FilterContext = createContext({} as FilterContextData);

export const FilterContextProvider: FC<FilterContextProviderProps> = ({ children }) => {
    const contextValue = useFilterContext(ContextInitialValue);

    return (
        <FilterContext.Provider value={contextValue}>{children}</FilterContext.Provider>
    );
};

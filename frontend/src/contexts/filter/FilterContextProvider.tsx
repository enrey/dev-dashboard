import { createContext, FC, useMemo } from "react";

import { isValid, parse } from "date-fns";
import startOfDay from "date-fns/startOfDay";
import sub from "date-fns/sub";
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

const DATE_QUERY_FORMAT = "MM-dd-yyyy";

const getDateFromQuery = (value: string | null, fallback: Date): Date => {
    if (!value) return fallback;

    const parsedDate = parse(value, DATE_QUERY_FORMAT, new Date());
    return isValid(parsedDate) ? parsedDate : fallback;
};

/**
 * Даты из URL нужны до монтирования DataContextProvider: иначе React Query
 * успевает отправить запросы с дефолтным диапазоном, а затем — с диапазоном из URL.
 */
export const getInitialFilterContext = (
    search: string = window.location.search
): InitialFilterContext => {
    const searchParams = new URLSearchParams(search);

    return {
        ...ContextInitialValue,
        filter: {
            ...ContextInitialValue.filter,
            dateStart: getDateFromQuery(
                searchParams.get("dateStart"),
                ContextInitialValue.filter.dateStart
            ),
            dateEnd: getDateFromQuery(
                searchParams.get("dateEnd"),
                ContextInitialValue.filter.dateEnd
            ),
        },
    };
};

export const FilterContext = createContext({} as FilterContextData);

export const FilterContextProvider: FC<FilterContextProviderProps> = ({ children }) => {
    // Не пересчитываем при ререндерах: начальный фильтр должен отражать URL при загрузке.
    const initialContext = useMemo(() => getInitialFilterContext(), []);
    const contextValue = useFilterContext(initialContext);

    return (
        <FilterContext.Provider value={contextValue}>{children}</FilterContext.Provider>
    );
};

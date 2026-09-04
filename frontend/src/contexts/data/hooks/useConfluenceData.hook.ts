import { useContext } from "react";

import { useConfluenceStats } from "shared/hooks";
import { ConfluenceInfo } from "shared/models";
import { formatCorrectDate } from "shared/utils";

import { FilterContext } from "../../filter";

export interface UseConfluenceDataReturn {
    confluenceData: ConfluenceInfo[];
}

/**
 * Хук для получения Confluence данных
 */
export const useConfluenceData = (): UseConfluenceDataReturn => {
    const { filter } = useContext(FilterContext);

    const dateStart = formatCorrectDate(filter.dateStart);
    const dateEnd = formatCorrectDate(filter.dateEnd);

    // Запросы через React Query
    const { data: confluenceData = [] } = useConfluenceStats({ dateStart, dateEnd });

    return {
        confluenceData,
    };
};



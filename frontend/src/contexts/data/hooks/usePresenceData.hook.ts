import { useContext } from "react";

import { usePresenceStats, usePresenceUsers } from "shared/hooks";
import { DailyPresence, PresenceUser } from "shared/models";
import { formatCorrectDate } from "shared/utils";

import { FilterContext } from "../../filter";

export interface UsePresenceDataReturn {
    presence: DailyPresence[];
    presenceUsers: PresenceUser[];
}

/**
 * Хук для получения Presence данных
 */
export const usePresenceData = (): UsePresenceDataReturn => {
    const { filter } = useContext(FilterContext);

    const dateStart = formatCorrectDate(filter.dateStart);
    const dateEnd = formatCorrectDate(filter.dateEnd);

    // Запросы через React Query
    const { data: presence = [] } = usePresenceStats({ dateStart, dateEnd });
    const { data: presenceUsers = [] } = usePresenceUsers();

    return {
        presence,
        presenceUsers,
    };
};



import { useCallback, useContext } from "react";

import { useLocation } from "react-router-dom";
import { formatDateToFormat } from "shared/components/Filter";

import { FilterContext } from "../../contexts/filter";
import { ROUTES } from "../../shared/constants";
import { convertUsersToUsersEmail } from "../utils";

/**
 * Хук для обогащения ссылки параметрами для сортировки.
 */
export const useFilterQueryParams = () => {
    const { filter } = useContext(FilterContext);
    const location = useLocation();
    const dateStart = formatDateToFormat(filter.dateStart.toString());
    const dateEnd = formatDateToFormat(filter.dateEnd.toString());
    const users = convertUsersToUsersEmail(filter.users);
    const userQuery = users ? `&users=${users.replaceAll("@", "%40")}` : "";

    const queryString = `?dateStart=${dateStart}&dateEnd=${dateEnd}${userQuery}`;
    const linkWithQuery = useCallback(
        (link: any) => {
            return `${link}${queryString}`;
        },
        [queryString]
    );

    return {
        linkWithQuery,
    };
};

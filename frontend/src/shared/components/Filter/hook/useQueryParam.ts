import { useContext } from "react";

import { useSearchParams } from "react-router-dom";

import { FilterContext } from "../../../../contexts/filter";
import { convertUsersToUsersEmail } from "../../../utils";
import { formatDateToFormat, formatQueryParam } from "../utils/FIlter.util";

export const useQueryParam = () => {
    const { filter } = useContext(FilterContext);
    const [searchParams, setSearchParams] = useSearchParams({
        dateStart: formatDateToFormat(filter.dateStart.toString()),
        dateEnd: formatDateToFormat(filter.dateEnd.toString()),
        ...formatQueryParam(convertUsersToUsersEmail(filter.users)),
    });
    /** Квери парам "Дата с" */
    const dateStartQueryParam = searchParams.get("dateStart")!;

    /** Квери парам "Дата с" */
    const dateEndQueryParam = searchParams.get("dateEnd")!;

    /** Квери парам "Разработчики" */
    const usersQueryParam = searchParams.get("users");

    /** Квери парам "Проекты" */
    const projectsQueryParam = searchParams.get("projects");
    const projectArrayQueryParam = projectsQueryParam?.split("+") || [];

    return {
        setSearchParams,
        dateStartQueryParam,
        dateEndQueryParam,
        usersQueryParam,
        projectsQueryParam,
        projectArrayQueryParam,
    };
};

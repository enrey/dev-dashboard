import { useCallback, useContext } from "react";

import { useSearchParams } from "react-router-dom";

import { FilterContext } from "../../contexts/filter";
import { formatQueryParam } from "../components";
import { ChartUser, Contributor } from "../models";
import { convertUsersToUsersEmail } from "../utils";
import { reduceProjectsQuery } from "../utils/reduceProjectsQuery";

export const useAddToFilterContributor = () => {
    const { filter, setFilter } = useContext(FilterContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const updateQueryString = (users: ChartUser[]) => {
        setSearchParams({
            dateStart: searchParams.get("dateStart")!,
            dateEnd: searchParams.get("dateEnd")!,
            ...formatQueryParam(
                convertUsersToUsersEmail(users),
                reduceProjectsQuery(filter.projects)
            ),
        });
    };

    return useCallback(
        (contributor: Contributor) => {
            const users = [...filter.users, { ...contributor }];
            setFilter({
                ...filter,
                users: users,
            });
            updateQueryString(users);
        },
        [filter]
    );
};

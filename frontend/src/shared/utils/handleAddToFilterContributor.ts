import { Contributor } from "shared/models";

import { FilterContextData } from "../../contexts/filter";

export const handleAddToFilterContributor = (
    contributor: Contributor,
    filterContext: Omit<FilterContextData, "initFilter">
) => {
    return filterContext.setFilter({
        ...filterContext.filter,
        users: [...filterContext.filter.users, { ...contributor }],
    });
};

import { format } from "date-fns";

import { FormatQueryParam } from "../models/Filter.model";

export const formatDateToFormat = (date: any, dateFormat: string = "MM-dd-yyyy") =>
    format(new Date(date), dateFormat);

export const formatQueryParam = (
    usersQueryParam?: string | null,
    projectsQueryParam?: string | null
): FormatQueryParam => {
    const queryParam: FormatQueryParam = {};
    if (usersQueryParam) queryParam.users = usersQueryParam;
    if (projectsQueryParam) queryParam.projects = projectsQueryParam;
    return queryParam;
};

import { useCallback, useContext } from "react";

import { useSearchParams } from "react-router-dom";

import { FilterContext } from "../../contexts/filter";
import { formatQueryParam } from "../components";
import { SELECTED_PROJECT_COLOR } from "../constants";
import { convertUsersToUsersEmail } from "../utils";
import { reduceProjectsQuery } from "../utils/reduceProjectsQuery";

export const useFastProjectFilter = () => {
    const { filter, initFilter, setFilter } = useContext(FilterContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const updateQueryString = (projects: string[]) => {
        setSearchParams({
            dateStart: searchParams.get("dateStart")!,
            dateEnd: searchParams.get("dateEnd")!,
            ...formatQueryParam(
                convertUsersToUsersEmail(filter.users),
                reduceProjectsQuery(projects)
            ),
        });
    };
    const handleFastProjectFilter = useCallback(
        (projectName: string) => {
            let projects: string[] = [];
            if (projectName === "") {
                updateQueryString(projects);
                return setFilter({
                    ...initFilter,
                    sources: filter.sources,
                    projects,
                });
            }
            const removeFromFilter = filter.projects.includes(projectName);
            if (removeFromFilter) {
                projects = filter.projects.filter((project) => project != projectName);
            } else {
                projects = [...filter.projects, projectName];
            }
            updateQueryString(projects);
            return setFilter({
                ...filter,
                projects,
            });
        },
        [filter]
    );

    const selectedProjectColor = useCallback(
        (projectName: string) => {
            const isSelectedAllProjects =
                !filter.projects?.length && !projectName?.length;
            const isSelectedProject = filter.projects.includes(projectName);
            if (isSelectedAllProjects || isSelectedProject) {
                return SELECTED_PROJECT_COLOR;
            }
            return "black";
        },
        [filter.projects]
    );

    return {
        handleFastProjectFilter,
        selectedProjectColor,
    };
};

import { useContext } from "react";

import { DatasourceStatusEnum } from "shared/enums";

import { useJiraData } from "../../../contexts/data";
import { FilterContext } from "../../../contexts/filter";

export const useFilterBySource = <T>(data: T): T => {
    const { filter } = useContext(FilterContext);
    const { jiraUsers } = useJiraData();
    const { sources } = filter;
    let filteredData: any = data;

    if (sources.includes(DatasourceStatusEnum.JIRA)) {
        filteredData = filteredData.filter((item: any) => item?.["history"]?.length > 0);
    }
    if (sources.includes(DatasourceStatusEnum.GIT)) {
        filteredData = filteredData.filter((item: any) => item?.["commits"]?.length > 0);
    }
    if (sources.includes(DatasourceStatusEnum.GITLAB)) {
        filteredData = filteredData.filter(
            (item: any) =>
                item?.["comments"]?.length > 0 ||
                item?.["opened"]?.length > 0 ||
                item?.["merged"]?.length > 0
        );
    }
    if (sources.includes(DatasourceStatusEnum.MAIL)) {
        filteredData = filteredData.filter((item: any) => {
            let hasJiraContributors = false;
            for (const user of jiraUsers) {
                hasJiraContributors =
                    hasJiraContributors ||
                    item?.["contributorsEmails"]?.includes(user.email) ||
                    item?.["firstContributor"]?.["email"] === user.email;
            }

            return hasJiraContributors;
        });
    }
    return filteredData as T;
};

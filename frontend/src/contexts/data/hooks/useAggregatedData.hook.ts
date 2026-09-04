import { useCallback, useEffect, useMemo, useState } from "react";

import { intersection } from "lodash";
import includes from "lodash/includes";

import { FilterData } from "shared/components";
import { GitAnalyzerChartData } from "shared/models";

import { useConfluenceData } from "./useConfluenceData.hook";
import { useGitData } from "./useGitData.hook";
import { useGitlabData } from "./useGitlabData.hook";
import { useJiraData } from "./useJiraData.hook";
import { usePresenceData } from "./usePresenceData.hook";
import { useUsersData } from "./useUsersData.hook";
import { usersPageStorage } from "shared/services";
import { collapseLinkedUsers } from "../../mappers/collapseLinkedUsers";
import {
    ProcessGitInfoProps,
    processGitInfoService,
} from "../../mappers/processGit.service";
import type { UserPageState } from "shared/models";

export interface UseAggregatedDataReturn {
    dataSource: GitAnalyzerChartData[];
    filteredDataSource: (filterParams: FilterData) => GitAnalyzerChartData[];
}

/**
 * Хук для получения агрегированных данных из всех источников
 */
export const useAggregatedData = (): UseAggregatedDataReturn => {
    const { users } = useUsersData();
    const { gitInfo } = useGitData();
    const { tasksData, jiraUsers } = useJiraData();
    const { gitlabData, gitlabUsers, gitlabMrComments } = useGitlabData();
    const { presence } = usePresenceData();
    const { confluenceData } = useConfluenceData();
    const [linkedEmails, setLinkedEmails] = useState<UserPageState["linkedEmails"]>({});

    useEffect(() => {
        let isMounted = true;
        usersPageStorage
            .load()
            .then((state) => {
                if (isMounted) {
                    setLinkedEmails(state.linkedEmails);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setLinkedEmails({});
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const dataSource = useMemo(() => {
        const params: ProcessGitInfoProps = {
            users: users,
            gitData: gitInfo,
            tasksData: tasksData,
            gitlabData: gitlabData,
            jiraUsers: jiraUsers,
            gitlabUsers: gitlabUsers,
            gitlabMrComments: gitlabMrComments,
            presence: presence,
            confluenceData: confluenceData,
        };

        const processedData = processGitInfoService(params);

        // Применяем схлопывание данных по связанным email
        return collapseLinkedUsers(processedData, linkedEmails);
    }, [
        users,
        gitInfo,
        tasksData,
        gitlabData,
        jiraUsers,
        gitlabUsers,
        gitlabMrComments,
        presence,
        confluenceData,
        linkedEmails,
    ]);

    // Оптимизированная функция фильтрации
    const filteredDataSource = useCallback(
        (filterParams: FilterData) => {
            let result = dataSource.filter(({ dataSources }) =>
                filterParams.sources.every((dataSource) => dataSources.includes(dataSource))
            );
            const usersEmails = filterParams.users.map((item) => item.email);

            if (filterParams.users.length) {
                result = result.filter((item) => includes(usersEmails, item.user.email));
            }

            if (filterParams.projects.length) {
                result = result.filter((item) => {
                    const intersectionWithUserProjects = intersection(
                        filterParams.projects,
                        item.totalProjects
                    );

                    return !!intersectionWithUserProjects.length;
                });
            }

            return result;
        },
        [dataSource]
    );

    return {
        dataSource,
        filteredDataSource,
    };
};



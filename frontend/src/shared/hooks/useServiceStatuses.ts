import { useMemo } from "react";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { LoadingStatus } from "shared/enums/LoadingStatus.enum";
import { formatCorrectDate } from "shared/utils";
import { FilterContext } from "contexts/filter";
import { useContext } from "react";

interface ServiceStatuses {
    git: LoadingStatus;
    jira: LoadingStatus;
    jiraUsers: LoadingStatus;
    gitlab: LoadingStatus;
    gitlabUsers: LoadingStatus;
    presenceUsers: LoadingStatus;
    gitlabComments: LoadingStatus;
    tasksStats: LoadingStatus;
    calendar: LoadingStatus;
    gitTasksData: LoadingStatus;
    confluence: LoadingStatus;
}

const statusFromQuery = (state: any): LoadingStatus => {
    if (!state) return LoadingStatus.inProgress;
    if (state.status === "pending") return LoadingStatus.inProgress;
    if (state.status === "error") return LoadingStatus.error;
    if (state.status === "success") return LoadingStatus.done;
    return LoadingStatus.inProgress;
};

export const useServiceStatuses = (): {
    services: ServiceStatuses;
    isLoading: boolean;
    isLoaded: boolean;
    isSucceeded: boolean;
} => {
    const queryClient = useQueryClient();
    const fetchingCount = useIsFetching();
    const { filter } = useContext(FilterContext);
    const dateStart = formatCorrectDate(filter.dateStart);
    const dateEnd = formatCorrectDate(filter.dateEnd);

    const services = useMemo<ServiceStatuses>(() => {
        const git = statusFromQuery(queryClient.getQueryState(["gitAnalyzerInfo", dateStart, dateEnd]));
        const jira = statusFromQuery(queryClient.getQueryState(["jiraStats", dateStart, dateEnd]));
        const jiraUsers = statusFromQuery(queryClient.getQueryState(["jiraUsers"]));
        const gitlab = statusFromQuery(queryClient.getQueryState(["gitlabStats", dateStart, dateEnd]));
        const gitlabUsers = statusFromQuery(queryClient.getQueryState(["gitlabUsers"]));
        const presenceUsers = statusFromQuery(queryClient.getQueryState(["presenceUsers"]));
        const gitlabComments = statusFromQuery(queryClient.getQueryState(["gitlabMrComments", dateStart, dateEnd]));
        const calendar = statusFromQuery(queryClient.getQueryState(["presenceStats", dateStart, dateEnd]));
        const confluence = statusFromQuery(queryClient.getQueryState(["confluenceStats", dateStart, dateEnd]));

        return {
            git,
            jira,
            jiraUsers,
            gitlab,
            gitlabUsers,
            presenceUsers,
            gitlabComments,
            tasksStats: LoadingStatus.done,
            calendar,
            gitTasksData: LoadingStatus.done,
            confluence,
        };
    }, [queryClient, fetchingCount, dateStart, dateEnd]);

    const isLoading = useMemo(() => (
        services.git === LoadingStatus.inProgress ||
        services.jira === LoadingStatus.inProgress ||
        services.jiraUsers === LoadingStatus.inProgress ||
        services.gitlab === LoadingStatus.inProgress ||
        services.gitlabUsers === LoadingStatus.inProgress ||
        services.gitlabComments === LoadingStatus.inProgress ||
        services.calendar === LoadingStatus.inProgress ||
        services.gitTasksData === LoadingStatus.inProgress ||
        services.tasksStats === LoadingStatus.inProgress ||
        services.confluence === LoadingStatus.inProgress
    ), [services]);

    const isLoaded = useMemo(() => (
        services.git !== LoadingStatus.inProgress &&
        services.jira !== LoadingStatus.inProgress &&
        services.jiraUsers !== LoadingStatus.inProgress &&
        services.gitlab !== LoadingStatus.inProgress &&
        services.gitlabUsers !== LoadingStatus.inProgress &&
        services.gitlabComments !== LoadingStatus.inProgress &&
        services.calendar !== LoadingStatus.inProgress &&
        services.gitTasksData !== LoadingStatus.inProgress &&
        services.tasksStats !== LoadingStatus.inProgress &&
        services.confluence !== LoadingStatus.inProgress
    ), [services]);

    const isSucceeded = useMemo(() => (
        (services.git === LoadingStatus.done &&
            services.jira === LoadingStatus.done &&
            services.jiraUsers === LoadingStatus.done &&
            services.gitlab === LoadingStatus.done &&
            services.gitlabUsers === LoadingStatus.done &&
            services.gitlabComments === LoadingStatus.done &&
            services.calendar === LoadingStatus.done &&
            services.confluence === LoadingStatus.done) ||
        services.gitTasksData === LoadingStatus.done ||
        services.tasksStats === LoadingStatus.done
    ), [services]);

    return { services, isLoading, isLoaded, isSucceeded };
};

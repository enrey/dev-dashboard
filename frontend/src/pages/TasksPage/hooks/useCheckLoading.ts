import { useContext, useMemo } from "react";

import { LoadingStatus } from "shared/enums";
import { useServiceStatuses } from "shared/hooks";

export const useCheckLoading = (projectsLength: boolean) => {
    const { services } = useServiceStatuses();
    const { git, jira, gitlab } = services;

    const gitLoadStatus = useMemo(
        () =>
            git === LoadingStatus.inProgress &&
            jira === LoadingStatus.inProgress &&
            gitlab === LoadingStatus.inProgress,

        [git, jira, gitlab]
    );

    const isDataLoadedWithError = useMemo(
        () =>
            git === LoadingStatus.error ||
            jira === LoadingStatus.error ||
            gitlab === LoadingStatus.error,

        [git, jira, gitlab]
    );

    const isLoading = isDataLoadedWithError || gitLoadStatus || projectsLength;

    return {
        isLoading,
        loadingWithError: isDataLoadedWithError,
    };
};

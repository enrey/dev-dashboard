import { useContext } from "react";

import { useGitlabStats, useGitlabUsers, useGitlabMrComments } from "shared/hooks";
import { GitlabInfo, GitlabUserInfo, GitlabCommentModel } from "shared/models";
import { formatCorrectDate } from "shared/utils";

import { FilterContext } from "../../filter";

export interface UseGitlabDataReturn {
    gitlabData: GitlabInfo[];
    gitlabUsers: GitlabUserInfo[];
    gitlabMrComments: GitlabCommentModel[];
}

/**
 * Хук для получения GitLab данных
 */
export const useGitlabData = (): UseGitlabDataReturn => {
    const { filter } = useContext(FilterContext);

    const dateStart = formatCorrectDate(filter.dateStart);
    const dateEnd = formatCorrectDate(filter.dateEnd);

    // Запросы через React Query
    const { data: gitlabData = [] } = useGitlabStats({ dateStart, dateEnd });
    const { data: gitlabUsers = [] } = useGitlabUsers();
    const { data: gitlabMrComments = [] } = useGitlabMrComments({ dateStart, dateEnd });

    return {
        gitlabData,
        gitlabUsers,
        gitlabMrComments,
    };
};



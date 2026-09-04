import { useContext, useMemo } from "react";

import orderBy from "lodash/orderBy";

import { useGitAnalyzerInfo, useGitTasksData } from "shared/hooks";
import { GitAnalyzerInfoModel, TaskResponseDto } from "shared/models";
import { formatCorrectDate } from "shared/utils";

import { FilterContext } from "../../filter";
import { mapToGitAnalyzerUserData } from "../../mappers/mapToGitAnalyzerUserData";

export interface UseGitDataReturn {
    gitAnalyzerInfo: GitAnalyzerInfoModel[];
    gitTasksList: TaskResponseDto[];
    gitInfo: GitAnalyzerInfoModel[];
    projects: string[];
}

interface UseGitDataOptions {
    includeTaskData?: boolean;
}

/**
 * Хук для получения Git данных
 */
export const useGitData = (options: UseGitDataOptions = {}): UseGitDataReturn => {
    const { includeTaskData = false } = options;
    const { filter } = useContext(FilterContext);

    const dateStart = formatCorrectDate(filter.dateStart);
    const dateEnd = formatCorrectDate(filter.dateEnd);

    // Запросы через React Query
    const { data: gitAnalyzerInfo = [] } = useGitAnalyzerInfo({ dateStart, dateEnd });
    const { data: gitTasksList = [] } = useGitTasksData({
        dateStart,
        dateEnd,
        enabled: includeTaskData,
    });

    const gitInfo = useMemo(() => {
        return mapToGitAnalyzerUserData(gitAnalyzerInfo);
    }, [gitAnalyzerInfo]);

    const projects = useMemo(() => {
        return orderBy(
            [...new Set(gitInfo.map((fd) => fd.repositoryName))],
            (key) => key,
            ["asc"]
        );
    }, [gitInfo]);

    return {
        gitAnalyzerInfo,
        gitTasksList,
        gitInfo,
        projects,
    };
};



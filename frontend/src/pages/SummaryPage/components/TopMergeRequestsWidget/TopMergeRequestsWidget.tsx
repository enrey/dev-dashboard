import React, { useMemo } from "react";

import { useGitlabData } from "../../../../contexts/data";
import { DashboardListWidget } from "../common/DashboardListWidget/DashboardListWidget";

// Функция для извлечения короткого имени репозитория
const getShortRepoName = (repoUrl: string): string => {
    // Убираем протокол и домен (все до третьего слеша)
    // Например: https://gitlab.example.com/group/project.git -> group/project.git
    const withoutProtocol = repoUrl.replace(/^https?:\/\/[^/]+\//, "");
    // Убираем .git в конце, если есть
    return withoutProtocol.replace(/\.git$/, "");
};

export const TopMergeRequestsWidget: React.FC = () => {
    const { gitlabData } = useGitlabData();

    const { allRepositories, totalMRs, totalRepositories } = useMemo(() => {
        // Группируем MR по репозиториям
        const mrsByRepo = new Map<string, number>();

        gitlabData.forEach((info) => {
            // Считаем opened MRs
            info.openedDates?.forEach((mr) => {
                const repoName = getShortRepoName(mr.repo);
                const currentCount = mrsByRepo.get(repoName) || 0;
                mrsByRepo.set(repoName, currentCount + 1);
            });

            // Считаем merged MRs
            info.mergedDates?.forEach((mr) => {
                const repoName = getShortRepoName(mr.repo);
                const currentCount = mrsByRepo.get(repoName) || 0;
                mrsByRepo.set(repoName, currentCount + 1);
            });
        });

        // Общее количество репозиториев
        const totalRepos = mrsByRepo.size;

        // Преобразуем Map в массив и сортируем по количеству MR
        const reposArray = Array.from(mrsByRepo.entries())
            .map(([name, mrs]) => ({ name, mrs }))
            .sort((a, b) => b.mrs - a.mrs);

        // Вычисляем максимальное количество MR для масштабирования
        const max = reposArray.length > 0 ? Math.max(...reposArray.map((r) => r.mrs)) : 1;

        // Вычисляем общее количество MR
        const total = Array.from(mrsByRepo.values()).reduce(
            (sum, count) => sum + count,
            0
        );

        // Добавляем процент для каждого репозитория
        const allRepos = reposArray.map((repo) => ({
            ...repo,
            percentage: (repo.mrs / max) * 100,
        }));

        return {
            allRepositories: allRepos,
            totalMRs: total,
            totalRepositories: totalRepos,
        };
    }, [gitlabData]);

    const displayItems = allRepositories.map((repo, index) => ({
        id: `${repo.name}-${index}`,
        label: repo.name,
        value: repo.mrs,
        percentage: repo.percentage,
        tooltip: `${repo.mrs} ${repo.mrs === 1 ? "merge request" : "merge requests"}`,
    }));

    return (
        <DashboardListWidget
            title="MERGE REQUESTS: TOP REPOSITORIES"
            stats={[
                {
                    value: totalMRs,
                    label: "Total MRs",
                },
                {
                    value: totalRepositories,
                    label: "Repositories",
                },
            ]}
            items={displayItems}
            barColor="#8b5cf6"
            emptyState="Нет данных о merge requests"
        />
    );
};

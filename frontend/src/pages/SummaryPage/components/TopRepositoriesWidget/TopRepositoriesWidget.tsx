import React, { useMemo } from "react";

import { useGitData } from "../../../../contexts/data";

import { DashboardListWidget } from "../common/DashboardListWidget/DashboardListWidget";

export const TopRepositoriesWidget: React.FC = () => {
    const { gitAnalyzerInfo } = useGitData();

    const { allRepositories, totalCommits, totalRepositories } = useMemo(() => {
        // Группируем коммиты по репозиториям
        const commitsByRepo = new Map<string, number>();

        gitAnalyzerInfo.forEach((info) => {
            const repoName = info.repositoryName;
            const currentCount = commitsByRepo.get(repoName) || 0;
            commitsByRepo.set(repoName, currentCount + info.commitsCount);
        });

        // Общее количество репозиториев
        const totalRepos = commitsByRepo.size;

        // Преобразуем Map в массив и сортируем по количеству коммитов
        const reposArray = Array.from(commitsByRepo.entries())
            .map(([name, commits]) => ({ name, commits }))
            .sort((a, b) => b.commits - a.commits);

        // Вычисляем максимальное количество коммитов для масштабирования
        const max =
            reposArray.length > 0 ? Math.max(...reposArray.map((r) => r.commits)) : 1;

        // Вычисляем общее количество коммитов
        const total = Array.from(commitsByRepo.values()).reduce(
            (sum, count) => sum + count,
            0
        );

        // Добавляем процент для каждого репозитория
        const allRepos = reposArray.map((repo) => ({
            ...repo,
            percentage: (repo.commits / max) * 100,
        }));

        return {
            allRepositories: allRepos,
            totalCommits: total,
            totalRepositories: totalRepos,
        };
    }, [gitAnalyzerInfo]);

    const displayItems = allRepositories.map((repo, index) => ({
        id: `${repo.name}-${index}`,
        label: repo.name,
        value: repo.commits,
        percentage: repo.percentage,
        tooltip: `${repo.commits} ${repo.commits === 1 ? "commit" : "commits"}`,
    }));

    return (
        <DashboardListWidget
            title="COMMITS: TOP REPOSITORIES"
            stats={[
                {
                    value: totalCommits,
                    label: "Total commits",
                },
                {
                    value: totalRepositories,
                    label: "Repositories",
                },
            ]}
            items={displayItems}
            barColor="#06b6d4"
            emptyState="Нет данных о репозиториях"
        />
    );
};

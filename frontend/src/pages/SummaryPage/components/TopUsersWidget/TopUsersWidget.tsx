import React, { useEffect, useMemo } from "react";

import { useGitData, useGitlabData } from "../../../../contexts/data";
import { usersPageStorage } from "shared/services";
import type { UserPageState } from "shared/models";

import { DashboardListWidget } from "../common/DashboardListWidget/DashboardListWidget";

export const TopUsersWidget: React.FC = () => {
    const { gitAnalyzerInfo } = useGitData();
    const { gitlabUsers } = useGitlabData();

    // Получаем userNames из users.state
    const [userNames, setUserNames] = React.useState<UserPageState["userNames"]>({});

    useEffect(() => {
        let isMounted = true;
        usersPageStorage
            .load()
            .then((state) => {
                if (isMounted) {
                    setUserNames(state.userNames);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setUserNames({});
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const { allUsers, totalCommits, totalUsers } = useMemo(() => {
        // Группируем коммиты по пользователям
        const commitsByUser = new Map<string, { email: string; commits: number }>();

        gitAnalyzerInfo.forEach((info) => {
            const userEmail = info.email;
            const existing = commitsByUser.get(userEmail);

            if (existing) {
                existing.commits += info.commitsCount;
            } else {
                commitsByUser.set(userEmail, {
                    email: userEmail,
                    commits: info.commitsCount,
                });
            }
        });

        // Общее количество пользователей
        const totalUsersCount = commitsByUser.size;

        // Преобразуем Map в массив и сортируем по количеству коммитов
        const usersArray = Array.from(commitsByUser.values()).sort(
            (a, b) => b.commits - a.commits
        );

        // Вычисляем максимальное количество коммитов для масштабирования
        const max =
            usersArray.length > 0 ? Math.max(...usersArray.map((u) => u.commits)) : 1;

        // Вычисляем общее количество коммитов
        const total = usersArray.reduce((sum, user) => sum + user.commits, 0);

        // Добавляем процент для каждого пользователя
        const allUsersData = usersArray.map((user) => ({
            ...user,
            percentage: (user.commits / max) * 100,
        }));

        return {
            allUsers: allUsersData,
            totalCommits: total,
            totalUsers: totalUsersCount,
        };
    }, [gitAnalyzerInfo]);

    // Функция для получения ФИО или email
    const getUserDisplayName = (email: string) => {
        return userNames[email] || email;
    };

    // Маппинг email -> gitlab profile URL
    const gitlabUrlByEmail = useMemo(() => {
        const map = new Map<string, string>();
        gitlabUsers.forEach((u) => map.set(u.email.toLowerCase(), u.url));
        return map;
    }, [gitlabUsers]);

    const displayItems = allUsers.map((user, index) => ({
        id: `${user.email}-${index}`,
        label: getUserDisplayName(user.email),
        value: user.commits,
        percentage: user.percentage,
        tooltip: `${getUserDisplayName(user.email)}: ${user.commits} ${user.commits === 1 ? "commit" : "commits"}`,
        href: gitlabUrlByEmail.get(user.email.toLowerCase()),
    }));

    return (
        <DashboardListWidget
            title="COMMITS: TOP USERS"
            stats={[
                {
                    value: totalCommits,
                    label: "Total commits",
                },
                {
                    value: totalUsers,
                    label: "Users",
                },
            ]}
            items={displayItems}
            barColor="#6366f1"
            emptyState="Нет данных о пользователях"
        />
    );
};

import React, { useMemo, useEffect, useState } from "react";

import { useGitlabData } from "../../../../contexts/data";
import type { GitlabInfoDate, UserPageState } from "../../../../shared/models";
import { usersPageStorage } from "shared/services";
import { DashboardListWidget } from "../common/DashboardListWidget/DashboardListWidget";
import styles from "../common/DashboardWidget/DashboardWidget.module.scss";

interface MRReviewTime {
    url: string;
    title: string;
    repo: string;
    reviewDays: number;
    email: string;
}

export const TopReviewTimeWidget: React.FC = () => {
    const { gitlabData } = useGitlabData();

    // Получаем userNames из users.state
    const [userNames, setUserNames] = useState<UserPageState["userNames"]>({});

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

    const { allMRs, totalMRs, averageReviewDays } = useMemo(() => {
        // Собираем все MR и группируем по URL
        const mrsByUrl = new Map<
            string,
            {
                opened: GitlabInfoDate | null;
                merged: GitlabInfoDate | null;
                email: string;
            }
        >();

        // Собираем opened MRs
        gitlabData.forEach((info) => {
            info.openedDates?.forEach((mr) => {
                if (!mrsByUrl.has(mr.url)) {
                    mrsByUrl.set(mr.url, {
                        opened: null,
                        merged: null,
                        email: info.email,
                    });
                }
                const existing = mrsByUrl.get(mr.url)!;
                // Берём самую раннюю дату открытия
                if (!existing.opened || new Date(mr.dt) < new Date(existing.opened.dt)) {
                    existing.opened = mr;
                    existing.email = info.email;
                }
            });
        });

        // Собираем merged MRs
        gitlabData.forEach((info) => {
            info.mergedDates?.forEach((mr) => {
                if (mrsByUrl.has(mr.url)) {
                    const existing = mrsByUrl.get(mr.url)!;
                    // Берём самую позднюю дату мерджа
                    if (
                        !existing.merged ||
                        new Date(mr.dt) > new Date(existing.merged.dt)
                    ) {
                        existing.merged = mr;
                    }
                }
            });
        });

        // Вычисляем время ревью для каждого MR
        const reviewTimes: MRReviewTime[] = [];
        mrsByUrl.forEach((value, url) => {
            if (value.opened && value.merged) {
                const openedDate = new Date(value.opened.dt);
                const mergedDate = new Date(value.merged.dt);
                const reviewDays = Math.round(
                    (mergedDate.getTime() - openedDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                // Берём только положительные значения (когда merged позже opened)
                if (reviewDays >= 0) {
                    reviewTimes.push({
                        url: value.merged.url,
                        title: value.merged.title,
                        repo: value.merged.repo,
                        reviewDays: reviewDays,
                        email: value.email,
                    });
                }
            }
        });

        // Сортируем по убыванию времени ревью
        reviewTimes.sort((a, b) => b.reviewDays - a.reviewDays);

        // Вычисляем статистику
        const max =
            reviewTimes.length > 0
                ? Math.max(...reviewTimes.map((r) => r.reviewDays))
                : 1;
        const total = reviewTimes.length;
        const avgDays =
            total > 0
                ? Math.round(
                      reviewTimes.reduce((sum, mr) => sum + mr.reviewDays, 0) / total
                  )
                : 0;

        // Добавляем процент для каждого MR (для визуализации)
        const allMRsWithPercentage = reviewTimes.map((mr) => ({
            ...mr,
            percentage: (mr.reviewDays / max) * 100,
        }));

        return {
            allMRs: allMRsWithPercentage,
            totalMRs: total,
            averageReviewDays: avgDays,
        };
    }, [gitlabData]);

    // Функция для извлечения короткого названия репозитория
    const getShortRepoName = (repo: string) => {
        const parts = repo.split("/");
        return parts.length >= 2 ? parts.slice(-2).join("/") : repo;
    };

    // Функция для получения ФИО или email
    const getUserDisplayName = (email: string) => {
        return userNames[email] || email;
    };

    // Сокращение имени: "Швец Максим" -> "Швец М."
    const getShortName = (email: string) => {
        const name = getUserDisplayName(email);
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0]} ${parts[1][0]}.`;
        }
        return name;
    };

    const displayItems = allMRs.map((mr) => ({
        id: mr.url,
        label: (
            <>
                <span style={{ fontWeight: 600 }}>{getShortName(mr.email)}</span>,{" "}
                {mr.title}
            </>
        ),
        value: `${mr.reviewDays}d`,
        percentage: mr.percentage,
        tooltip: (
            <div>
                <div>
                    <strong>{mr.title}</strong>
                </div>
                <div>{getShortRepoName(mr.repo)}</div>
                <div>Автор: {getUserDisplayName(mr.email)}</div>
                <div>
                    {mr.reviewDays} {mr.reviewDays === 1 ? "день" : "дней"} на ревью
                </div>
                <div style={{ marginTop: "4px", fontSize: "11px", opacity: 0.8 }}>
                    Кликните, чтобы открыть в GitLab
                </div>
            </div>
        ),
        onClick: () => window.open(mr.url, "_blank"),
        labelClassName: styles.labelWide,
    }));

    return (
        <DashboardListWidget
            title="MERGE REQUESTS: LONGEST REVIEW TIME"
            stats={[
                {
                    value: averageReviewDays,
                    label: "Average days",
                },
                {
                    value: totalMRs,
                    label: "Total MRs",
                },
            ]}
            items={displayItems}
            barColor="#f59e0b"
            emptyState="Нет данных о merge requests"
            maxVisible={5}
        />
    );
};

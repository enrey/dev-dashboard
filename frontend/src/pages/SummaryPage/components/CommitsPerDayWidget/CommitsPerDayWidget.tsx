import React, { useContext, useMemo } from "react";

import { format, eachDayOfInterval } from "date-fns";
import { ru } from "date-fns/locale";

import { DashboardBarsWidget } from "../common/DashboardBarsWidget/DashboardBarsWidget";
import { useGitData } from "../../../../contexts/data";
import { FilterContext } from "../../../../contexts/filter";

export const CommitsPerDayWidget: React.FC = () => {
    const { gitAnalyzerInfo } = useGitData();
    const { filter } = useContext(FilterContext);

    const { commitsPerDay, average, trend } = useMemo(() => {
        // Группируем коммиты по датам
        const commitsByDate = new Map<string, number>();

        gitAnalyzerInfo.forEach((info) => {
            const date = info.date;
            const currentCount = commitsByDate.get(date) || 0;
            commitsByDate.set(date, currentCount + info.commitsCount);
        });

        const allDates = eachDayOfInterval({
            start: filter.dateStart,
            end: filter.dateEnd,
        });

        // Фильтруем только рабочие дни (понедельник-пятница)
        const workDays = allDates.filter((date) => {
            const dayOfWeek = date.getDay();
            return dayOfWeek !== 0 && dayOfWeek !== 6;
        });

        const total = Array.from(commitsByDate.values()).reduce(
            (sum, count) => sum + count,
            0
        );

        const daysDiff = workDays.length;
        const avg = daysDiff > 0 ? total / daysDiff : 0;

        // Вычисляем тренд: сравниваем первую и вторую половину периода
        let trendPercentage = 0;
        if (workDays.length >= 2) {
            const midPoint = Math.floor(workDays.length / 2);
            const firstHalf = workDays.slice(0, midPoint);
            const secondHalf = workDays.slice(midPoint);

            const firstHalfCommits = firstHalf.reduce((sum, date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return sum + (commitsByDate.get(dateStr) || 0);
            }, 0);

            const secondHalfCommits = secondHalf.reduce((sum, date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return sum + (commitsByDate.get(dateStr) || 0);
            }, 0);

            const firstHalfAvg =
                firstHalf.length > 0 ? firstHalfCommits / firstHalf.length : 0;
            const secondHalfAvg =
                secondHalf.length > 0 ? secondHalfCommits / secondHalf.length : 0;

            if (firstHalfAvg > 0) {
                trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
            }
        }

        const max =
            workDays
                .map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    return commitsByDate.get(dateStr) || 0;
                })
                .filter((count) => count > 0)
                .reduce((m, v) => Math.max(m, v), 0) || 1;

        const chartData = workDays.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const count = commitsByDate.get(dateStr) || 0;
            return {
                date: dateStr,
                count,
                percentage: max > 0 ? (count / max) * 100 : 0,
            };
        });

        return {
            commitsPerDay: chartData,
            average: avg,
            trend: trendPercentage,
        };
    }, [gitAnalyzerInfo, filter.dateStart, filter.dateEnd]);

    const points = commitsPerDay.map(
        (item: { date: string; count: number; percentage: number }) => ({
            id: item.date,
            value: item.count,
            percentage: item.percentage,
            tooltip: `${format(new Date(item.date), "dd MMM yyyy", { locale: ru })}: ${item.count} ${
                item.count === 1 ? "commit" : "commits"
            }`,
        })
    );

    return (
        <DashboardBarsWidget
            title="COMMITS PER DAY"
            stats={[
                {
                    value: average.toFixed(1),
                    label: "Average",
                },
                {
                    value: (
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "2px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {trend >= 0 ? "" : "-"}
                            {Math.abs(trend).toFixed(1)}%
                            <span
                                style={{
                                    color:
                                        trend >= 0
                                            ? "var(--ds-success)"
                                            : "var(--ds-warning)",
                                    fontSize: "0.8em",
                                    lineHeight: 1,
                                }}
                            >
                                {trend >= 0 ? "↗" : "↘"}
                            </span>
                        </span>
                    ),
                    label: "Trend",
                },
            ]}
            points={points}
            emptyState="Нет данных о коммитах за выбранный период"
            barColor="var(--ds-primary-500)"
            minHeightPercent={4}
        />
    );
};

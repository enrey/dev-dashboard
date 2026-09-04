import React, { useContext, useMemo } from "react";

import { format, eachDayOfInterval } from "date-fns";
import { ru } from "date-fns/locale";

import { DashboardBarsWidget } from "../common/DashboardBarsWidget/DashboardBarsWidget";
import { useGitlabData } from "../../../../contexts/data";
import { FilterContext } from "../../../../contexts/filter";

export const MergeRequestsWidget: React.FC = () => {
    const { gitlabData } = useGitlabData();
    const { filter } = useContext(FilterContext);

    const { mrPerDay, average, totalMRs, trend } = useMemo(() => {
        // Группируем MR по датам
        const mrByDate = new Map<string, number>();

        gitlabData.forEach((info) => {
            info.openedDates?.forEach((mrDate) => {
                const date = mrDate.dt.split("T")[0];
                const currentCount = mrByDate.get(date) || 0;
                mrByDate.set(date, currentCount + 1);
            });
        });

        const allDates = eachDayOfInterval({
            start: filter.dateStart,
            end: filter.dateEnd,
        });

        const workDays = allDates.filter((date) => {
            const dayOfWeek = date.getDay();
            return dayOfWeek !== 0 && dayOfWeek !== 6;
        });

        const totalMRs = Array.from(mrByDate.values()).reduce(
            (sum, count) => sum + count,
            0
        );

        const daysDiff = workDays.length;
        const avg = daysDiff > 0 ? totalMRs / daysDiff : 0;

        // Вычисляем тренд: сравниваем первую и вторую половину периода
        let trendPercentage = 0;
        if (workDays.length >= 2) {
            const midPoint = Math.floor(workDays.length / 2);
            const firstHalf = workDays.slice(0, midPoint);
            const secondHalf = workDays.slice(midPoint);

            const firstHalfMRs = firstHalf.reduce((sum, date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return sum + (mrByDate.get(dateStr) || 0);
            }, 0);

            const secondHalfMRs = secondHalf.reduce((sum, date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return sum + (mrByDate.get(dateStr) || 0);
            }, 0);

            const firstHalfAvg =
                firstHalf.length > 0 ? firstHalfMRs / firstHalf.length : 0;
            const secondHalfAvg =
                secondHalf.length > 0 ? secondHalfMRs / secondHalf.length : 0;

            if (firstHalfAvg > 0) {
                trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
            }
        }

        const max =
            workDays
                .map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    return mrByDate.get(dateStr) || 0;
                })
                .filter((count) => count > 0)
                .reduce((m, v) => Math.max(m, v), 0) || 1;

        const chartData = workDays.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const count = mrByDate.get(dateStr) || 0;
            return {
                date: dateStr,
                count,
                percentage: max > 0 ? (count / max) * 100 : 0,
            };
        });

        return {
            mrPerDay: chartData,
            average: avg,
            totalMRs,
            trend: trendPercentage,
        };
    }, [gitlabData, filter.dateStart, filter.dateEnd]);

    const points = mrPerDay.map(
        (item: { date: string; count: number; percentage: number }) => ({
            id: item.date,
            value: item.count,
            percentage: item.percentage,
            tooltip: `${format(new Date(item.date), "dd MMM yyyy", { locale: ru })}: ${item.count} ${
                item.count === 1 ? "MR" : "MRs"
            }`,
        })
    );

    return (
        <DashboardBarsWidget
            title="GITLAB MR OPENED PER DAY"
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
            emptyState="Нет данных о MR за выбранный период"
            barColor="#14b8a6"
            minHeightPercent={4}
        />
    );
};

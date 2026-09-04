import { format, isWeekend } from "date-fns";

import { ConfluenceChangeTypeEnum, PresenceTypes, SourceTypes, ChartTypeEnum } from "shared/enums";
import { GitAnalyzerChartData, GitlabInfoDate } from "shared/models";

import { dedupConfluenceEvents } from "./dedupConfluenceEvents.util";
import { dedupGitJiraTasks } from "./dedupGitJiraTasks.util";
import { TimeLineItemVariant, TimeLineStats } from "../models";

const chartTypeToSourceType: Record<ChartTypeEnum, SourceTypes> = {
    [ChartTypeEnum.ISSUES]: SourceTypes.issue,
    [ChartTypeEnum.COMMITS]: SourceTypes.commit,
    [ChartTypeEnum.MR_OPENED]: SourceTypes.mrOpened,
    [ChartTypeEnum.MR_CLOSED]: SourceTypes.mrClosed,
    [ChartTypeEnum.COMMENTS]: SourceTypes.comment,
    [ChartTypeEnum.CONFLUENCE]: SourceTypes.confluence,
};

const demoSnapshotStart = Date.parse("2025-04-14T00:00:00.000Z");
const demoSnapshotEnd = Date.parse("2025-04-28T23:59:59.999Z");

const toGridDate = (value: string, firstGridDay: Date): string => {
    if (import.meta.env.VITE_DEMO !== "true") {
        return value;
    }

    const itemDate = Date.parse(value);
    if (Number.isNaN(itemDate) || itemDate < demoSnapshotStart || itemDate > demoSnapshotEnd) {
        return value;
    }

    return new Date(itemDate + firstGridDay.getTime() - demoSnapshotStart).toISOString();
};

export const preparingStatData = (
    days: Date[],
    userData: GitAnalyzerChartData,
    chartTypes: ChartTypeEnum[]
): TimeLineStats[] => {
    const firstGridDay = days[0];

    return days.map((date) => {
        const stringDate = format(date, "yyyy-MM-dd");
        const presence =
            userData.presence.find(({ date }) => date === stringDate)?.type ||
            PresenceTypes.standard;
        const weekend = isWeekend(date) || presence !== PresenceTypes.standard;

        const bgcolor = weekend ? "rgba(224, 224, 224, 0.2)" : "background.default";

        const dayTasks = userData.tasks
            .slice()
            .reverse()
            .filter(({ date }) => format(new Date(toGridDate(date, firstGridDay)), "yyyy-MM-dd") === stringDate);

        // Дедуплицируем задачи по номеру
        const dedupedDayTasks = dedupGitJiraTasks(dayTasks);

        const issues = dedupedDayTasks.map(({ issueNumber, issueName, issueUrl, statusTo, date }) => {
            // Формируем title с учетом дедуплицированных данных
            let title = issueNumber + " " + issueName;
            if (statusTo && statusTo.includes("→")) {
                // Если статус содержит стрелку, значит было несколько изменений статуса
                title += ` (${statusTo})`;
            }
            return {
                title,
                url: issueUrl,
                createdAt: toGridDate(date, firstGridDay),
            };
        }) ?? [];

        const commits = userData.gitStatistics
            .filter((ud) => format(new Date(toGridDate(ud.date, firstGridDay)), "yyyy-MM-dd") === stringDate)
            .map(({ commitsArray, webUI }) =>
                commitsArray.map(({ message, total, sha, changedFilesCount, commitDate }) => {
                    let variant = TimeLineItemVariant.small;
                    if (total > 15 && total < 50) variant = TimeLineItemVariant.medium;
                    if (total > 50 && total <= 500) variant = TimeLineItemVariant.large;
                    if (total > 500) variant = TimeLineItemVariant.huge;
                    return {
                        title: `${message}Строк кода: ${total}\nФайлов: ${changedFilesCount}`,
                        variant,
                        url: `${webUI}/commit/${sha}`,
                        createdAt: toGridDate(commitDate, firstGridDay),
                    };
                })
            )
            .flat();

        const mrOpened =
            (userData.gitlabStatistics?.openedDates as GitlabInfoDate[])?.filter((ud) => {
                const stringDt = toGridDate(ud.dt, firstGridDay).split("T")[0];
                return stringDt === stringDate;
            }) ?? [];

        const mrClosed =
            (userData.gitlabStatistics?.mergedDates as GitlabInfoDate[])?.filter((ud) => {
                const stringDt = toGridDate(ud.dt, firstGridDay).split("T")[0];
                return stringDt === stringDate;
            }) ?? [];

        const comments =
            userData.gitlabCommentsStatistics?.items
                .filter((ud) => {
                    const stringDt = toGridDate(ud.dt, firstGridDay).split("T")[0];
                    return stringDt === stringDate;
                })
                .map(({ comment, dt }) => ({
                    title: comment,
                    createdAt: toGridDate(dt, firstGridDay),
                })) ?? [];

        const dayConfluenceEvents = userData.confluence
            .filter((ud) => {
                const stringDt = toGridDate(ud.date, firstGridDay).split("T")[0];
                return stringDt === stringDate;
            });

        // Дедуплицируем события Confluence по pageId (objectId)
        const dedupedConfluenceEvents = dedupConfluenceEvents(dayConfluenceEvents);

        const confluence = dedupedConfluenceEvents
            .map(({ pageTitle, changeType, version, url, count, date }) => {
                const isPageType = changeType === ConfluenceChangeTypeEnum.page;
                const title = isPageType ? "Страница" : "Вложение";
                const countText = count > 1 ? ` (${count})` : "";
                return {
                    title: `${title}:\n${pageTitle}\nВерсия: ${version}${countText}`,
                    url,
                    createdAt: toGridDate(date, firstGridDay),
                };
            }) ?? [];

        const allCharts = [
            {
                items: issues,
                sourceType: SourceTypes.issue,
                chartType: ChartTypeEnum.ISSUES,
            },
            {
                items: commits,
                sourceType: SourceTypes.commit,
                chartType: ChartTypeEnum.COMMITS,
            },
            {
                items: mrOpened.map((item) => ({ ...item, createdAt: toGridDate(item.dt, firstGridDay) })),
                sourceType: SourceTypes.mrOpened,
                chartType: ChartTypeEnum.MR_OPENED,
            },
            {
                items: mrClosed.map((item) => ({ ...item, createdAt: toGridDate(item.dt, firstGridDay) })),
                sourceType: SourceTypes.mrClosed,
                chartType: ChartTypeEnum.MR_CLOSED,
            },
            {
                items: comments,
                sourceType: SourceTypes.comment,
                chartType: ChartTypeEnum.COMMENTS,
            },
            {
                items: confluence,
                sourceType: SourceTypes.confluence,
                chartType: ChartTypeEnum.CONFLUENCE,
            },
        ];

        // Фильтруем charts по выбранным типам
        const filteredCharts = allCharts.filter(({ chartType }) =>
            chartTypes.includes(chartType)
        );

        return {
            id: userData.user.email + userData.user.name + date,
            bgcolor,
            presence,
            isActivity: Boolean(
                issues.length ||
                    commits.length ||
                    mrOpened.length ||
                    mrClosed.length ||
                    comments.length ||
                    confluence.length
            ),
            charts: filteredCharts.map(({ items, sourceType }) => ({
                items,
                sourceType,
            })),
        };
    });
};

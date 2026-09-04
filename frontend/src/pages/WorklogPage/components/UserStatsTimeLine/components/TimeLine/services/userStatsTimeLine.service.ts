import { format, isSameDay } from "date-fns";

import { TaskChangeType } from "shared/enums";
import {
    ConfluenceInfo,
    GitAnalyzerFlatData,
    GitlabCommentItem,
    GitlabInfoDate,
    JiraInfoItem,
} from "shared/models";

import { GetItemsForDateProps, ItemsForDate } from "../models";

export class UserStatsTimeLineService {
    public static getItemsForDate(payload: GetItemsForDateProps): ItemsForDate[] {
        const { date, tasks, gitlabStatistics, gitlabComments, gitStatistics, confluence } = payload;
        this.date = date;
        const tasksChanged = this.tasksChanged(tasks);
        const mrOpened = this.mrOpened(gitlabStatistics?.openedDates || []);
        const mrMerged = this.mrMerged(gitlabStatistics?.mergedDates || []);
        const comments = this.comments(gitlabComments);
        const commits = this.commits(gitStatistics);
        const confluenceChanges = this.confluenceChanges(confluence);
        const items = [
            ...tasksChanged,
            ...mrOpened,
            ...mrMerged,
            ...comments,
            ...commits,
            ...confluenceChanges,
        ];
        return items.sort((a, b) => b.time.localeCompare(a.time));
    }

    private static date: Date;

    private static getFormattedDate(date: string) {
        return format(new Date(date), "HH:mm");
    }

    private static getDataByDay<T, K extends keyof T>(data: T[], filterKey: K): T[] {
        return data.filter((item) => {
            const dateString = item[filterKey] as string | null;
            return dateString !== null && isSameDay(new Date(dateString), this.date);
        });
    }

    private static tasksChanged(tasks: JiraInfoItem[]): ItemsForDate[] {
        const tasksByDay = this.getDataByDay<JiraInfoItem, "date">(tasks, "date");
        const tasksChanged = tasksByDay.map(
            ({
                date: dateCreated,
                issueUrl,
                issueNumber,
                issueName,
                statusTo,
                statusFrom,
                changeType,
            }) => {
                const type =
                    changeType === TaskChangeType.Description
                        ? "Изменение описания задачи"
                        : `${statusFrom} → ${statusTo}`;
                return {
                    time: this.getFormattedDate(dateCreated),
                    total: 0,
                    type,
                    url: issueUrl,
                    text: `${issueNumber} ${issueName}`,
                };
            }
        );
        return tasksChanged || [];
    }

    private static mrOpened(openedDates: GitlabInfoDate[]): ItemsForDate[] {
        const openedDatesByDay = this.getDataByDay<GitlabInfoDate, "dt">(
            openedDates,
            "dt"
        );
        const mrOpened = openedDatesByDay.map(({ dt, url, title }) => ({
            time: this.getFormattedDate(dt),
            total: 0,
            type: "MR opened",
            url: url,
            text: title,
        }));
        return mrOpened || [];
    }

    private static mrMerged(mergedDates: GitlabInfoDate[]): ItemsForDate[] {
        const mergedDatesByDay = this.getDataByDay<GitlabInfoDate, "dt">(
            mergedDates,
            "dt"
        );
        const mrMerged = mergedDatesByDay.map(({ dt, url, title }) => ({
            time: this.getFormattedDate(dt),
            total: 0,
            type: "MR merged",
            url: url,
            text: title,
        }));
        return mrMerged || [];
    }

    private static comments(gitlabComments: GitlabCommentItem[]): ItemsForDate[] {
        const gitlabCommentsByDay = this.getDataByDay<GitlabCommentItem, "dt">(
            gitlabComments,
            "dt"
        );
        const comments = gitlabCommentsByDay.map(({ dt, mrTitle, comment }) => ({
            time: this.getFormattedDate(dt),
            total: 0,
            type: "Comment",
            url: "",
            text: `${mrTitle}: ${comment}`,
        }));
        return comments || [];
    }

    private static commits(gitStatistics: GitAnalyzerFlatData[]): ItemsForDate[] {
        const gitStatisticsByDay = this.getDataByDay<GitAnalyzerFlatData, "date">(
            gitStatistics,
            "date"
        );
        const commits = gitStatisticsByDay.flatMap(({ webUI, commitsArray }) =>
            commitsArray.map(({ commitDate, total, sha, message }) => {
                let radius;
                if (total >= 1 && total < 10) {
                    // Фиксированный размер для маленьких коммитов (1-5 строк)
                    radius = 1;
                } 
                else if (total >= 10 && total < 20) {
                    // Фиксированный размер для маленьких коммитов (1-5 строк)
                    radius = 2;
                } else if (total > 500) {
                    // Максимальный размер для очень больших коммитов
                    radius = 10;
                } else {
                    // Пропорциональный размер для средних коммитов
                    radius = 10 / (500 / total + 2);
                }

                return {
                    time: this.getFormattedDate(commitDate),
                    //Вычисляемое поле total- значение в процентах радиуса круга для отображения кол-ва изменений
                    total: radius,
                    type: "Commit",
                    url: `${webUI}/commit/${sha}`,
                    text: message,
                };
            })
        );
        return commits || [];
    }

    private static confluenceChanges(confluence: ConfluenceInfo[]): ItemsForDate[] {
        const confluenceByDay = this.getDataByDay<ConfluenceInfo, "date">(
            confluence,
            "date"
        );
        const confluenceChanges = confluenceByDay.map(({
            date: dateCreated,
            url,
            pageTitle,
            changeType,
            changerFio,
            added,
            deleted
        }) => {
            const type = changeType === "attachment" ? "Изменение вложения" : "Изменение страницы";
            const changesInfo = added > 0 || deleted > 0
                ? ` (+${added}/-${deleted})`
                : "";
            return {
                time: this.getFormattedDate(dateCreated),
                total: Math.max(added, deleted) > 0 ? Math.min(Math.max(added, deleted), 10) : 0,
                type,
                url,
                text: `${pageTitle}${changesInfo}`,
            };
        });
        return confluenceChanges || [];
    }
}

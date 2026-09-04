import { format, isSameDay } from "date-fns";

import { TaskChangeType } from "shared/enums";
import {
    ConfluenceInfo,
    GitAnalyzerFlatData,
    GitlabCommentItem,
    GitlabInfoDate,
    JiraInfoItem,
    GitlabInfo,
} from "shared/models";

interface ItemsForDate {
    time: string;
    total: number;
    type: string;
    text: string;
    url?: string;
}

interface GroupedData {
    [dateKey: string]: ItemsForDate[];
}

export class OptimizedTimelineService {
    /**
     * Группирует все данные по датам один раз для быстрого доступа
     */
    public static groupDataByDates(payload: {
        gitStatistics: GitAnalyzerFlatData[];
        tasks: JiraInfoItem[];
        gitlabStatistics?: GitlabInfo;
        gitlabComments: GitlabCommentItem[];
        confluence: ConfluenceInfo[];
    }): GroupedData {
        const { gitStatistics, tasks, gitlabStatistics, gitlabComments, confluence } = payload;
        const grouped: GroupedData = {};

        // Группируем commits
        gitStatistics.forEach(({ date, webUI, commitsArray }) => {
            const dateKey = this.getDateKey(date);
            if (!grouped[dateKey]) grouped[dateKey] = [];
            
            commitsArray.forEach(({ commitDate, total, sha, message }) => {
                let radius;
                if (total >= 1 && total < 10) {
                    radius = 1;
                } else if (total >= 10 && total < 20) {
                    radius = 2;
                } else if (total > 500) {
                    radius = 10;
                } else {
                    radius = 10 / (500 / total + 2);
                }

                grouped[dateKey].push({
                    time: this.getFormattedTime(commitDate),
                    total: radius,
                    type: "Commit",
                    url: `${webUI}/commit/${sha}`,
                    text: message,
                });
            });
        });

        // Группируем tasks
        tasks.forEach(({ date, issueUrl, issueNumber, issueName, statusTo, statusFrom, changeType }) => {
            if (date) {
                const dateKey = this.getDateKey(date);
                if (!grouped[dateKey]) grouped[dateKey] = [];
                
                const type = changeType === TaskChangeType.Description
                    ? "Изменение описания задачи"
                    : `${statusFrom} → ${statusTo}`;
                
                grouped[dateKey].push({
                    time: this.getFormattedTime(date),
                    total: 0,
                    type,
                    url: issueUrl,
                    text: `${issueNumber} ${issueName}`,
                });
            }
        });

        // Группируем MR opened
        gitlabStatistics?.openedDates?.forEach(({ dt, url, title }) => {
            const dateKey = this.getDateKey(dt);
            if (!grouped[dateKey]) grouped[dateKey] = [];
            
            grouped[dateKey].push({
                time: this.getFormattedTime(dt),
                total: 0,
                type: "MR opened",
                url,
                text: title,
            });
        });

        // Группируем MR merged
        gitlabStatistics?.mergedDates?.forEach(({ dt, url, title }) => {
            const dateKey = this.getDateKey(dt);
            if (!grouped[dateKey]) grouped[dateKey] = [];
            
            grouped[dateKey].push({
                time: this.getFormattedTime(dt),
                total: 0,
                type: "MR merged",
                url,
                text: title,
            });
        });

        // Группируем comments
        gitlabComments.forEach(({ dt, mrTitle, comment }) => {
            const dateKey = this.getDateKey(dt);
            if (!grouped[dateKey]) grouped[dateKey] = [];
            
            grouped[dateKey].push({
                time: this.getFormattedTime(dt),
                total: 0,
                type: "Comment",
                url: "",
                text: `${mrTitle}: ${comment}`,
            });
        });

        // Группируем confluence
        confluence.forEach(({ date, url, pageTitle, changeType, added, deleted }) => {
            const dateKey = this.getDateKey(date);
            if (!grouped[dateKey]) grouped[dateKey] = [];
            
            const type = changeType === "attachment" ? "Изменение вложения" : "Изменение страницы";
            const changesInfo = added > 0 || deleted > 0 ? ` (+${added}/-${deleted})` : "";
            
            grouped[dateKey].push({
                time: this.getFormattedTime(date),
                total: Math.max(added, deleted) > 0 ? Math.min(Math.max(added, deleted), 10) : 0,
                type,
                url,
                text: `${pageTitle}${changesInfo}`,
            });
        });

        // Сортируем каждый день
        Object.keys(grouped).forEach(dateKey => {
            grouped[dateKey].sort((a, b) => b.time.localeCompare(a.time));
        });

        return grouped;
    }

    /**
     * Получаем события для конкретной даты из уже сгруппированных данных
     */
    public static getItemsForDate(groupedData: GroupedData, date: Date): ItemsForDate[] {
        const dateKey = this.getDateKeyFromDate(date);
        return groupedData[dateKey] || [];
    }

    private static getDateKey(dateString: string): string {
        const date = new Date(dateString);
        return this.getDateKeyFromDate(date);
    }

    private static getDateKeyFromDate(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    private static getFormattedTime(dateString: string): string {
        return format(new Date(dateString), "HH:mm");
    }
}


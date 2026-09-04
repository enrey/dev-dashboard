import { environment } from "environments/environment.prod";
import { axios } from "lib/axios";

import { JiraInfoItem, JiraUserInfo } from "shared/models";

import { GetStatsProps } from "./api.model";

export class JiraApiService {
    /** Возвращает статистику за N последних дней */
    public static async getStatsAfter<T = JiraInfoItem[]>(days: number): Promise<T> {
        const url = `${JiraApiService.env.jiraApiUrl}/dash?forDays=${days}`;

        const result = await JiraApiService.http.get<T>(url);

        return result.data;
    }

    /** Возвращает статистику с - по */
    public static async getStats<T = JiraInfoItem[]>(params: GetStatsProps): Promise<T> {
        const { dateEnd, dateStart } = params;
        const url = `${JiraApiService.env.jiraApiUrl}/Jira/tasks?startDate=${dateStart}&endDate=${dateEnd}`;
        const result = await JiraApiService.http.get<T>(url);

        return result.data;
    }

    /** Возвращает пользователей */
    public static async getUsers<T = JiraUserInfo[]>(): Promise<T> {
        if (JiraApiService.env.disableJiraUsers) {
            return [] as T;
        }

        const url = `${JiraApiService.env.jiraApiUrl}/Jira/users`;

        const result = await JiraApiService.http.get<T>(url);

        return result.data;
    }

    private static env = environment;
    private static http = axios;
}

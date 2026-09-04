import { environment } from "environments/environment.prod";
import { axios } from "lib/axios";

import { DailyPresence } from "shared/models";

import { GetStatsProps } from "./api.model";

export class PresenceApiService {
    private static readonly headers = {
        'Authorization': 'Basic Ol9JRlh2NVFTV1o1MDFSUTZJTjBkaV9qMTAwTjFMYUJjZWhfU0ZNS1drRlE='
    };

    /** Возвращает статистику присутствия с - по */
    public static async getStats<T = DailyPresence[]>(params: GetStatsProps): Promise<T> {
        if (PresenceApiService.env.disablePresence) {
            return [] as T;
        }

        const { dateStart, dateEnd } = params;

        const url = `${PresenceApiService.env.calendarApiUrl}/api_v2/integration/presence?date_from=${dateStart}&date_to=${dateEnd}`;
        const result = await PresenceApiService.http.get<T>(url, {
            headers: PresenceApiService.headers
        });
        return result.data;
    }

    /** Возвращает список пользователей */
    public static async getUsers<T = any[]>(): Promise<T> {
        if (PresenceApiService.env.disablePresence) {
            return [] as T;
        }

        const url = `${PresenceApiService.env.calendarApiUrl}/api_v2/integration/users`;
        const result = await PresenceApiService.http.get<T>(url, {
            headers: PresenceApiService.headers
        });
        return result.data;
    }

    private static env = environment;
    private static http = axios;
}

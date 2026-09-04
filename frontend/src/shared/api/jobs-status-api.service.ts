import { environment } from "environments/environment.prod";
import { axios } from "lib/axios";

import { JobStatus } from "shared/models";

export class JobsStatusApiService {
    /** Возвращает даты последней синхронизации источников данных */
    public static async getStats<T = JobStatus[]>(): Promise<T> {
        const url = `${JobsStatusApiService.env.jobServerUrl}/jobs/list`;
        const result = await JobsStatusApiService.http.get<T>(url);
        return result.data;
    }
    private static env = environment;
    private static http = axios;
}

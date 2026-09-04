import { environment } from "environments/environment.prod";
import { axios } from "lib/axios";

import { ConfluenceInfo, ConfluenceInfoResponse } from "shared/models";

export class ConfluenceApiService {
    public static async getStats(
        dateStart: string,
        dateEnd: string
    ): Promise<ConfluenceInfo[]> {
        const url = `${this.env.confluenceApiUrl}/Confluence/articles?startDate=${dateStart}&endDate=${dateEnd}`;
        const { data } = await this.http.get<ConfluenceInfoResponse>(url);

        return data.items;
    }

    private static env = environment;
    private static http = axios;
}

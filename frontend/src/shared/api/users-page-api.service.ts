import { environment } from "environments/environment.prod";
import { axios } from "lib/axios";

import type { UserPageState } from "shared/models";

interface StateUpdateResponse {
    success: boolean;
    version: number;
}

export class UsersPageApiService {
    public static async getState(): Promise<UserPageState> {
        const url = `${UsersPageApiService.env.usersStateApiUrl}/users-page/state`;
        const result = await UsersPageApiService.http.get<UserPageState>(url);

        return result.data;
    }

    public static async saveState(state: UserPageState): Promise<void> {
        const url = `${UsersPageApiService.env.usersStateApiUrl}/users-page/state`;
        await UsersPageApiService.http.post(url, state);
    }

    public static async clearState(): Promise<void> {
        const url = `${UsersPageApiService.env.usersStateApiUrl}/users-page/state`;
        await UsersPageApiService.http.delete(url);
    }

    public static async updateState(partial: Partial<UserPageState>): Promise<StateUpdateResponse> {
        const url = `${UsersPageApiService.env.usersStateApiUrl}/users-page/state`;
        const result = await UsersPageApiService.http.patch<StateUpdateResponse>(url, partial);

        return result.data;
    }

    public static async stateExists(): Promise<boolean> {
        const url = `${UsersPageApiService.env.usersStateApiUrl}/users-page/state/exists`;
        const result = await UsersPageApiService.http.get<{ exists: boolean }>(url);

        return result.data.exists;
    }

    private static env = environment;
    private static http = axios;
}

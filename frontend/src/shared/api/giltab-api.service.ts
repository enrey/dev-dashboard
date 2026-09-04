import { environment } from "environments/environment.prod";
import { axios } from "lib/axios";

import {
    GitRepoHeadCommit,
    GitlabCommentModel,
    GitlabInfo,
    GitlabUserInfo,
    TasksStatsResponseDto,
} from "shared/models";

export class GitlabApiService {
    public static async getUsers<T = GitlabUserInfo[]>(): Promise<T> {
        if (GitlabApiService.env.disableGitlabUsers) {
            return [] as T;
        }

        const url = `${GitlabApiService.env.gitLabApiUrl}/GitLab/gitlabUsers`;
        const result = await GitlabApiService.http.get<T>(url);

        return result.data;
    }

    public static async getStats<T = GitlabInfo[]>(
        dateStart: string,
        dateEnd: string
    ): Promise<T> {
        const url = `${GitlabApiService.env.gitLabApiUrl}/GitLab/merge-requests?startDate=${dateStart}&endDate=${dateEnd}`;
        const result = await GitlabApiService.http.get<T>(url);

        return result.data;
    }

    public static async getMergeRequestsComments<T = GitlabCommentModel[]>(
        dateStart: string,
        dateEnd: string
    ): Promise<T> {
        const url = `${GitlabApiService.env.gitLabApiUrl}/GitLab/comments?startDate=${dateStart}&endDate=${dateEnd}`;

        const result = await GitlabApiService.http.get<T>(url);

        return result.data;
    }

    /** Получение статистики по таскам */
    public static async getCommitsComments<T = TasksStatsResponseDto[]>(
        dateStart: string,
        dateEnd: string
    ): Promise<T> {
        const url = `${GitlabApiService.env.gitLabApiUrl}/GitLab/tasks/${dateStart}/${dateEnd}`;

        const { data } = await GitlabApiService.http.get<T>(url);

        return data;
    }

    /** Получить последние коммиты из реопзиториев Gitlab'а */
    public static async getReposHeadCommits<T = GitRepoHeadCommit[]>(): Promise<T> {
        const url = `${GitlabApiService.env.gitLabApiUrl}/GitLab/gitlab-repositories-commits`;

        const result = await GitlabApiService.http.get<T>(url);
        return result.data;
    }

    private static env = environment;
    private static http = axios;
}

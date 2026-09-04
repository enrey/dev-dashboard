import { AxiosHeaders, AxiosRequestConfig } from "axios";
import { environment } from "environments/environment.prod";
import { axios } from "lib/axios";

import {
    CommitModel,
    GitAnalyzerInfoModel,
    GitRepoHeadCommit,
    GitInfoModel,
    ProjectModel,
    TaskResponseDto,
} from "shared/models";

import { GetStatsProps } from "./api.model";

interface GetInfoProps {
    userId: number;
    dateStart: string;
    dateEnd: string;
    page?: number;
    action?: string; // ToDo enum
    perPage?: number;
}

export class GitInfoService {
    public static async getInfo(params: GetInfoProps): Promise<GitInfoModel[]> {
        const {
            userId,
            dateEnd,
            dateStart,
            page = 0,
            action = "pushed",
            perPage = 100,
        } = params;

        const url = `${GitInfoService.env.gilLabUrl}/users/${userId}/events?&after=${dateStart}&before=${dateEnd}&per_page=${perPage}&action=${action}&page=${page}`;
        const { status, headers, data } = await GitInfoService.http.get<GitInfoModel[]>(
            url,
            {
                headers: this.headersGit,
            } as AxiosRequestConfig
        );

        if (status !== 200) {
            return [];
        }

        if (page !== 0) {
            return data as GitInfoModel[];
        }

        const totalPages = Number((headers as AxiosHeaders).get("X-Total-Pages"));

        const pagePromises: any[] = [];

        for (let i = 2; i <= totalPages; i++) {
            pagePromises.push(this.getInfo({ userId, dateStart, dateEnd, page: i }));
        }

        const otherPages = await Promise.all(pagePromises);

        return [...data, ...otherPages.flat()];
    }

    // static async getAllProjects(page = 0): Promise<ProjectModel[]> {
    //     const url = `${GitInfoService.env.gilLabUrl}/projects`;
    //
    //     const result = await GitInfoService.http.get<ProjectModel[]>(url, {headers: this.headersGit})
    //
    //     if (result.status !== 200) {
    //         return [];
    //     }
    //
    //     if (page !== 0) {
    //         return result.data;
    //     }
    //
    //     const totalPages = Number(result.headers.get('X-Total-Pages'));
    //
    //     const pagePromises: any[] = [];
    //
    //     for (let i = 2; i <= totalPages; i++) {
    //         pagePromises.push(this.getInfo({userId, dateStart, dateEnd, page: i}))
    //     }
    //
    //     const otherPages = await Promise.all(pagePromises);
    //
    //     return [...result.data, ...otherPages.flat()]
    // }

    public static async getProjectById<T = ProjectModel>(id: string): Promise<T | null> {
        const url = `${GitInfoService.env.gilLabUrl}/projects/${id}`;
        const { status, data } = await GitInfoService.http.get<T>(url, {
            headers: GitInfoService.headersGit,
        } as AxiosRequestConfig);

        return status !== 200 ? null : data;
    }

    public static async getCommitInfo<T = CommitModel>(
        projectId: number,
        commitId: string
    ): Promise<T | null> {
        const url = `${GitInfoService.env.gilLabUrl}/projects/${projectId}/repository/commits/${commitId}`;

        const { data, status } = await GitInfoService.http.get<T>(url, {
            headers: GitInfoService.headersGit,
        } as AxiosRequestConfig);

        return status !== 200 ? null : data;
    }

    /** Запрос в git-analyzer api */
    public static async getGitAnalyzerInfo<T = GitAnalyzerInfoModel[]>(
        params: GetStatsProps
    ): Promise<T> {
        const { dateStart, dateEnd } = params;
        const url = `${GitInfoService.env.gitAnalyzerUrl}/Git/commits?startDate=${dateStart}&endDate=${dateEnd}`;
        const result = await GitInfoService.http.get<T>(url);

        return result.data;
    }

    // Получение статистики по таскам
    public static async getTasksFromGitAnalyzer<T = TaskResponseDto[]>(
        dateStart: string,
        dateEnd: string
    ): Promise<T> {
        const url = `${GitInfoService.env.gitAnalyzerUrl}/Git/tasks?startDate=${dateStart}&endDate=${dateEnd}`;
        const { data } = await GitInfoService.http.get<T>(url);

        return data;
    }

    /** Получить последние коммиты из репозиториев в git-analyzer api */
    public async getReposHeadCommits<T = GitRepoHeadCommit[]>(): Promise<T> {
        const url = `${GitInfoService.env.gitAnalyzerUrl}/statistics/repositories-commits`;
        const result = await GitInfoService.http.get<T>(url);

        return result.data;
    }

    /** Отправить запрос на обновление репозитория */
    public async getUpdateRepository<T = void>(repoUrl: string): Promise<T> {
        const url = `${
            GitInfoService.env.gitAnalyzerUrl
        }/statistics/update-repositories/${encodeURIComponent(repoUrl)}`;

        const result = await GitInfoService.http.get<T>(url);

        return result.data;
    }

    private static env = environment;
    private static http = axios;

    private static get headersGit() {
        return this.env.GIT_TOKEN ? { "Private-Token": this.env.GIT_TOKEN } : {};
    }
}

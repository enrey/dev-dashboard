import { sortBy } from "lodash";
import orderBy from "lodash/orderBy";

import { ConfluenceChangeTypeEnum, DatasourceStatusEnum } from "shared/enums";
import {
    DailyPresence,
    GitAnalyzerChartData,
    GitAnalyzerFlatData,
    ChartUser,
    GitlabCommentModel,
    GitlabInfo,
    GitlabUserInfo,
    JiraInfoItem,
    JiraUserInfo,
    GitAnalyzerInfoCommitModel,
    ConfluenceInfo,
} from "shared/models";
import { JiraTaskService } from "shared/services";

export interface ProcessGitInfoProps {
    users: ChartUser[];
    gitData: GitAnalyzerFlatData[];
    tasksData: JiraInfoItem[];
    gitlabData: GitlabInfo[];
    jiraUsers: JiraUserInfo[];
    gitlabUsers: GitlabUserInfo[];
    gitlabMrComments: GitlabCommentModel[];
    presence: DailyPresence[];
    confluenceData: ConfluenceInfo[];
}

const groupByEmail = <T,>(
    items: T[],
    getEmail: (item: T) => string | null | undefined
) => {
    const result = new Map<string, T[]>();

    items.forEach((item) => {
        const email = getEmail(item)?.toLowerCase();

        if (!email) {
            return;
        }

        const current = result.get(email);

        if (current) {
            current.push(item);
        } else {
            result.set(email, [item]);
        }
    });

    return result;
};

const mapByEmail = <T,>(
    items: T[],
    getEmail: (item: T) => string | null | undefined
) => {
    const result = new Map<string, T>();

    items.forEach((item) => {
        const email = getEmail(item)?.toLowerCase();

        if (email) {
            result.set(email, item);
        }
    });

    return result;
};

export function processGitInfoService(
    params: ProcessGitInfoProps
): GitAnalyzerChartData[] {
    const {
        users,
        gitData,
        tasksData,
        gitlabData,
        jiraUsers,
        gitlabUsers,
        gitlabMrComments,
        presence,
        confluenceData,
    } = params;

    if (!users) {
        return [];
    }
    const gitByEmail = groupByEmail(gitData, ({ email }) => email);
    const jiraTasksByEmail = groupByEmail(tasksData, ({ changerEmail }) => changerEmail);
    const presenceByEmail = groupByEmail(presence, ({ email }) => email);
    const confluenceByEmail = groupByEmail(confluenceData, ({ changer }) => changer);
    const jiraUserByEmail = mapByEmail(jiraUsers, ({ email }) => email);
    const gitlabUserByEmail = mapByEmail(gitlabUsers, ({ email }) => email);
    const gitlabDataByEmail = mapByEmail(gitlabData, ({ email }) => email);
    const gitlabCommentsByEmail = mapByEmail(gitlabMrComments, ({ email }) => email);

    const result = users.map((user) => {
        const email = user.email.toLowerCase();
        let statistics = gitByEmail.get(email) ?? [];

        const changedFilesCount = (stat: GitAnalyzerInfoCommitModel[]): number => {
            return stat.reduce(
                (acc, { changedFilesCount }) => acc + changedFilesCount,
                0
            );
        };

        const totalCommits = statistics.reduce((acc, stat) => acc + stat.commitsCount, 0);
        const totalAdded = statistics.reduce((acc, stat) => acc + stat.added, 0);
        const totalDeleted = statistics.reduce((acc, stat) => acc + stat.deleted, 0);
        const totalChurn = statistics.reduce((acc, stat) => acc + stat.total, 0);
        const totalChangedFiles = statistics.reduce(
            (acc, stat) => acc + changedFilesCount(stat.commitsArray),
            0
        );
        const totalProjects = [
            ...new Set(
                statistics.map((gitAnalizerData) => gitAnalizerData.repositoryName)
            ),
        ];

        const churn = statistics.map(({ date, total }) => ({ date, churn: total }));

        const ds = [];

        if (jiraUserByEmail.has(email)) {
            ds.push(DatasourceStatusEnum.MAIL);
        }
        if (statistics.length) {
            ds.push(DatasourceStatusEnum.GIT);
        }

        const curUserTasks = jiraTasksByEmail.get(email) ?? [];
        if (curUserTasks && curUserTasks.length) {
            ds.push(DatasourceStatusEnum.JIRA);
        }

        const curUserPresence = presenceByEmail.get(email) ?? [];
        const combineUserTask = JiraTaskService.combineTask(curUserTasks);
        const allIssues = combineUserTask.length;
        const bugsIssues = JiraTaskService.bugsInTasks(combineUserTask).length;

        const curUserGitlabData = gitlabDataByEmail.get(email);
        const gitlabUser = gitlabUserByEmail.get(email);

        if (gitlabUser) {
            ds.push(DatasourceStatusEnum.GITLAB);
        }

        statistics = orderBy(statistics, [({ date }) => date], ["asc"]);

        const jiraUser = jiraUserByEmail.get(email);
        const currUserGitlabComments = gitlabCommentsByEmail.get(email);

        const mappedCommentaries = {
            ...currUserGitlabComments,
            items: currUserGitlabComments?.items ?? [],
        };

        const confluence = confluenceByEmail.get(email) ?? [];

        if (confluence.length) {
            ds.push(DatasourceStatusEnum.CONFLUENCE);
        }
        const totalConfluenceChurn = confluence.reduce(
            (acc, stat) => acc + stat.churn,
            0
        );
        const uniqConfluenceId: number[] = [];
        confluence.forEach(({ changeType, objectId }) => {
            const isChangingPage = changeType === ConfluenceChangeTypeEnum.page;
            const isUniqId = !uniqConfluenceId.includes(objectId);
            if ((isChangingPage && isUniqId) || !isChangingPage) {
                uniqConfluenceId.push(objectId);
            }
        });
        return {
            user,
            login: curUserGitlabData?.username,
            gitStatistics: statistics,
            totalCommits,
            totalAdded,
            totalDeleted,
            totalChurn,
            totalChangedFiles,
            churn,
            totalProjects,
            allIssues,
            bugsIssues,
            mrOpened: curUserGitlabData ? curUserGitlabData.openedTotal : 0,
            mrMerged: curUserGitlabData ? curUserGitlabData.mergedTotal : 0,
            gitlabStatistics: curUserGitlabData,
            totalComments: currUserGitlabComments
                ? currUserGitlabComments.totalComments
                : 0,
            gitlabCommentsStatistics: mappedCommentaries,
            dataSources: ds,
            gitUrl: gitlabUser ? gitlabUser.url : null,
            jiraUrl: jiraUser ? jiraUser.url : null,
            tasks: curUserTasks,
            presence: curUserPresence,
            confluence,
            totalConfluenceChurn,
            totalUniqConfluence: uniqConfluenceId.length,
        } as GitAnalyzerChartData;
    });

    return sortBy(result, (item) => item.user.name);
}

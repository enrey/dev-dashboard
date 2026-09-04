import { MainTaskStatus } from "shared/enums";
import { CombinedJiraTask } from "shared/models";

export class UserStatsService {
    /**
     * Задач взято в разработку:
     * количество уникальных FeatureNumber у которых был statusTo=разработка
     */
    public static startedIssues(userTask: CombinedJiraTask[]): CombinedJiraTask[] {
        const startedIssues =
            userTask?.filter(
                ({ status }) =>
                    status?.findIndex(
                        ({ statusTo }) => statusTo === MainTaskStatus.Developing
                    ) !== -1
            ) || [];
        return this.sortingIssuesAsc(startedIssues);
    }

    /**
     * Задач завершено:
     * количество уникальных FeatureNumber у которых был statusTo=Разработка завершена
     * или statusTo=Готово к тестированию
     */
    public static fixedIssues(userTask: CombinedJiraTask[]): CombinedJiraTask[] {
        const fixedIssues =
            userTask?.filter(
                ({ status }) =>
                    status?.findIndex(
                        ({ statusTo }) =>
                            statusTo === MainTaskStatus.DevelopingDone ||
                            statusTo === MainTaskStatus.ReadyForTest
                    ) !== -1
            ) || [];
        return this.sortingIssuesAsc(fixedIssues);
    }

    /**
     * Задач в работе:
     * количество уникальных FeatureNumber у которых был statusFrom=Разработка,
     * но не было statusTo=Разработка завершена или statusTo=Готово к тестированию
     */
    public static inprogressIssues(userTask: CombinedJiraTask[]): CombinedJiraTask[] {
        const inprogressIssues =
            userTask?.filter(
                ({ status }) =>
                    status?.findIndex(
                        ({ statusFrom }) => statusFrom === MainTaskStatus.Developing
                    ) !== -1 &&
                    status?.findIndex(
                        ({ statusTo }) =>
                            statusTo === MainTaskStatus.DevelopingDone ||
                            statusTo === MainTaskStatus.ReadyForTest
                    ) === -1
            ) || [];
        return this.sortingIssuesAsc(inprogressIssues);
    }

    private static sortingIssuesAsc(issues: CombinedJiraTask[]): CombinedJiraTask[] {
        return issues.sort((a, b) => {
            if (a.issueNumber > b.issueNumber) return 1;
            else if (a.issueNumber < b.issueNumber) return -1;
            return 0;
        });
    }
}

import { useContext } from "react";

import { groupBy } from "lodash";

import { TaskType } from "shared/enums";
import { Contributor } from "shared/models";
import { getProjectsList } from "shared/utils";

import { GroupedPresence, PureUnknownTasksModel } from "./models";
import {
    getHybridGitAndJira,
    getLastTaskData,
    getMapAsGroupedByProject,
    getNormalizedGitTasksListUtil,
    getProjectsStats,
    getPureUnknownTasksUtil,
    getTaskWithMrContributor,
} from "./utils";
import { useJiraData, useGitData, useGitlabData, usePresenceData } from "../../../../contexts/data";
import { FilterContext } from "../../../../contexts/filter";
import {
    CommonTaskType,
    MrsModel,
    TaskWithMrAndJiraDataModel,
    UnknownTaskModel,
    UseStatsWorkflowDataReturnDataModel,
} from "../../models";
import { useFilterBySource } from "../index";

export const useStatsWorkflowData = (): UseStatsWorkflowDataReturnDataModel => {
    const { filter } = useContext(FilterContext);
    const { tasksData, tasksStats: tasksWithCommentary, jiraUsers } = useJiraData({
        includeTaskData: true,
    });
    const { gitTasksList } = useGitData({ includeTaskData: true });
    const { gitlabData: mrsData } = useGitlabData();
    const { presence } = usePresenceData();
    const { users: usersFromFilter, projects: projectsFromFilter } = filter;

    /**
     * Последняя запись изменения в задаче с историей изменений других задач
     */
    const lastTaskData = getLastTaskData(tasksData);

    /** Получаем весь список проектов */
    const projectList = getProjectsList(lastTaskData);

    /** Получение емэйла участников из фильтра */
    const parsedUsersEmailToStringList = usersFromFilter.map(
        (user: Contributor) => user.email
    );

    /** Получение всех открытых и закрытых мров */
    const mappedOpenAndClosedMrs: MrsModel = mrsData.reduce(
        (prev, cur) => {
            return {
                openMrs: [...prev.openMrs, ...cur.openedDates],
                closeMrs: [...prev.closeMrs, ...cur.mergedDates],
            } as MrsModel;
        },
        { openMrs: [], closeMrs: [] } as MrsModel
    );

    /** Комбинирование присутствие в один объект по имени*/
    const grouppedMyNamePresence: GroupedPresence[] = Object.entries(
        groupBy(presence, "email")
    ).map(([key, value]) => {
        return {
            email: key,
            presence: value,
        };
    });

    /** Неопределенные таски */
    const unknownTasks = gitTasksList.filter((task) => task.task === "???")[0];

    /** Вынес коммиты в отдельную переменную для упрощения фильтрации */
    const pureUnknownTasks = getPureUnknownTasksUtil(
        unknownTasks,
        grouppedMyNamePresence,
        parsedUsersEmailToStringList
    );

    const mapUnknownTasksByRepository = groupBy(
        pureUnknownTasks,
        (commit: PureUnknownTasksModel) => commit.repositoryName
    );

    /** группируем потеряшки по проектам */
    const mapAsGrouppedByProject = getMapAsGroupedByProject(
        mapUnknownTasksByRepository,
        jiraUsers
    );

    let unknownTasksWithMappedCommits = mapAsGrouppedByProject.map((task) => ({
        ...task,
        commits: task.commits.map((commit) => {
            for (const contributor of task.contributors) {
                if (commit.email.toLowerCase() === contributor.email.toLowerCase()) {
                    return {
                        ...commit,
                        contributor,
                    };
                }
            }
        }),
        firstContributor: task.contributors[0],
        firstContributorName: task.contributors[0].name,
    }));

    unknownTasksWithMappedCommits = useFilterBySource(unknownTasksWithMappedCommits);

    const unknownTaskAsProject = {
        projectName: "???",
        projectTaskList: unknownTasksWithMappedCommits || [],
        totalTasks: unknownTasksWithMappedCommits?.length || 0,
    };

    /** Фильтрация потеряшек по проектам */
    if (projectsFromFilter.length && !projectsFromFilter.includes("???")) {
        unknownTasksWithMappedCommits = [];
    }

    /** Комбинирование тасок гита и джиры, если есть мэтч по номеру.
     *  Если нет, то возвращаем модифицированные таски гита.
     *  В конце происходит отсеиваение пустых элментов и потеряшек */
    const hybridGitAndJira = getHybridGitAndJira(
        tasksWithCommentary,
        jiraUsers,
        lastTaskData
    );

    /** Добавляем к данным участников по статистике коммитов данные из джиры */
    const deletedAddedCodeTasksWithNormalizedContributors = getNormalizedGitTasksListUtil(
        gitTasksList,
        jiraUsers
    );

    /** Ассоциируем открытие и закрытие МР с участниками.
     *  Добавляем поле contributorEmails для фильтрации.
     *  Добавлям поле firstContributor для соритровки */
    let taskWithMrContributor = getTaskWithMrContributor(
        hybridGitAndJira,
        deletedAddedCodeTasksWithNormalizedContributors,
        mappedOpenAndClosedMrs,
        jiraUsers,
        grouppedMyNamePresence
    );

    taskWithMrContributor = useFilterBySource(taskWithMrContributor);

    /** Получение данных о проекте */
    const projectsInformation = projectList
        .map((project) =>
            getProjectsStats(
                project,
                taskWithMrContributor as CommonTaskType[],
                parsedUsersEmailToStringList
            )
        )
        // @ts-expect-error: Concatenating different types of project data that require runtime type checking
        .concat(unknownTaskAsProject);

    /** Фильтрация обычных задач по участникам */
    if (parsedUsersEmailToStringList.length) {
        taskWithMrContributor = taskWithMrContributor.filter((task) => {
            let includesInTask = false;
            for (const contributor of usersFromFilter) {
                includesInTask =
                    includesInTask || task.contributorsEmails.includes(contributor.email);
            }
            return includesInTask;
        });
    }

    /** Условия отображения неопознанных тасок */
    const displayUnknownTasksConditions =
        (projectsFromFilter.length === 1 && projectsFromFilter.includes("???")) ||
        projectsFromFilter.length === 0;

    /** Число сопряженных тасок из джиры, которые совпали с данными из гита */
    const quantityOfTasks =
        taskWithMrContributor.filter(
            (task) =>
                (task as TaskWithMrAndJiraDataModel)?.issueType &&
                (task as TaskWithMrAndJiraDataModel)?.issueType !== TaskType.Bug
        )?.length || 0;

    /** Число сопряженных багов из джиры, которые совпали с данными из гита */
    const quantityOfBugs =
        taskWithMrContributor.filter(
            (task) =>
                (task as TaskWithMrAndJiraDataModel)?.issueType &&
                (task as TaskWithMrAndJiraDataModel)?.issueType === TaskType.Bug
        )?.length || 0;

    const quantityOfUnidentified =
        taskWithMrContributor.length -
        quantityOfBugs -
        quantityOfTasks +
        unknownTaskAsProject.totalTasks;
    /** Фильтрация по проектам */
    if (projectsFromFilter?.length) {
        taskWithMrContributor = taskWithMrContributor.filter((task) => {
            let includesInProject = false;
            for (const project of projectsFromFilter) {
                includesInProject = includesInProject || task?.project === project;
            }
            return includesInProject;
        });
    }

    const allFilterStats = {
        quantityOfTasks,
        quantityOfBugs,
        quantityOfUnidentified,
    };
    const totalItem =
        taskWithMrContributor?.length + unknownTasksWithMappedCommits?.length;
    return {
        allFilterStats,
        displayUnknownTasksConditions,
        projectsInformation,
        tasksList: taskWithMrContributor as unknown as CommonTaskType[],
        totalItem,
        unknownTasks: unknownTasksWithMappedCommits as unknown as UnknownTaskModel[],
    };
};

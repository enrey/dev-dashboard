import { FC, useContext, useEffect, useRef } from "react";

import { Box, Paper } from "@mui/material";
import { isAfter } from "date-fns";
import { sortBy } from "lodash";
import { useProjectsInfo } from "shared/hooks/useProjectInfo.hook";
import { reduceProjectsQuery } from "shared/utils/reduceProjectsQuery";

import { ChartUser } from "shared/models";
import { convertUsersToUsersEmail } from "shared/utils";

import {
    TimeRangePicker,
    TimeRange,
    createAbsoluteRange,
    detectRelativeRange,
} from "../TimeRangePicker";
import { FilterActions } from "./components/FilterActions";
import { FilterProject } from "./components/FilterProject";
import { FilterUser } from "./components/FilterUser";
import { LegendFilter } from "./components/LegendFilter";
import { FilterFromEnum } from "./enum";
import { useQueryParam } from "./hook/useQueryParam";
import { FilterData, FilterProps } from "./models";
import { useUsersData, useGitData } from "../../../contexts/data";
import { FilterContext } from "../../../contexts/filter";

import { formatDateToFormat, formatQueryParam } from ".";
import "./Filter.scss";

export const Filter: FC<FilterProps> = ({
    from = FilterFromEnum.git,
    skipUrlSync = false,
    children,
}) => {
    const { initFilter, filter: filters, setFilter } = useContext(FilterContext);
    const { users, jiraUsers: jiraUsersList } = useUsersData();
    const { projects: projectList } = useGitData();

    const { projectList: projectListJiraPage } = useProjectsInfo();
    const {
        setSearchParams,
        projectArrayQueryParam,
        projectsQueryParam,
        usersQueryParam,
        dateStartQueryParam,
        dateEndQueryParam,
    } = useQueryParam();

    /** Начальное значение для временного диапазона */
    const timeRange: TimeRange = (() => {
        const fromDate = new Date(dateStartQueryParam!);
        const toDate = new Date(dateEndQueryParam!);

        // Пытаемся определить, является ли диапазон относительным
        const relativeRange = detectRelativeRange(fromDate, toDate);
        if (relativeRange) {
            return relativeRange;
        }

        // Если нет, создаём абсолютный диапазон
        return createAbsoluteRange(fromDate, toDate);
    })();

    /** Список юзеров */
    const userList = sortBy(users, "name");

    /** Добавление проектов в строку параметров из селекта */
    const setProjects = (projects: string[]) => {
        setSearchParams({
            dateStart: dateStartQueryParam!,
            dateEnd: dateEndQueryParam!,
            ...formatQueryParam(usersQueryParam, reduceProjectsQuery(projects)),
        });
    };
    /** Добавление разработчиков в строку параметров из селекта */
    const setUsers = (users: ChartUser[]) => {
        setSearchParams({
            dateStart: dateStartQueryParam!,
            dateEnd: dateEndQueryParam!,
            ...formatQueryParam(convertUsersToUsersEmail(users), projectsQueryParam),
        });
    };

    /** Обработчик изменения временного диапазона */
    const handleTimeRangeChange = (range: TimeRange) => {
        setSearchParams({
            dateStart: formatDateToFormat(range.from.toString()),
            dateEnd: formatDateToFormat(range.to.toString()),
            ...formatQueryParam(usersQueryParam, projectsQueryParam),
        });
    };

    /** Проверка фильтра на некорректность */
    const checkIncorrectFilters = (): boolean => {
        /** Проверяем что дата "По" не раньше даты начала иначе возвращаем дату из фильтра
         * для предотвращения некорректного ручного ввода даты*/
        const disabledUpdate = isAfter(
            new Date(dateStartQueryParam),
            new Date(dateEndQueryParam)
        );
        if (disabledUpdate) {
            setSearchParams({
                dateStart: dateStartQueryParam!,
                dateEnd: formatDateToFormat(filters.dateEnd.toString()),
                ...formatQueryParam(usersQueryParam, projectsQueryParam),
            });
            return true;
        }
        return false;
    };

    const updateData = (data: FilterData, _forceUpdate: boolean = false) => {
        // React Query автоматически обновит данные при изменении дат в фильтре
        setFilter(data);
    };

    const usersFilterList = userList.map((user) => {
        for (const jiraUser of jiraUsersList) {
            if (jiraUser.email.toLowerCase() === user.email.toLowerCase()) {
                return {
                    ...user,
                    name: jiraUser.displayName,
                };
            }
        }

        return {
            ...user,
        };
    });

    /** Метод для парса в строку email разработчиков.  */
    const parseQueryUsers = (usersQueryString: string | null = "") => {
        return usersFilterList.reduce((prev, cur, index) => {
            if (usersQueryString?.includes(cur.email)) {
                return [...prev, { ...cur, order: index + 1 }];
            }
            return prev;
        }, [] as ChartUser[]);
    };

    const parsedUsers = parseQueryUsers(usersQueryParam!);

    const handleUpdateData = (forceUpdate = false) => {
        if (checkIncorrectFilters()) return;
        const newFilter: FilterData = {
            /** У дат стоит оператор ! потому, что у них проинициализировано
             *  начальное значение в хуке useSearchParams*/
            dateStart: new Date(dateStartQueryParam!),
            dateEnd: new Date(dateEndQueryParam!),
            projects: projectArrayQueryParam,
            users: [...parsedUsers],
            sources: filters.sources,
        };

        setSearchParams({
            dateStart: dateStartQueryParam!,
            dateEnd: dateEndQueryParam!,
            ...formatQueryParam(usersQueryParam, projectsQueryParam),
        });

        updateData(newFilter, forceUpdate);
    };

    const shouldSkipNextUpdate = useRef(false);
    const prevDateParams = useRef({ start: dateStartQueryParam, end: dateEndQueryParam });
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (skipUrlSync) {
            shouldSkipNextUpdate.current = true;
            return;
        }

        if (shouldSkipNextUpdate.current) {
            shouldSkipNextUpdate.current = false;
            return;
        }

        // Проверяем, изменились ли параметры дат (но не при первом рендере)
        const datesChanged =
            !isFirstRender.current &&
            (prevDateParams.current.start !== dateStartQueryParam ||
                prevDateParams.current.end !== dateEndQueryParam);

        // Обновляем предыдущие значения дат
        prevDateParams.current = { start: dateStartQueryParam, end: dateEndQueryParam };

        // Помечаем, что первый рендер прошел
        if (isFirstRender.current) {
            isFirstRender.current = false;
        }

        // Если изменились даты, принудительно обновляем данные с сервера
        handleUpdateData(datesChanged);
    }, [
        users,
        usersQueryParam,
        projectsQueryParam,
        dateStartQueryParam,
        dateEndQueryParam,
        skipUrlSync,
    ]);

    return (
        <>
            <Paper
                className="filter-shell"
                sx={{ bgcolor: "background.paper", position: "relative", flexShrink: 0 }}
            >
                <Box className="filter-content">
                    <Box className="filter-selectors">
                        <FilterUser
                            setUsers={setUsers}
                            usersFilterList={usersFilterList}
                            selectUsers={parseQueryUsers(usersQueryParam)}
                        />
                        <FilterProject
                            options={
                                from === "statsWorkflow"
                                    ? projectListJiraPage
                                    : projectList
                            }
                            limitTags={from === "git" ? 1 : 3}
                            setProjects={setProjects}
                        />
                        {children}
                        <Box component="div" className="filter-legend-wrap">
                            <LegendFilter />
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Фиксированный блок с датами и кнопкой обновить */}
            <Box className="filter-actions-wrap">
                <TimeRangePicker value={timeRange} onChange={handleTimeRangeChange} />
                <FilterActions handleUpdateData={handleUpdateData} />
            </Box>
        </>
    );
};

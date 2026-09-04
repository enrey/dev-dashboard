import {
    FC,
    useContext,
    useMemo,
    MouseEvent,
    useCallback,
    useEffect,
    useState,
} from "react";

import { Box, Table, TableContainer, Typography } from "@mui/material";
import { eachDayOfInterval } from "date-fns";
import { orderBy as lodashOrderBy } from "lodash";
import { Outlet } from "react-router-dom";

import { ScrollByGrabbing } from "shared/components";
import type { GitAnalyzerChartData, UserPageState } from "shared/models";

import { EnhancedTableHead } from "./TableHead";
import { UsersTableBody } from "./UsersTableBody";
import { UsersTableRow } from "./UsersTableRow";
import { ColumnProps, MappedNormalizedData, UsersTableProps } from "./models";
import { mappedDataWithNormalizedUser, preparingColumns } from "./utils";
import { useJiraData } from "../../../../contexts/data";
import { FilterContext } from "../../../../contexts/filter";
import { usersPageStorage } from "shared/services";
import { LegendHeader } from "./LegendHeader";
import styles from "./UsersTable.module.scss";

export const UsersTable: FC<UsersTableProps> = ({
    data,
    filter,
    selectedRoles = [],
    showWithoutRoles = false,
}) => {
    const { jiraUsers } = useJiraData();
    const { tableSort, setTableSort } = useContext(FilterContext);

    // ОПТИМИЗАЦИЯ: Загружаем userNames, userRoles и linkedEmails из users.state
    const [userNames, setUserNames] = useState<UserPageState["userNames"]>({});
    const [userRoles, setUserRoles] = useState<UserPageState["userRoles"]>({});
    const [linkedEmails, setLinkedEmails] = useState<UserPageState["linkedEmails"]>({});

    useEffect(() => {
        let isMounted = true;
        usersPageStorage
            .load()
            .then((state) => {
                if (isMounted) {
                    setUserNames(state.userNames);
                    setUserRoles(state.userRoles);
                    setLinkedEmails(state.linkedEmails);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setUserNames({});
                    setUserRoles({});
                    setLinkedEmails({});
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const timeLineDays = useMemo(
        () =>
            eachDayOfInterval({
                start: filter.dateStart,
                end: filter.dateEnd,
            }),
        [filter.dateStart, filter.dateEnd]
    );

    const tableColumns: ColumnProps[] = useMemo(
        () => preparingColumns(timeLineDays),
        [timeLineDays]
    );

    // Добавляем пользователей с ролями, отсутствующих в текущей выборке
    const mergedData = useMemo(() => {
        const existingEmails = new Set(data.map((d) => d.user.email));
        const missingUsers: GitAnalyzerChartData[] = Object.keys(userRoles)
            .filter((email) => !existingEmails.has(email))
            .map((email) => ({
                user: { email, name: userNames[email] || email, order: 1 },
                login: email,
                gitStatistics: [],
                totalCommits: 0,
                totalAdded: 0,
                totalDeleted: 0,
                totalChurn: 0,
                totalChangedFiles: 0,
                churn: [],
                totalProjects: [],
                allIssues: 0,
                bugsIssues: 0,
                mrOpened: 0,
                mrMerged: 0,
                totalComments: 0,
                gitlabCommentsStatistics: {
                    email,
                    items: [],
                    totalComments: 0,
                    username: "",
                },
                totalDailyMessages: 0,
                dataSources: [],
                gitUrl: "",
                jiraUrl: "",
                tasks: [],
                presence: [],
                confluence: [],
                totalConfluenceChurn: 0,
                totalUniqConfluence: 0,
            }));
        return [...data, ...missingUsers];
    }, [data, userRoles, userNames]);

    // Данные уже приходят схлопнутыми из DataContext
    const tableRows = useMemo(
        () => mappedDataWithNormalizedUser(mergedData, jiraUsers, userNames),
        [mergedData, jiraUsers, userNames]
    );

    const isDisplayNameMapped = useCallback(
        (row: MappedNormalizedData) => {
            const hasMappedName = Boolean(userNames[row.user.email]);
            const hasJiraName = row.user.isMatched;
            const displayNameDifferentFromEmail =
                row.displayName.trim().length > 0 && row.displayName !== row.user.email;

            return hasMappedName || hasJiraName || displayNameDifferentFromEmail;
        },
        [userNames]
    );

    const compareDisplayNameRows = useCallback(
        (
            leftRow: (typeof tableRows)[number],
            rightRow: (typeof tableRows)[number],
            order: "asc" | "desc" = "asc"
        ) => {
            const leftIsUnmapped = !isDisplayNameMapped(leftRow);
            const rightIsUnmapped = !isDisplayNameMapped(rightRow);

            if (leftIsUnmapped !== rightIsUnmapped) {
                return leftIsUnmapped ? 1 : -1;
            }

            const compareResult = leftRow.displayName.localeCompare(
                rightRow.displayName,
                "ru",
                {
                    sensitivity: "base",
                    numeric: true,
                }
            );

            return order === "asc" ? compareResult : -compareResult;
        },
        [isDisplayNameMapped]
    );

    const tableRowsWithNumber = useMemo(() => {
        const sortedByDisplayName = [...tableRows].sort((leftRow, rightRow) =>
            compareDisplayNameRows(leftRow, rightRow, "asc")
        );

        return sortedByDisplayName.map((row, index) => ({
            ...row,
            rowNumber: index + 1,
        }));
    }, [tableRows, compareDisplayNameRows]);

    // Фильтруем по ролям
    const filteredTableRows = useMemo(() => {
        // Если не выбрано ни одного фильтра - показываем всех
        if (selectedRoles.length === 0 && !showWithoutRoles) {
            return tableRowsWithNumber;
        }

        return tableRowsWithNumber.filter((row) => {
            const userRolesList = userRoles[row.user.email] || [];
            const hasRole = userRolesList.length > 0;

            // Если выбран фильтр "Без ролей"
            if (showWithoutRoles && !hasRole) {
                return true;
            }

            // Если выбраны конкретные роли
            if (selectedRoles.length > 0 && hasRole) {
                // Проверяем, есть ли хотя бы одна из выбранных ролей
                return userRolesList.some((role) => selectedRoles.includes(role.id));
            }

            return false;
        });
    }, [tableRowsWithNumber, selectedRoles, showWithoutRoles, userRoles]);

    const isEmployeeOrderBy = tableSort.orderBy === "displayName";

    const tableRowsOrderBy = useMemo(() => {
        if (isEmployeeOrderBy) {
            return [...filteredTableRows].sort((leftRow, rightRow) =>
                compareDisplayNameRows(leftRow, rightRow, tableSort.order)
            );
        }

        return lodashOrderBy(filteredTableRows, [tableSort.orderBy], [tableSort.order]);
    }, [
        filteredTableRows,
        isEmployeeOrderBy,
        compareDisplayNameRows,
        tableSort.order,
        tableSort.orderBy,
    ]);

    // ОПТИМИЗАЦИЯ: useCallback для стабильной ссылки на обработчик
    const handleRequestSort = useCallback(
        (event: MouseEvent<unknown>, property: keyof GitAnalyzerChartData) => {
            const isAsc = tableSort.orderBy === property && tableSort.order === "asc";
            setTableSort({
                order: isAsc ? "desc" : "asc",
                orderBy: property,
            });
        },
        [tableSort.orderBy, tableSort.order, setTableSort]
    );

    // ОПТИМИЗАЦИЯ: Стабильная renderRow функция для предотвращения лишних ререндеров
    const renderRow = useCallback(
        (item: any, index: number) => (
            <UsersTableRow
                filter={filter}
                key={`${item.user.email}-${item.rowNumber ?? "row"}`}
                {...item}
                userNames={userNames}
                userRoles={userRoles}
                linkedEmails={linkedEmails}
                days={timeLineDays}
            />
        ),
        [filter, userNames, userRoles, linkedEmails, timeLineDays]
    );

    return (
        <>
            <ScrollByGrabbing>
                <TableContainer className={styles.tableContainer}>
                    <Table
                        stickyHeader
                        className={styles.usersTable}
                        size="small"
                        aria-label="All stats"
                        padding="none"
                    >
                        <EnhancedTableHead
                            columns={tableColumns}
                            order={tableSort.order}
                            orderBy={tableSort.orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={timeLineDays.length}
                        />
                        {/* ОПТИМИЗАЦИЯ: Виртуализация для больших списков (>20 строк) */}
                        <UsersTableBody
                            rows={tableRowsOrderBy}
                            renderRow={renderRow}
                            estimateRowHeight={56}
                            overscan={3}
                            columnCount={tableColumns.length}
                        />
                    </Table>
                    <Box className={styles.footerRow}>
                        <Typography component="span">
                            Найдено записей: {filteredTableRows.length}
                        </Typography>
                        <LegendHeader />
                    </Box>
                </TableContainer>
            </ScrollByGrabbing>
            <Outlet />
        </>
    );
};

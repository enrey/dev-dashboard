import { FC, memo, useState } from "react";

import { Box, Button, TableCell, TableRow } from "@mui/material";

import { MAX_SHOWING_USER_PROJECTS } from "shared/constants";

import { GitAnalyzerChartData } from "shared/models";
import { useFastProjectFilter } from "shared/hooks/useFastProjectFilter";

import { TimeLine } from "./TimeLine";
import { UserRow } from "./UserRow";
import { UsersTableRowProps } from "./models";
import styles from "./UsersTable.module.scss";

// ОПТИМИЗАЦИЯ: Мемоизация компонента для предотвращения лишних ререндеров
const UsersTableRowComponent: FC<UsersTableRowProps> = (props) => {
    const { filter, userNames, userRoles, linkedEmails, days, ...userData } = props;
    const { rowNumber } = userData;
    const { user } = userData;
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
    const { handleFastProjectFilter, selectedProjectColor } = useFastProjectFilter();

    const roles = userRoles[user.email] || [];
    const roleLabel = roles.length > 0 ? roles.map((role) => role.name).join(" / ") : "";

    const {
        totalProjects,
        totalCommits,
        totalChangedFiles,
        totalChurn,
        allIssues,
        bugsIssues,
        mrOpened,
        mrMerged,
        totalComments,
        totalConfluenceChurn,
        totalUniqConfluence,
    } = userData;

    const shownProjects = isProjectsExpanded
        ? totalProjects
        : totalProjects.slice(0, MAX_SHOWING_USER_PROJECTS);
    const hiddenProjectsCount =
        totalProjects.length - Math.min(totalProjects.length, MAX_SHOWING_USER_PROJECTS);

    const handleProjectFilter = (projectName: string) => {
        handleFastProjectFilter(projectName);
    };

    const handleProjectExpandClick = () => {
        setIsProjectsExpanded((prev) => !prev);
    };

    return (
        <TableRow tabIndex={-1} className={styles.row}>
            <UserRow
                rowNumber={rowNumber}
                totalProjects={totalProjects}
                userNames={userNames}
                userRoles={userRoles}
                linkedEmails={linkedEmails}
                {...user}
            />
            <TableCell
                key="roles"
                align="left"
                className={styles.roleCell}
                sx={{ whiteSpace: "nowrap" }}
                style={{ padding: "3px 6px" }}
            >
                <span className={styles.roleText}>{roleLabel}</span>
            </TableCell>
            <TableCell
                key="projects"
                align="left"
                className={styles.projectCell}
                sx={{ whiteSpace: "nowrap" }}
                style={{ padding: "3px 6px" }}
            >
                <Box className={styles.projectItems}>
                    {shownProjects.map((project, index) => (
                        <span
                            key={`${project}-${index}`}
                            className={styles.projectItem}
                            title={project}
                            onClick={() => handleProjectFilter(project)}
                            style={{ color: selectedProjectColor(project) }}
                        >
                            {project}
                        </span>
                    ))}
                    {hiddenProjectsCount > 0 && (
                        <Button
                            variant="text"
                            disableElevation
                            disableRipple
                            disableFocusRipple
                            size="small"
                            onClick={handleProjectExpandClick}
                            className={styles.projectExpandButton}
                            sx={{
                                minWidth: 0,
                                fontSize: "11px",
                                fontWeight: 400,
                                opacity: 0.65,
                                textTransform: "none",
                                padding: "4px 4px",
                                marginLeft: "auto",
                                lineHeight: 1.2,
                                alignSelf: "flex-end",
                            }}
                        >
                            {isProjectsExpanded
                                ? "Свернуть"
                                : `+${hiddenProjectsCount} Развернуть`}
                        </Button>
                    )}
                </Box>
            </TableCell>
            <TimeLine
                userData={userData as GitAnalyzerChartData}
                filter={filter}
                days={days}
            />
            <TableCell
                key="commits"
                align="center"
                className={styles.metricCell}
                sx={{ width: 45, minWidth: 45, maxWidth: 45 }}
            >
                {totalCommits}
            </TableCell>
            <TableCell
                key="changedFiles"
                align="center"
                className={styles.metricCell}
                sx={{ width: 40, minWidth: 40, maxWidth: 40 }}
            >
                {totalChangedFiles}
            </TableCell>
            <TableCell
                key="churn"
                align="center"
                className={styles.metricCell}
                sx={{ width: 45, minWidth: 45, maxWidth: 45 }}
            >
                {totalChurn}
            </TableCell>
            <TableCell
                key="issues"
                align="center"
                className={styles.metricCell}
                sx={{ width: 40, minWidth: 40, maxWidth: 40 }}
            >
                {allIssues}
            </TableCell>
            <TableCell
                key="bugs"
                align="center"
                className={styles.metricCell}
                sx={{ width: 40, minWidth: 40, maxWidth: 40 }}
            >
                {bugsIssues}
            </TableCell>
            <TableCell
                key="opened"
                align="center"
                className={styles.metricCell}
                sx={{ width: 40, minWidth: 40, maxWidth: 40 }}
            >
                {mrOpened}
            </TableCell>
            <TableCell
                key="merged"
                align="center"
                className={styles.metricCell}
                sx={{ width: 40, minWidth: 40, maxWidth: 40 }}
            >
                {mrMerged}
            </TableCell>
            <TableCell
                key="comments"
                align="center"
                className={styles.metricCell}
                sx={{ width: 45, minWidth: 45, maxWidth: 45 }}
            >
                {totalComments}
            </TableCell>
            <TableCell
                key="confluence"
                align="center"
                className={styles.metricCell}
                sx={{ width: 40, minWidth: 40, maxWidth: 40 }}
            >
                {totalUniqConfluence}
            </TableCell>
            <TableCell
                key="confluenceChurn"
                align="center"
                className={styles.metricCell}
                sx={{ width: 45, minWidth: 45, maxWidth: 45 }}
            >
                {totalConfluenceChurn}
            </TableCell>
        </TableRow>
    );
};

// ОПТИМИЗАЦИЯ: Кастомный компаратор для точного контроля перерисовок
const arePropsEqual = (prevProps: UsersTableRowProps, nextProps: UsersTableRowProps) => {
    // Сравниваем примитивы
    if (
        prevProps.totalCommits !== nextProps.totalCommits ||
        prevProps.totalChangedFiles !== nextProps.totalChangedFiles ||
        prevProps.totalChurn !== nextProps.totalChurn ||
        prevProps.allIssues !== nextProps.allIssues ||
        prevProps.bugsIssues !== nextProps.bugsIssues ||
        prevProps.mrOpened !== nextProps.mrOpened ||
        prevProps.mrMerged !== nextProps.mrMerged ||
        prevProps.totalComments !== nextProps.totalComments ||
        prevProps.totalConfluenceChurn !== nextProps.totalConfluenceChurn ||
        prevProps.totalUniqConfluence !== nextProps.totalUniqConfluence
    ) {
        return false;
    }

    if (prevProps.totalProjects.length !== nextProps.totalProjects.length) {
        return false;
    }

    if (
        prevProps.totalProjects.some(
            (project, index) => nextProps.totalProjects[index] !== project
        )
    ) {
        return false;
    }

    // Сравниваем user
    if (
        prevProps.user.email !== nextProps.user.email ||
        prevProps.user.name !== nextProps.user.name ||
        prevProps.user.isMatched !== nextProps.user.isMatched
    ) {
        return false;
    }

    // Сравниваем filter даты
    if (
        prevProps.filter.dateStart.getTime() !== nextProps.filter.dateStart.getTime() ||
        prevProps.filter.dateEnd.getTime() !== nextProps.filter.dateEnd.getTime()
    ) {
        return false;
    }

    // Сравниваем days (по длине и первому/последнему элементу для оптимизации)
    if (
        prevProps.days.length !== nextProps.days.length ||
        prevProps.days[0]?.getTime() !== nextProps.days[0]?.getTime() ||
        prevProps.days[prevProps.days.length - 1]?.getTime() !==
            nextProps.days[nextProps.days.length - 1]?.getTime()
    ) {
        return false;
    }

    // Проверяем, что ссылки на объекты стабильны (они должны быть из useMemo)
    if (
        prevProps.userNames !== nextProps.userNames ||
        prevProps.userRoles !== nextProps.userRoles ||
        prevProps.linkedEmails !== nextProps.linkedEmails
    ) {
        return false;
    }

    return true;
};

// Экспортируем мемоизированный компонент с кастомным компаратором
export const UsersTableRow = memo(UsersTableRowComponent, arePropsEqual);

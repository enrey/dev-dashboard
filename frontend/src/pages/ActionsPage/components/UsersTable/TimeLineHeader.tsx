import { FC, MouseEvent } from "react";
import cn from "classnames";

import { Box, TableCell, TableSortLabel } from "@mui/material";
import { visuallyHidden } from "@mui/utils";

import { GitAnalyzerChartData } from "shared/models";

import { TimeLineHeaderProps } from "./models";
import styles from "./UsersTable.module.scss";

export const TimeLineHeader: FC<TimeLineHeaderProps> = (props) => {
    const {
        id,
        width,
        numeric,
        label,
        cellIndex,
        orderBy,
        order,
        onRequestSort,
        isSticky,
    } = props;
    const createSortHandler =
        (property: keyof GitAnalyzerChartData) => (event: MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    const USER_COLUMN_WIDTH = "var(--actions-user-cell-width)";
    const PROJECT_COLUMN_WIDTH = "var(--actions-project-cell-width)";
    const ROLE_COLUMN_WIDTH = "var(--actions-role-cell-width)";

    const stickyStyles = isSticky
        ? {
              position: "sticky" as const,
              left:
                  id === "displayName"
                      ? 0
                      : id === "userRole"
                        ? USER_COLUMN_WIDTH
                        : id === "userProjects"
                          ? `calc(${USER_COLUMN_WIDTH} + ${ROLE_COLUMN_WIDTH})`
                          : `calc(${USER_COLUMN_WIDTH} + ${PROJECT_COLUMN_WIDTH} + ${ROLE_COLUMN_WIDTH})`,
              zIndex: 1050,
          }
        : {};

    const hasTextIndent =
        id === "displayName" || id === "userRole" || id === "userProjects";

    const headerCellPadding = hasTextIndent
        ? {
              paddingLeft: "8px",
              paddingRight: "8px",
          }
        : {};

    // ОПТИМИЗАЦИЯ: Фиксируем размеры для всех колонок с указанной шириной
    const widthStyles = width
        ? {
              width,
              minWidth: width,
              maxWidth: width,
          }
        : {
              width: "auto",
              minWidth: "30px",
          };

    return (
        <TableCell
            key={id}
            className={cn(styles.tableHeaderCell, {
                [styles.stickyCell]: isSticky,
                [styles.stickyCellUser]: cellIndex === 0,
                [styles.stickyCellTimeline]:
                    isSticky &&
                    id !== "displayName" &&
                    id !== "userRole" &&
                    id !== "userProjects",
                [styles.timelineHeader]: !numeric,
            })}
            sx={{ ...widthStyles, ...stickyStyles, ...headerCellPadding }}
            align={numeric ? "center" : "left"}
            sortDirection={orderBy === id ? order : false}
        >
            {numeric || id === "displayName" ? (
                <TableSortLabel
                    hideSortIcon
                    color={"primary"}
                    active={orderBy === id}
                    direction={orderBy === id ? order : "asc"}
                    sx={{ pr: 0.5, fontSize: "0.8rem" }}
                    onClick={createSortHandler(id as keyof GitAnalyzerChartData)}
                >
                    {label}
                    {orderBy === id && (
                        <Box component="span" sx={visuallyHidden}>
                            {order === "desc" ? "sorted descending" : "sorted ascending"}
                        </Box>
                    )}
                </TableSortLabel>
            ) : (
                label
            )}
        </TableCell>
    );
};

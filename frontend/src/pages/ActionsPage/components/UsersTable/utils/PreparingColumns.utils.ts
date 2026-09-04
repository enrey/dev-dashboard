import { createElement, Fragment, FunctionComponent } from "react";

import { Box } from "@mui/material";
import { format, isWeekend } from "date-fns";
import { ru } from "date-fns/locale";

import { ColumnProps } from "../models";

export const preparingColumns = (timeLineDays: Date[]): ColumnProps[] => {
    const timeLine = timeLineDays.map((date, id) => {
        const day = format(date, "dd EEEEEE", { locale: ru }).split(" ");
        const isWeekendDay = isWeekend(date);
        const dayColor = isWeekendDay ? "error.main" : "text.primary";
        const props = {
            textAlign: "center",
            color: dayColor,
            sx: {
                height: "20px",
            },
        };
        /**
         * Создаётся элемент вида
         * <>
         * <Box textAlign="center" color={dayColor}>
         *  {day[2]}
         * </Box>
         * <Box textAlign="center" color={dayColor}>
         *  {day[1]}
         * </Box>
         * </>
         */
        const label = createElement(
            Fragment,
            null,
            createElement(Box as FunctionComponent<any>, props, day[0]),
            createElement(Box as FunctionComponent<any>, props, day[1])
        );
        return {
            id: date.toISOString(),
            label,
            numeric: false,
            width: isWeekendDay ? 25 : 100, // ОПТИМИЗАЦИЯ: Выходные дни - 25px, будние - 100px
        };
    });

    return [
        { id: "displayName", label: "Сотрудник", width: 162, numeric: false },
        { id: "userRole", label: "Роль", width: 98, numeric: false },
        { id: "userProjects", label: "Проект", width: 134, numeric: false },
        ...timeLine,
        { id: "totalCommits", label: "Commits", width: 45, numeric: true },
        { id: "totalChangedFiles", label: "Files", width: 40, numeric: true },
        { id: "totalChurn", label: "Churn", width: 45, numeric: true },
        { id: "allIssues", label: "Issue", width: 40, numeric: true },
        { id: "bugsIssues", label: "Bugs", width: 40, numeric: true },
        { id: "mrOpened", label: "Open", width: 40, numeric: true },
        { id: "mrMerged", label: "Merg", width: 40, numeric: true },
        { id: "totalComments", label: "Comm.", width: 45, numeric: true },
        { id: "totalUniqConfluence", label: "Total", width: 40, numeric: true },
        { id: "totalConfluenceChurn", label: "Churn", width: 45, numeric: true },
    ];
};

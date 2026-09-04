import { memo } from "react";

import { TableHead, TableRow, TableCell, TableSortLabel, Box } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { isWeekend } from "date-fns";

import { formatDateToRussian } from "shared/utils";

import { HeadCellsGitJira } from "./constants";
import { HeadCellsGitJiraValues, EnhancedGitJiraTableHeadProps } from "./models";

export const EnhancedGitJiraTableHead = memo((props: EnhancedGitJiraTableHeadProps) => {
    const { order, orderBy, periodBetweenStarAndEndDaysList, onRequestSort } = props;

    const createSortHandler =
        (property: keyof HeadCellsGitJiraValues) =>
        (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    const tableHeaderRows = periodBetweenStarAndEndDaysList.map((day, i) => {
        const formatedDate = formatDateToRussian(day);

        const isDayWeekend = isWeekend(day);

        return (
            <TableCell
                sx={{ padding: "10px", color: isDayWeekend ? "#d32f2f" : undefined }}
                align={i !== 0 ? "left" : "inherit"}
                key={`${day}-${i}`}
            >
                {formatedDate}
            </TableCell>
        );
    });

    return (
        <TableHead>
            <TableRow>
                {HeadCellsGitJira.map((headCell, i) => (
                    <TableCell
                        key={headCell.id}
                        padding={headCell.disablePadding ? "none" : "normal"}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                            paddingLeft: "10px",
                            width: headCell.width,
                            minWidth: headCell.minWidth,
                            maxWidth: headCell.width,
                        }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : "asc"}
                            onClick={createSortHandler(
                                headCell.id as keyof HeadCellsGitJiraValues
                            )}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === "desc"
                                        ? "sorted descending"
                                        : "sorted ascending"}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
                {tableHeaderRows}
            </TableRow>
        </TableHead>
    );
});

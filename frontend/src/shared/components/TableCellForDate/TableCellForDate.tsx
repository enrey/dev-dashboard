import { TableCell } from "@mui/material";

import { TableCellForDateProps } from ".";

import "./TableCellForDate.scss";

export const TableCellForDate = ({
    isDayWeekend,
    children,
    setOnHover,
}: TableCellForDateProps) => (
    <TableCell
        className="git-jira__table-cell"
        sx={{
            border: "1px solid rgba(224, 224, 224, 1)",
            padding: "2px",
            ml: "10px",
            verticalAlign: "bottom",
            backgroundColor: isDayWeekend ? "rgba(224, 224, 224, 0.2)" : undefined,
            position: "relative",
        }}
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
    >
        {children}
    </TableCell>
);

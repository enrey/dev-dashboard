import React, { FC } from "react";

import { TableCell, TableHead, TableRow } from "@mui/material";

import { TimeLineHeader } from "./TimeLineHeader";
import { EnhancedTableProps } from "./models";
import styles from "./UsersTable.module.scss";

export const EnhancedTableHead: FC<EnhancedTableProps> = ({
    order,
    orderBy,
    onRequestSort,
    columns,
    rowCount,
}) => {
    return (
        <TableHead className={styles.tableHead}>
            <TableRow>
                {columns.map((column, i) => (
                    <TimeLineHeader
                        key={column.id}
                        cellIndex={i}
                        onRequestSort={onRequestSort}
                        order={order}
                        orderBy={orderBy}
                        isSticky={i < 3}
                        {...column}
                    />
                ))}
            </TableRow>
        </TableHead>
    );
};

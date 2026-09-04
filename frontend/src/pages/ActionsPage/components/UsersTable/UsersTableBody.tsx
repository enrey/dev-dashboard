import React, { ReactNode, useRef } from "react";

import { TableBody, TableCell, TableRow } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface UsersTableBodyProps<T> {
    rows: T[];
    renderRow: (item: T, index: number) => ReactNode;
    estimateRowHeight?: number;
    overscan?: number;
    columnCount: number;
}

/**
 * UsersTableBody компонент для рендеринга строк таблицы пользователей
 * Рендерит все строки обычным способом без виртуализации
 */
export const UsersTableBody = <T,>({
    rows,
    renderRow,
    estimateRowHeight = 50,
    overscan = 5,
    columnCount,
}: UsersTableBodyProps<T>): JSX.Element => {
    const tableBodyRef = useRef<HTMLTableSectionElement | null>(null);

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () =>
            tableBodyRef.current?.closest(".MuiTableContainer-root") as HTMLElement | null,
        estimateSize: () => estimateRowHeight,
        overscan,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
    const paddingBottom =
        virtualRows.length > 0
            ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
            : 0;

    return (
        <TableBody ref={tableBodyRef}>
            {paddingTop > 0 && (
                <TableRow aria-hidden="true">
                    <TableCell colSpan={columnCount} sx={{ height: paddingTop, p: 0 }} />
                </TableRow>
            )}
            {virtualRows.map((virtualRow) =>
                renderRow(rows[virtualRow.index], virtualRow.index)
            )}
            {paddingBottom > 0 && (
                <TableRow aria-hidden="true">
                    <TableCell colSpan={columnCount} sx={{ height: paddingBottom, p: 0 }} />
                </TableRow>
            )}
        </TableBody>
    );
};


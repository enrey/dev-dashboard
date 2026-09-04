import React, { ReactNode } from 'react';

import { TableBody } from '@mui/material';

export interface TableBodyProps<T> {
    rows: T[];
    renderRow: (item: T, index: number) => ReactNode;
    estimateRowHeight?: number;
    overscan?: number;
}

/**
 * TableBody компонент для рендеринга строк таблицы
 * Рендерит все строки обычным способом без виртуализации
 */
export const CustomTableBody = <T,>({
    rows,
    renderRow,
    estimateRowHeight = 50,
    overscan = 5,
}: TableBodyProps<T>): JSX.Element => {
    return (
        <TableBody>
            {rows.map((row, index) => renderRow(row, index))}
        </TableBody>
    );
};


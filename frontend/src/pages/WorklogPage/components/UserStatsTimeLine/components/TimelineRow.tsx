import { FC, memo } from "react";

import { TableRow, TableCell, Link } from "@mui/material";

interface TimelineRowProps {
    stringDate: string;
    dateFormatted: string;
    task: {
        time: string;
        total: number;
        type: string;
        text: string;
        url?: string;
    };
    taskIndex: number;
    blinkingDateId: string | null | undefined;
    renderIcon: (type: string, total: number) => JSX.Element;
}

export const TimelineRow: FC<TimelineRowProps> = memo(({
    stringDate,
    dateFormatted,
    task,
    taskIndex,
    blinkingDateId,
    renderIcon,
}) => {
    const elementId = taskIndex === 0 ? `timeline-${stringDate}` : undefined;

    return (
        <TableRow
            id={elementId}
            sx={{
                ...(blinkingDateId === `timeline-${stringDate}` && {
                    animation: 'blink 0.5s ease-in-out 6',
                    border: '2px solid #1976d2',
                    borderRadius: '4px',
                }),
            }}
        >
            <TableCell sx={{ width: '140px' }}>
                {taskIndex === 0 ? dateFormatted : ''}
            </TableCell>
            <TableCell sx={{ width: '60px' }}>
                {task.time}
            </TableCell>
            <TableCell sx={{ width: '40px' }}>
                {renderIcon(task.type, task.total)}
            </TableCell>
            <TableCell sx={{ 
                width: '300px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
            }}>
                {task.type}
            </TableCell>
            <TableCell>
                {task.url ? (
                    <Link
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none"
                    >
                        {task.text}
                    </Link>
                ) : (
                    task.text
                )}
            </TableCell>
        </TableRow>
    );
}, (prevProps, nextProps) => {
    // Оптимизированное сравнение для memo - ре-рендерим только если изменился blinkingDateId для этой даты
    return (
        prevProps.stringDate === nextProps.stringDate &&
        prevProps.taskIndex === nextProps.taskIndex &&
        prevProps.blinkingDateId === nextProps.blinkingDateId &&
        prevProps.task === nextProps.task
    );
});


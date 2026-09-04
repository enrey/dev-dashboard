import { FC } from "react";

import { Box, TableCell, TableRow, Typography } from "@mui/material";
import { format, isWeekend } from "date-fns";
import { ru } from "date-fns/locale";

import { PresenceTypes } from "shared/enums";
import { DailyPresence } from "shared/models";
import { getIsPresence } from "shared/utils";

import { GetItemsForDateProps, TimeLineProps } from "./models";
import { UserStatsTimeLineService } from "./services";

export const TimeLine: FC<TimeLineProps> = ({ date, userData, blinkingDateId }) => {
    const getItemsForDatePayload: GetItemsForDateProps = {
        date,
        gitStatistics: userData.gitStatistics,
        tasks: userData.tasks,
        gitlabStatistics: userData.gitlabStatistics,
        gitlabComments: userData.gitlabCommentsStatistics.items,
        confluence: userData.confluence,
    };
    const tasks = UserStatsTimeLineService.getItemsForDate(getItemsForDatePayload);
    const stringDate = format(date, "yyyy-MM-dd");
    const isPresence = getIsPresence(userData, stringDate);
    const presence =
        (userData.presence as Array<DailyPresence>)?.find(
            ({ date }) => date === stringDate
        )?.type || PresenceTypes.standard;

    const isBlinking = blinkingDateId === `timeline-${stringDate}`;
    const dateFormatted = format(date, "EEEEEE, d MMMM", { locale: ru });

    const renderIcon = (type: string, total: number) => {
        const isConfluenceEvent = type === "Изменение страницы" || type === "Изменение вложения";
        const isJiraEvent = type === "Изменение описания задачи" || type.includes("→");
        const isGitlabMREvent = type === "MR opened" || type === "MR merged";
        const isGitlabCommentEvent = type === "Comment";

        if (isConfluenceEvent) {
            return (
                <Box sx={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(8deg)', fontSize: '18px', color: '#00d9db', fontWeight: 'bold' }}>
                    ×
                </Box>
            );
        } else if (isJiraEvent) {
            return (
                <Box sx={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-45deg)' }}>
                    <Box sx={{ width: '8px', height: '8px', backgroundColor: '#00d9db', borderRadius: '1px' }} />
                </Box>
            );
        } else if (isGitlabMREvent) {
            return (
                <Box sx={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ width: '8px', height: '8px', border: '1px solid #00d9db', backgroundColor: type === "MR merged" ? '#00d9db' : 'transparent', borderRadius: '1px' }} />
                </Box>
            );
        } else if (isGitlabCommentEvent) {
            return (
                <Box sx={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '8px solid #00d9db' }} />
                </Box>
            );
        } else {
            return (
                <svg width="20" height="20">
                    <circle cx="10" cy="10" r={total} fill="#ffc107" />
                </svg>
            );
        }
    };

    return (
        <Box
            id={`timeline-${stringDate}`}
            sx={{
                position: 'relative',
                ...(isBlinking && {
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: '3px solid #1976d2',
                        borderRadius: '8px',
                        boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.3)',
                        animation: 'blink 1s ease-in-out 3',
                        pointerEvents: 'none',
                        zIndex: 1,
                        '@keyframes blink': {
                            '0%': {
                                borderColor: '#1976d2',
                                boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.3)',
                                opacity: 1
                            },
                            '50%': {
                                borderColor: 'transparent',
                                boxShadow: '0 0 0 4px transparent',
                                opacity: 0.5
                            },
                            '100%': {
                                borderColor: '#1976d2',
                                boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.3)',
                                opacity: 1
                            },
                        },
                    }
                }),
            }}
        >
            {tasks?.map(({ time, total, type, text, url }, index) => (
                <TableRow
                    key={`${time}_${index}_${type}_${url}`}
                    sx={{
                        borderBottom: 1,
                        borderBottomColor: "divider",
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    <TableCell sx={{ verticalAlign: "top", color: isPresence ? (isWeekend(date) ? "error.main" : "text.primary") : "warning.dark", width: '140px' }}>
                        {index === 0 ? (
                            <>
                                {dateFormatted}
                                {presence !== PresenceTypes.standard && (
                                    <Typography sx={{ fontSize: "12px" }}>{presence}</Typography>
                                )}
                            </>
                        ) : null}
                    </TableCell>
                    <TableCell sx={{ width: '60px' }}>{time}</TableCell>
                    <TableCell sx={{ width: '40px' }}>{renderIcon(type, total)}</TableCell>
                    <TableCell sx={{ width: '120px' }}>{type}</TableCell>
                    <TableCell>
                        {url ? (
                            <a href={url} style={{ color: 'inherit', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                                {text}
                            </a>
                        ) : (
                            <span>{text}</span>
                        )}
                    </TableCell>
                </TableRow>
            ))}
        </Box>
    );
};

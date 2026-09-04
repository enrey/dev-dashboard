import { FC, useContext, useMemo, memo } from "react";

import { Paper, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Box } from "@mui/material";
import { eachDayOfInterval } from "date-fns";

import { TimelineRow } from "./components/TimelineRow";
import { UserStatsTimeLineProps } from "./models";
import { OptimizedTimelineService } from "./services/optimizedTimelineService";
import { FilterContext } from "../../../../contexts/filter";

// Вынесли renderIcon наружу, чтобы не создавать заново при каждом рендере
const renderIcon = (type: string, total: number) => {
    const isConfluenceEvent = type === "Изменение страницы" || type === "Изменение вложения";
    const isJiraEvent = type === "Изменение описания задачи" || type.includes("→");
    const isGitlabMROpenedEvent = type === "MR opened";
    const isGitlabMRMergedEvent = type === "MR merged";
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
    } else if (isGitlabMROpenedEvent) {
        return (
            <Box sx={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '8px', height: '8px', border: '1px solid #00d9db', backgroundColor: 'transparent', borderRadius: '1px' }} />
            </Box>
        );
    } else if (isGitlabMRMergedEvent) {
        return (
            <Box sx={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '8px', height: '8px', backgroundColor: '#00d9db', borderRadius: '1px' }} />
            </Box>
        );
    } else if (isGitlabCommentEvent) {
        return (
            <Box sx={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '8px solid #00d9db' }} />
            </Box>
        );
    } else {
        // Круг для коммитов
        return (
            <svg width="20" height="20">
                <circle cx="10" cy="10" r={total} fill="#00d9db" />
            </svg>
        );
    }
};

export const UserStatsTimeLine: FC<UserStatsTimeLineProps> = memo(({ userData, blinkingDateId }) => {
    const { filter } = useContext(FilterContext);

    const dates = useMemo(
        () => eachDayOfInterval({
            start: filter.dateStart,
            end: filter.dateEnd,
        })?.reverse(),
        [filter.dateStart, filter.dateEnd]
    );

    // КЛЮЧЕВАЯ ОПТИМИЗАЦИЯ: Группируем все данные по датам ОДИН раз, а не для каждой даты отдельно
    const groupedData = useMemo(() => {
        return OptimizedTimelineService.groupDataByDates({
            gitStatistics: userData.gitStatistics,
            tasks: userData.tasks,
            gitlabStatistics: userData.gitlabStatistics,
            gitlabComments: userData.gitlabCommentsStatistics.items,
            confluence: userData.confluence,
        });
    }, [userData.gitStatistics, userData.tasks, userData.gitlabStatistics, userData.gitlabCommentsStatistics.items, userData.confluence]);

    // Теперь для каждой даты просто берем данные из уже сгруппированного объекта - O(1) вместо O(n)
    const preparedData = useMemo(() => {
        return dates?.map(date => {
            const stringDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dateFormatted = new Intl.DateTimeFormat('ru', { weekday: 'short', day: 'numeric', month: 'long' }).format(date);
            const tasks = OptimizedTimelineService.getItemsForDate(groupedData, date);

            return { stringDate, dateFormatted, tasks };
        }) || [];
    }, [dates, groupedData]);

    return (
        <TableContainer component={Paper} elevation={3}>
            <Table aria-label="user stats" size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: '140px' }}>Дата</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>Время</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '40px' }}>Иконка</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '300px' }}>Тип</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Описание</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {preparedData.flatMap(({ stringDate, dateFormatted, tasks }) =>
                        tasks?.map((task, taskIndex) => (
                            <TimelineRow
                                key={`${stringDate}_${taskIndex}`}
                                stringDate={stringDate}
                                dateFormatted={dateFormatted}
                                task={task}
                                taskIndex={taskIndex}
                                blinkingDateId={blinkingDateId}
                                renderIcon={renderIcon}
                            />
                        )) || []
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

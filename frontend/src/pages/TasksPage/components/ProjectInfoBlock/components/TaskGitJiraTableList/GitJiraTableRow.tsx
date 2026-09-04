import { memo } from "react";

import { Box, Link, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { GitTaskAndJira, TaskWithMrAndJiraDataModel } from "pages/TasksPage/models";

import { TypeTaskBar } from "shared/components";

import { jiraTaskBaseUrl } from "./constants";
import { GitJiraTableRowProps } from "./models";
import { contributorsLayout } from "./utils/contributorsLayout.utils";
import { DateCellInfography } from "./DateCellInfography";
import { TaskTableEntityEnum } from "./models";

export const GitJiraTableRow = memo(
    ({ periodBetweenStarAndEndDaysList, task }: GitJiraTableRowProps) => {
        const contributorPartLayout = contributorsLayout(task.contributors);

        const taskDescription: string = Object.hasOwn(task, "issueName")
            ? (task as GitTaskAndJira).issueName
            : "";
        const taskStatus: string = (task as GitTaskAndJira)?.statusTo || "";
        const hiddenTextStyle = {
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            display: "inline-block",
        };
        return (
            <TableRow>
                <TableCell sx={{ padding: "10px", fontSize: "0.775rem" }}>
                    <Box component="span">
                        <TypeTaskBar type={(task as GitTaskAndJira).issueType} />
                    </Box>
                </TableCell>
                {/* Номер задачи*/}
                <TableCell sx={{ padding: "10px", fontSize: "0.775rem" }}>
                    <Box>
                        <Link
                            sx={{ textDecoration: "none" }}
                            target="_blank"
                            rel="noopener"
                            href={
                                Object.hasOwn(task, "issueName")
                                    ? (task as GitTaskAndJira).issueUrl
                                    : `${jiraTaskBaseUrl}${task.task}`
                            }
                        >
                            {task.task}
                        </Link>
                    </Box>
                </TableCell>
                {/*Статус таски*/}
                <TableCell sx={{ padding: "10px" }}>
                    {Object.hasOwn(task, "statusTo") && (
                        <Tooltip title={taskStatus.length >= 15 && taskStatus}>
                            <Box
                                sx={{
                                    background: "rgba(101, 125, 209, 0.15)",
                                    color: "#2853E0",
                                    padding: "3px",
                                    maxWidth: "110px",
                                    ...hiddenTextStyle,
                                }}
                                component="span"
                            >
                                {taskStatus}
                            </Box>
                        </Tooltip>
                    )}
                </TableCell>
                {/*Наименование таски*/}
                <TableCell sx={{ padding: "10px" }}>
                    <Tooltip title={taskDescription.length >= 32 && taskDescription}>
                        <Box
                            sx={{
                                maxWidth: "240px",
                                ...hiddenTextStyle,
                            }}
                            component="span"
                        >
                            {taskDescription}
                        </Box>
                    </Tooltip>
                </TableCell>

                {/* Колонка с проектом. Если есть ссылка внутри таски,
                    то отрисовываем линк. Если нет - обычный спан с текстом  */}
                <TableCell sx={{ padding: "10px", fontSize: "0.7rem" }}>
                    {Object.hasOwn(task, "webRepository") ? (
                        <Link
                            sx={{ textDecoration: "none" }}
                            target="_blank"
                            rel="noopener"
                            href={(task as TaskWithMrAndJiraDataModel).webRepository}
                        >
                            {task.project}
                        </Link>
                    ) : (
                        <Typography sx={{ fontSize: "0.7rem" }}>
                            {task.project}
                        </Typography>
                    )}
                </TableCell>

                {/* Участники */}
                <TableCell sx={{ padding: "10px" }}>{contributorPartLayout}</TableCell>
                <DateCellInfography
                    periodBetweenStarAndEndDaysList={periodBetweenStarAndEndDaysList}
                    task={task}
                    entity={TaskTableEntityEnum.TASK}
                />
            </TableRow>
        );
    }
);

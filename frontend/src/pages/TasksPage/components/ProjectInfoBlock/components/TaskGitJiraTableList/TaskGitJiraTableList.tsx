import { memo, useContext, useState } from "react";

import { TableContainer, Typography } from "@mui/material";
import Table from "@mui/material/Table";
import { eachDayOfInterval } from "date-fns";
import { TaskWithExtendedMrs } from "pages/TasksPage/models";
import { Outlet } from "react-router-dom";

import { EmptyBlock } from "shared/components";
import { OrderType, UnknownCommitModel } from "shared/models";

import { EnhancedGitJiraTableHead } from "./EnhancedGitJiraTableHead";
import { DynamicTableBody } from "./DynamicTableBody";
import { HeadCellsGitJiraValues, TaskGitJiraTableListProps } from "./models";
import { prepareTableBody } from "./utils/prepareTableBody.utils";
import { FilterContext } from "../../../../../../contexts/filter";

export const TaskGitJiraTableList = memo(
    ({
        displayUnknownTasksConditions,
        tasksList,
        totalItem,
        unknownTasks,
    }: TaskGitJiraTableListProps) => {
        const [order, setOrder] = useState<OrderType>("asc");
        const [orderBy, setOrderBy] = useState<keyof HeadCellsGitJiraValues | string>(
            "task"
        );
        const { filter } = useContext(FilterContext);
        const { dateEnd: end, dateStart: start } = filter;

        if (!tasksList?.length && !displayUnknownTasksConditions) {
            return <EmptyBlock format="fullsize" />;
        }

        const periodBetweenStarAndEndDaysList = eachDayOfInterval({
            start,
            end,
        });

        const handleRequestSort = (
            event: React.MouseEvent<unknown>,
            property: keyof HeadCellsGitJiraValues
        ) => {
            const isAsc = orderBy === property && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(property);
        };
        const tableBody = prepareTableBody(
            tasksList as TaskWithExtendedMrs[],
            unknownTasks as UnknownCommitModel[],
            order,
            orderBy,
            periodBetweenStarAndEndDaysList
        );

        return (
            <TableContainer sx={{ height: "calc(100vh - 64px - 150px)", width: "100%" }}>
                <Table stickyHeader={true}>
                    <EnhancedGitJiraTableHead
                        periodBetweenStarAndEndDaysList={periodBetweenStarAndEndDaysList}
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                    />
                    <DynamicTableBody tableBody={tableBody} />
                </Table>
                <Typography
                    component="div"
                    sx={{ padding: "10px", backgroundColor: "#f5f5f5" }}
                >
                    Найдено записей: {totalItem}
                </Typography>
                <Outlet />
            </TableContainer>
        );
    }
);

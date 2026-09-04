import { FC } from "react";

import { Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import "./TaskDateCell.scss";
import { CloseMrCell } from "./CloseMrCell";
import { CommentsCell } from "./CommentsCell";
import { CommitsCell } from "./CommitsCell";
import { OpenMrCell } from "./OpenMrCell";
import { TaskDateCellProps } from "./models";

export const TaskDateCell: FC<TaskDateCellProps> = (props) => {
    const { date, task, crossedDayAndCommitDate, taskCommitsArrayWithItemSize, onHover } =
        props;
    const location = useLocation();
    const navigate = useNavigate();

    const handleClick = () => {
        if (task.firstContributor?.email) {
            navigate(
                {
                    pathname: `/worklog/${task.firstContributor.email}`,
                    search: `?selectedDate=${date.toISOString().split("T")[0]}&from=tasks`,
                },
                { state: { backgroundLocation: location } }
            );
        }
    };

    return (
        <Box
            component="div"
            onClick={handleClick}
            sx={{
                boxSizing: "border-box",
                margin: "0px",
                flexDirection: "row",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "3px",
                color: "rgb(33, 33, 33)",
                padding: " 0px 4px",
                cursor: "pointer",
            }}
        >
            {/* Столбец открытых МР */}
            <OpenMrCell date={date} task={task} onHover={onHover} />
            {/* Столбец коммитов */}
            <CommitsCell
                date={date}
                crossedDayAndCommitDate={crossedDayAndCommitDate}
                taskCommitsArrayWithItemSize={taskCommitsArrayWithItemSize}
                onHover={onHover}
            />
            {/* Столбец комментариев */}
            <CommentsCell date={date} task={task} onHover={onHover} />
            {/* Столбец закрытых МР */}
            <CloseMrCell date={date} task={task} onHover={onHover} />
        </Box>
    );
};

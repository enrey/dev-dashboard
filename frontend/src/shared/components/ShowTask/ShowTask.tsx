import React, { FC, memo, useMemo } from "react";

import { Box, SxProps } from "@mui/material";

import styles from "./ShowTask.module.scss";
import { ShowTaskProps } from "./ShowTaskProps";

// ОПТИМИЗАЦИЯ: Мемоизация компонента для предотвращения лишних ререндеров
const ShowTaskComponent: FC<ShowTaskProps> = ({ children, onHover, label, onRight }) => {
    // ОПТИМИЗАЦИЯ: Мемоизируем position, чтобы не создавать новый объект при каждом рендере
    const position: SxProps = useMemo(
        () =>
            onRight
                ? { right: "110%", textAlign: "right" }
                : { left: "110%", textAlign: "left" },
        [onRight]
    );

    const taskCommit = useMemo(
        () => (
            <>
                {onHover && (
                    <Box component={"span"} className={styles.commit_task} sx={position}>
                        {label}
                    </Box>
                )}
            </>
        ),
        [onHover, label, position]
    );

    if (!children) {
        return taskCommit;
    }

    return (
        <Box sx={{ position: "relative" }}>
            {children}
            {taskCommit}
        </Box>
    );
};

// Экспортируем мемоизированный компонент
export const ShowTask = memo(ShowTaskComponent);
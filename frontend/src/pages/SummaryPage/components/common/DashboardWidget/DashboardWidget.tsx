import React, { PropsWithChildren } from "react";

import { Paper, useTheme } from "@mui/material";

import styles from "./DashboardWidget.module.scss";

export interface DashboardStat {
    value: React.ReactNode;
    label: string;
}

interface DashboardWidgetProps extends PropsWithChildren {
    title: string;
    stats: DashboardStat[];
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
    title,
    stats,
    children,
}) => {
    const theme = useTheme();

    return (
        <Paper
            className={styles.widget}
            elevation={0}
            sx={{
                bgcolor:
                    theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
            }}
        >
            <div className={styles.title}>{title}</div>
            <div className={styles.stats}>
                {stats.map((item) => (
                    <div
                        key={`${item.label}-${String(item.value)}`}
                        className={styles.statItem}
                    >
                        <div className={styles.statValue}>{item.value}</div>
                        <div className={styles.statLabel}>{item.label}</div>
                    </div>
                ))}
            </div>
            {children}
        </Paper>
    );
};

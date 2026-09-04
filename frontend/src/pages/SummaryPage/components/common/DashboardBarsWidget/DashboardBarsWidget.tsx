import React from "react";

import { Tooltip } from "@mui/material";

import { DashboardWidget, DashboardStat } from "../DashboardWidget/DashboardWidget";
import styles from "../DashboardWidget/DashboardWidget.module.scss";

export interface DashboardBarsPoint {
    id: string | number;
    value: number;
    percentage: number;
    tooltip: React.ReactNode;
}

export interface DashboardBarsWidgetProps {
    title: string;
    stats: DashboardStat[];
    points: DashboardBarsPoint[];
    emptyState: React.ReactNode;
    barColor: string;
    minHeightPercent?: number;
}

export const DashboardBarsWidget: React.FC<DashboardBarsWidgetProps> = ({
    title,
    stats,
    points,
    emptyState,
    barColor,
    minHeightPercent = 3,
}) => {
    return (
        <DashboardWidget title={title} stats={stats}>
            <div className={styles.bars}>
                {points.length > 0 ? (
                    points.map((point) => (
                        <Tooltip
                            key={point.id}
                            title={point.tooltip}
                            arrow
                            placement="top"
                        >
                            <div
                                className={styles.barsItem}
                                style={{
                                    height: `${Math.max(point.percentage, minHeightPercent)}%`,
                                    opacity: point.value === 0 ? 0.15 : 0.7,
                                    background: barColor,
                                }}
                            />
                        </Tooltip>
                    ))
                ) : (
                    <div className={styles.emptyState}>{emptyState}</div>
                )}
            </div>
        </DashboardWidget>
    );
};

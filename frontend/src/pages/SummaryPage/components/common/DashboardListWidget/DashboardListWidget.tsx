import React, { useMemo, useState } from "react";

import { Tooltip } from "@mui/material";

import { DashboardWidget, DashboardStat } from "../DashboardWidget/DashboardWidget";
import styles from "../DashboardWidget/DashboardWidget.module.scss";

export interface DashboardListWidgetItem {
    id: string | number;
    label: React.ReactNode;
    value: React.ReactNode;
    percentage: number;
    tooltip?: React.ReactNode;
    href?: string;
    onClick?: () => void;
    labelClassName?: string;
}

export interface DashboardListWidgetProps {
    title: string;
    stats: DashboardStat[];
    items: DashboardListWidgetItem[];
    barColor: string;
    emptyState: React.ReactNode;
    maxVisible?: number;
}

export const DashboardListWidget: React.FC<DashboardListWidgetProps> = ({
    title,
    stats,
    items,
    barColor,
    emptyState,
    maxVisible = 5,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayItems = isExpanded ? items : items.slice(0, maxVisible);
    const hasMoreItems = items.length > maxVisible;
    const hiddenCount = useMemo(
        () => Math.max(items.length - maxVisible, 0),
        [items.length, maxVisible]
    );

    return (
        <DashboardWidget title={title} stats={stats}>
            <div className={styles.list}>
                {displayItems.length > 0 ? (
                    <>
                        {displayItems.map((item) => {
                            const row = (
                                <div
                                    className={`${styles.listRow} ${item.onClick ? styles.clickableRow : ""}`}
                                    role={
                                        item.onClick || item.href ? "button" : undefined
                                    }
                                    tabIndex={item.onClick || item.href ? 0 : -1}
                                    onClick={item.onClick}
                                    onKeyDown={(event) => {
                                        if (
                                            (item.onClick || item.href) &&
                                            (event.key === "Enter" || event.key === " ")
                                        ) {
                                            event.preventDefault();
                                            if (item.onClick) {
                                                item.onClick();
                                            } else if (item.href) {
                                                window.open(String(item.href), "_blank");
                                            }
                                        }
                                    }}
                                >
                                    <div
                                        className={
                                            styles.label +
                                            (item.labelClassName
                                                ? ` ${item.labelClassName}`
                                                : "")
                                        }
                                    >
                                        {item.href ? (
                                            <a
                                                className={styles.link}
                                                href={String(item.href)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                {item.label}
                                            </a>
                                        ) : (
                                            item.label
                                        )}
                                    </div>
                                    <div
                                        className={styles.bar}
                                        style={{
                                            width: `${Math.max(item.percentage, 5)}%`,
                                            background: barColor,
                                        }}
                                    />
                                    <div className={styles.rowValue}>{item.value}</div>
                                </div>
                            );

                            if (item.tooltip) {
                                return (
                                    <Tooltip
                                        key={item.id}
                                        title={item.tooltip}
                                        arrow
                                        placement="right"
                                    >
                                        {row}
                                    </Tooltip>
                                );
                            }

                            return <div key={item.id}>{row}</div>;
                        })}
                        {hasMoreItems && (
                            <div
                                className={styles.expandButton}
                                role="button"
                                tabIndex={0}
                                onClick={() => setIsExpanded((prev) => !prev)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        setIsExpanded((prev) => !prev);
                                    }
                                }}
                            >
                                {isExpanded
                                    ? "Свернуть ↑"
                                    : `Показать еще ${hiddenCount} ↓`}
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.emptyState}>{emptyState}</div>
                )}
            </div>
        </DashboardWidget>
    );
};

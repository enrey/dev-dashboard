import { FC, memo, ReactNode } from "react";

import { Box, Tooltip } from "@mui/material";
import cn from "classnames";
import { format } from "date-fns";

import { ColorsBySourceType, SourceTypes } from "shared/enums";

import { TimeLineItemProps } from "./models";
import styles from "./TimeLineItem.module.scss";

const getLabelParts = (title: string, createdAt?: string) => {
    if (!createdAt) {
        return { label: title, labelNode: title };
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return { label: title, labelNode: title };
    }

    const time = format(date, "HH:mm");
    const label = `${time} ${title}`;
    const labelNode: ReactNode = (
        <span className={styles.tooltipLabel}>
            <span className={styles.tooltipTime}>{time}</span> {title}
        </span>
    );

    return { label, labelNode };
};

// ОПТИМИЗАЦИЯ: Мемоизация компонента для предотвращения лишних ререндеров
const TimeLineItemComponent: FC<TimeLineItemProps> = ({
    title,
    variant,
    url,
    createdAt,
    sourceType,
}) => {
    const { label, labelNode } = getLabelParts(title, createdAt);

    if (!url) {
        return (
            <Tooltip title={labelNode} arrow>
                <Box
                    aria-label={label}
                    sx={{
                        backgroundColor: ColorsBySourceType[sourceType],
                        borderColor: ColorsBySourceType[sourceType],
                        borderWidth: "1px",
                        zIndex: 1100,
                        position: "relative",
                    }}
                    className={cn(
                        styles.timeLineItemPiece,
                        styles[sourceType],
                        variant && styles[variant]
                    )}
                />
            </Tooltip>
        );
    }
    return (
        <Tooltip title={labelNode} arrow>
            <a
                href={url}
                onClick={(e) => e.stopPropagation()}
                aria-label={label}
                style={{
                    backgroundColor: ColorsBySourceType[sourceType],
                    borderColor: ColorsBySourceType[sourceType],
                }}
                className={cn(
                    styles.timeLineItemAnchor,
                    styles.timeLineItemPiece,
                    styles[sourceType],
                    variant && styles[variant]
                )}
                target="_blank"
                rel="noopener noreferrer"
            />
        </Tooltip>
    );
};

// Экспортируем мемоизированный компонент
export const TimeLineItem = memo(TimeLineItemComponent);

import { FC, memo } from "react";

import { Typography } from "@mui/material";

import { TimeLineItem } from "./TimeLineItem";
import { TimeLineItemsProps } from "./models";
import styles from "./TimeLineItems.module.css";
import tableStyles from "./UsersTable.module.scss";

// ОПТИМИЗАЦИЯ: Мемоизация компонента для предотвращения лишних ререндеров
const TimeLineItemsComponent: FC<TimeLineItemsProps> = ({
    items,
    sourceType,
}) => {
    if (!items.length) {
        return (
            <span
                style={{
                    backgroundColor: "transparent",
                }}
                className={styles.timeLineItemsPieceEmpty}
            ></span>
        );
    }

    const itemsLength = items.length > 10 && (
        <Typography
            className={`${styles.timeLineItemsCount} ${tableStyles.timelineLegendText}`}
            variant="caption"
        >
            {items.length}
        </Typography>
    );
    const displayItems = items.slice(0, 10);

    return (
        <>
            {itemsLength}
            {displayItems.map((item, index) => (
                <TimeLineItem
                    sourceType={sourceType}
                    key={index}
                    {...item}
                />
            ))}
        </>
    );
};

// ОПТИМИЗАЦИЯ: Кастомный компаратор для точного контроля перерисовок
const arePropsEqual = (prevProps: TimeLineItemsProps, nextProps: TimeLineItemsProps) => {
    return (
        prevProps.items === nextProps.items &&
        prevProps.sourceType === nextProps.sourceType
    );
};

// Экспортируем мемоизированный компонент с кастомным компаратором
export const TimeLineItems = memo(TimeLineItemsComponent, arePropsEqual);

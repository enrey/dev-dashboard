import { FC, memo, useCallback, useMemo } from "react";

import { TableCell } from "@mui/material";
import { format, isWeekend } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";

import { PresenceTypes, SourceTypes } from "shared/enums";

import { TimeLineCellProps, TimeLineItem as TimeLineItemModel } from "./models";
import { TimeLineItem } from "./TimeLineItem";
import styles from "./UsersTable.module.scss";

type CloudItem = TimeLineItemModel & {
    sourceType: SourceTypes;
    x: number;
    y: number;
    width: number;
    height: number;
    seedKey: string;
    opacity: number;
};

type CloudBaseItem = Omit<CloudItem, "x" | "y" | "width" | "height" | "opacity">;

const createCloudSeed = (value: string) => {
    let hash = 2166136261;

    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    return hash >>> 0;
};

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));

const COMPACT_TIME_RANGE_MS = 4 * 60 * 60 * 1000;

const estimateMarkerSize = (item: Pick<CloudBaseItem, "variant">): number => {
    const variant = item.variant;

    if (variant === "small") {
        return 4;
    }

    if (variant === "large") {
        return 12;
    }

    if (variant === "huge") {
        return 16;
    }

    return 8;
};

const getCreatedAtDisplayTime = (createdAt?: string) => {
    if (!createdAt) {
        return Number.POSITIVE_INFINITY;
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return Number.POSITIVE_INFINITY;
    }

    return (
        date.getHours() * 60 * 60 * 1000 +
        date.getMinutes() * 60 * 1000 +
        date.getSeconds() * 1000 +
        date.getMilliseconds()
    );
};

const compareTimelineItemsByDate = (
    left: TimeLineItemModel & { sourceType: SourceTypes },
    right: TimeLineItemModel & { sourceType: SourceTypes }
) => {
    const dateCompare = getCreatedAtDisplayTime(left.createdAt) - getCreatedAtDisplayTime(right.createdAt);

    if (dateCompare !== 0) {
        return dateCompare;
    }

    return `${left.sourceType}-${left.title}-${left.url ?? ""}`.localeCompare(
        `${right.sourceType}-${right.title}-${right.url ?? ""}`,
        "ru",
        { sensitivity: "base", numeric: true }
    );
};

// ОПТИМИЗАЦИЯ: Мемоизация компонента для предотвращения лишних ререндеров
const TimeLineCellComponent: FC<TimeLineCellProps> = ({
    bgcolor,
    presence,
    isActivity,
    charts,
    userData,
    date,
}) => {
    const paddingTop = presence !== PresenceTypes.standard ? 2.5 : 0;
    const location = useLocation();
    const navigate = useNavigate();

    // ОПТИМИЗАЦИЯ: Вычисляем ширину на основе даты (выходные - 25px, будние - 100px)
    const width = useMemo(() => (isWeekend(date) ? 25 : 100), [date]);

    const itemsCloud = useMemo(() => {
        if (!isActivity) {
            return [];
        }

        const flatItems = charts.flatMap(({ items, sourceType }) =>
            items.map((item) => ({
                ...item,
                sourceType,
            }))
        ).sort(compareTimelineItemsByDate);

        if (flatItems.length === 0) {
            return [];
        }

        const chartWidth = Math.max(0, width - 8);
        const chartHeight = Math.max(26, width < 40 ? 26 : 34);
        const createdAtTimes = flatItems
            .map((item) => getCreatedAtDisplayTime(item.createdAt))
            .filter(Number.isFinite);
        const timeRange =
            createdAtTimes.length > 1
                ? createdAtTimes[createdAtTimes.length - 1] - createdAtTimes[0]
                : null;
        const isCompactRange = timeRange !== null && timeRange < COMPACT_TIME_RANGE_MS;
        const cloudWidth = isCompactRange
            ? chartWidth * clamp(timeRange / COMPACT_TIME_RANGE_MS, 0.35, 0.7)
            : chartWidth;
        const cloudOffsetX = Math.max(0, Math.round((chartWidth - cloudWidth) / 2));

        return flatItems.map((item, index) => {
            const key = `${item.sourceType}-${item.title}-${item.url ?? "text"}-${index}`;
            const markerSize = estimateMarkerSize(item);
            const step = cloudWidth / Math.max(1, flatItems.length);
            const ySeed = createCloudSeed(`${key}-${presence}-${item.url ?? "url"}-y`);
            const maxY = Math.max(0, chartHeight - markerSize);

            const next: CloudItem = {
                ...item,
                seedKey: key,
                x: clamp(
                    Math.round(cloudOffsetX + step * index + step / 2 - markerSize / 2),
                    0,
                    Math.max(0, chartWidth - markerSize)
                ),
                y: maxY ? ySeed % (maxY + 1) : 0,
                width: markerSize,
                height: markerSize,
                opacity: 1 - (index / Math.max(1, flatItems.length)) * 0.28,
            };

            return next;
        });
    }, [charts, isActivity, presence, width]);

    const handleClick = useCallback(() => {
        if (userData?.user?.email) {
            const searchParams = new URLSearchParams(location.search);
            searchParams.set("selectedDate", format(date, "yyyy-MM-dd"));

            navigate(
                {
                    pathname: `/worklog/${userData.user.email}`,
                    search: `${searchParams.toString()}&from=actions`,
                },
                { state: { backgroundLocation: location } }
            );
        }
    }, [userData?.user?.email, location, date, navigate]);

    return (
        <TableCell
            onClick={handleClick}
            className={styles.timelineCell}
            style={{
                width,
                minWidth: width,
                maxWidth: width,
                backgroundColor: bgcolor === "background.default" ? "var(--ds-surface)" : bgcolor,
            }}
        >
            {presence !== PresenceTypes.standard && (
                <span className={styles.timelinePresence}>{presence}</span>
            )}
            {isActivity && (
                <div
                    className={styles.timelineChart}
                    style={{ paddingTop: `${paddingTop}px`, paddingBottom: "0.15rem" }}
                >
                    {itemsCloud.map((item) => (
                        <div
                            key={item.seedKey}
                            className={styles.timelineCloudItem}
                            style={{
                                left: `${item.x}px`,
                                top: `${item.y}px`,
                                opacity: item.opacity,
                            }}
                        >
                            <TimeLineItem
                                title={item.title}
                                url={item.url}
                                variant={item.variant}
                                createdAt={item.createdAt}
                                sourceType={item.sourceType}
                            />
                        </div>
                    ))}
                </div>
            )}
        </TableCell>
    );
};

// ОПТИМИЗАЦИЯ: Кастомный компаратор для точного контроля перерисовок
const arePropsEqual = (prevProps: TimeLineCellProps, nextProps: TimeLineCellProps) => {
    return (
        prevProps.bgcolor === nextProps.bgcolor &&
        prevProps.presence === nextProps.presence &&
        prevProps.isActivity === nextProps.isActivity &&
        prevProps.date.getTime() === nextProps.date.getTime() &&
        prevProps.userData === nextProps.userData &&
        prevProps.charts === nextProps.charts
    );
};

// Экспортируем мемоизированный компонент с кастомным компаратором
export const TimeLineCell = memo(TimeLineCellComponent, arePropsEqual);

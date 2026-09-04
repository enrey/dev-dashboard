import { FC, useContext, useMemo, memo } from "react";

import { TimeLineCell } from "./TimeLineCell";
import { TimeLineProps } from "./models";
import { preparingStatData } from "./utils";
import { FilterContext } from "../../../../contexts/filter";

// ОПТИМИЗАЦИЯ: Мемоизация компонента для предотвращения лишних ререндеров
// Days теперь передаются из родительского компонента для избежания пересчетов
const TimeLineComponent: FC<TimeLineProps> = ({ filter, userData, days }) => {
    const { chartTypes } = useContext(FilterContext);

    // ОПТИМИЗАЦИЯ: Мемоизируем statData только если изменились зависимости
    const statData = useMemo(
        () => preparingStatData(days, userData, chartTypes),
        [days, userData, chartTypes]
    );

    return statData.map(({ id, ...data }, index) => {
        return (
            <TimeLineCell
                key={id}
                {...data}
                userData={userData}
                date={days[index]}
            />
        );
    });
};

// ОПТИМИЗАЦИЯ: Кастомный компаратор для точного контроля перерисовок
const arePropsEqual = (prevProps: TimeLineProps, nextProps: TimeLineProps) => {
    // Сравниваем filter даты
    if (
        prevProps.filter.dateStart.getTime() !== nextProps.filter.dateStart.getTime() ||
        prevProps.filter.dateEnd.getTime() !== nextProps.filter.dateEnd.getTime()
    ) {
        return false;
    }

    // Сравниваем days (по ссылке, так как они стабильны из useMemo)
    if (prevProps.days !== nextProps.days) {
        return false;
    }

    // Сравниваем userData (по ссылке)
    if (prevProps.userData !== nextProps.userData) {
        return false;
    }

    return true;
};

// Экспортируем мемоизированный компонент с кастомным компаратором
export const TimeLine = memo(TimeLineComponent, arePropsEqual);

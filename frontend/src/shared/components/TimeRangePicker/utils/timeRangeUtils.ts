import { subDays, subMonths, startOfDay, endOfDay } from "date-fns";

import { RELATIVE_TIME_OPTIONS } from "../constants";
import { TimeRange, RelativeTimeOption } from "../models";

/**
 * Для demo-сборки VITE_SHOW_DATE задаёт дату в формате YYYY-MM-DD,
 * относительно которой строятся все относительные диапазоны.
 */
export const getReferenceDate = (): Date => {
    const showDate = import.meta.env.VITE_SHOW_DATE?.trim();

    if (!showDate) {
        return new Date();
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(showDate);
    if (!match) {
        console.warn(
            `Некорректный VITE_SHOW_DATE="${showDate}". Ожидается формат YYYY-MM-DD.`
        );
        return new Date();
    }

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const isValid =
        date.getFullYear() === Number(year) &&
        date.getMonth() === Number(month) - 1 &&
        date.getDate() === Number(day);

    if (!isValid) {
        console.warn(`Некорректная дата VITE_SHOW_DATE="${showDate}".`);
        return new Date();
    }

    return date;
};

export const calculateRelativeRange = (option: RelativeTimeOption): TimeRange => {
    const now = getReferenceDate();
    let from: Date;

    if (option.days) {
        from = subDays(now, option.days);
    } else if (option.months) {
        from = subMonths(now, option.months);
    } else {
        from = now;
    }

    return {
        from: startOfDay(from),
        to: endOfDay(now),
        label: option.label,
        isRelative: true,
    };
};

export const createAbsoluteRange = (from: Date, to: Date, label?: string): TimeRange => {
    return {
        from: startOfDay(from),
        to: endOfDay(to),
        label: label || "Абсолютный диапазон",
        isRelative: false,
    };
};

export const getRelativeOptionFromRange = (range: TimeRange): RelativeTimeOption | null => {
    if (!range.isRelative) return null;
    
    return RELATIVE_TIME_OPTIONS.find(opt => opt.label === range.label) || null;
};

/**
 * Проверяет, соответствует ли диапазон дат одному из относительных опций
 * и возвращает соответствующий TimeRange с правильным label
 */
export const detectRelativeRange = (from: Date, to: Date): TimeRange | null => {
    const now = getReferenceDate();
    const diffInDays = Math.floor((now.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    
    // Проверяем, является ли 'to' сегодняшним днём
    const isToday = 
        to.getDate() === now.getDate() &&
        to.getMonth() === now.getMonth() &&
        to.getFullYear() === now.getFullYear();
    
    if (!isToday) {
        return null;
    }
    
    // Ищем подходящую опцию
    for (const option of RELATIVE_TIME_OPTIONS) {
        if (option.days && diffInDays >= option.days - 1 && diffInDays <= option.days + 1) {
            return calculateRelativeRange(option);
        }
        if (option.months) {
            const monthsFrom = subMonths(now, option.months);
            const diffInMonths = Math.abs(monthsFrom.getMonth() - from.getMonth());
            const diffInYears = Math.abs(monthsFrom.getFullYear() - from.getFullYear());
            
            if (diffInMonths <= 1 && diffInYears === 0) {
                return calculateRelativeRange(option);
            }
        }
    }
    
    return null;
};


import { getDate, getMonth } from "date-fns";

export const formatDateToRussian = (date: Date) => {
    const rusMonth = [
        "Ян",
        "Фев",
        "Март",
        "Ап",
        "Май",
        "Июнь",
        "Июль",
        "Ав",
        "Сен",
        "Ок",
        "Ноя",
        "Дек",
    ];

    const day = getDate(date);
    const month = getMonth(date);

    return `${day} ${rusMonth[month]}`;
};

import { RelativeTimeOption } from "../models";

export const RELATIVE_TIME_OPTIONS: RelativeTimeOption[] = [
    { label: "Последние 3 дня", value: "last-3-days", days: 3 },
    { label: "Последние 7 дней", value: "last-7-days", days: 7 },
    { label: "Последние 14 дней", value: "last-14-days", days: 14 },
    { label: "Последний месяц", value: "last-1-month", months: 1 },
    { label: "Последние 2 месяца", value: "last-2-months", months: 2 },
    { label: "Последние 3 месяца", value: "last-3-months", months: 3 },
];



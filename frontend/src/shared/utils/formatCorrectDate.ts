import { formatISO } from "date-fns";

export const formatCorrectDate = (date: Date) => {
    return formatISO(date, { representation: "date" });
};

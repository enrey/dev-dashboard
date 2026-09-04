import { TaskWithExtendedMrs } from "pages/TasksPage/models";
import { HistoryTaskColor } from "../models";

export const prepareHistory = (task: TaskWithExtendedMrs): HistoryTaskColor[] => {
    return (
        task?.history?.map((item) => {
            const selfColor =
                task?.contributors.find((c) => c.email === item.changerEmail)
                    ?.selfColor || "";
            return { ...item, selfColor };
        }) || []
    );
};

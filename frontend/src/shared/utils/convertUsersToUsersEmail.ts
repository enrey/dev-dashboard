import { ChartUser } from "shared/models";

/** Конвертация емэйлов пользователей для формирования
 *  квери параметра фильтра по пользователям */
export const convertUsersToUsersEmail = (users: ChartUser[]) => {
    return users.reduce((prev, cur, index) => {
        if (users.length === index + 1) {
            return prev + `${cur.email}`;
        }
        return prev + `${cur.email}-`;
    }, "" as string);
};

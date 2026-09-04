import { ChartUser, PresenceUser } from "shared/models";

/** Получить список пользователей из Presence данных */
export const mapPresenceUsersToUsers = (
    presenceUsers: PresenceUser[]
): Map<string, ChartUser> => {
    const users = new Map<string, ChartUser>();

    presenceUsers.forEach((data) => {
        const email = data.email?.toLowerCase()?.trim();

        // Проверяем что email существует, не пустой и содержит @
        if (email && email.length > 0 && email.includes('@')) {
            const user = users.get(email);
            if (user) {
                user.name = user.name.length > data.full_name.length ? user.name : data.full_name;
            } else {
                users.set(email, { email, name: data.full_name, order: 1 });
            }
        }
    });

    return users;
};




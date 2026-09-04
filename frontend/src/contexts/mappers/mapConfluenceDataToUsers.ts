import { ChartUser, ConfluenceInfo } from "shared/models";

/** Получить список пользователей из Confluence данных */
export const mapConfluenceDataToUsers = (
    confluenceData: ConfluenceInfo[]
): Map<string, ChartUser> => {
    const users = new Map<string, ChartUser>();

    confluenceData.forEach((data) => {
        const email = data.changer?.toLowerCase()?.trim();

        // Проверяем что email существует, не пустой и содержит @
        if (email && email.length > 0 && email.includes('@')) {
            const user = users.get(email);
            if (user) {
                // Если пользователь уже есть, используем имя из changerFio если оно есть и длиннее
                if (data.changerFio && data.changerFio.length > user.name.length) {
                    user.name = data.changerFio;
                }
            } else {
                // Используем changerFio если есть, иначе email
                const name = data.changerFio || data.changer;
                users.set(email, { email, name, order: 1 });
            }
        }
    });

    return users;
};

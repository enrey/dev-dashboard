import { ChartUser, GitAnalyzerFlatData } from "shared/models";

/** Получить список пользователей из статистики, имя берется самое длинное */
export const mapGitAnalyzerFlatDataToGitUsers = (
    flatData: GitAnalyzerFlatData[]
): Map<string, ChartUser> => {
    const users = new Map<string, ChartUser>();

    flatData.forEach((data) => {
        const email = data.email?.toLowerCase()?.trim();

        // Проверяем что email существует, не пустой и содержит @
        if (email && email.length > 0 && email.includes('@')) {
            const user = users.get(email);
            if (user) {
                user.name = user.name.length > data.name.length ? user.name : data.name;
            } else {
                users.set(email, { email, name: data.name, order: 1 });
            }
        }
    });

    return users;
};

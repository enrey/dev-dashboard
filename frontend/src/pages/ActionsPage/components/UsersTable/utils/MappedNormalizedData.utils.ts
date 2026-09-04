import { GitAnalyzerChartData, JiraUserInfo } from "shared/models";

import { MappedNormalizedData } from "../models";

export const mappedDataWithNormalizedUser = (
    data: GitAnalyzerChartData[],
    jiraUsers: JiraUserInfo[],
    userNames: Record<string, string> = {}
): MappedNormalizedData[] => {
    return data.map((item) => {
        // Получаем displayName из userNames или используем имя по умолчанию
        const displayName = userNames[item.user.email] || item.user.name;

        for (const user of jiraUsers) {
            if (user.email.toLowerCase() === item.user.email.toLowerCase()) {
                return {
                    ...item,
                    displayName,
                    user: {
                        ...item.user,
                        name: user.displayName,
                        isMatched: true,
                    },
                };
            }
        }

        return {
            ...item,
            displayName,
            user: {
                ...item.user,
                isMatched: false,
            },
        };
    });
};

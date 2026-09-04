import { GitAnalyzerChartData } from "shared/models";

const presence = new Set(["Отсутствие", "Отпуск", "Болезнь"]);

export const getIsPresence = (userData: GitAnalyzerChartData, stringDate: string) =>
    !presence.has(userData.presence.find(({ date }) => date === stringDate)?.type ?? "");

import { ConfluenceInfo } from "shared/models";

/**
 * Извлекает pageId из URL Confluence
 */
const extractPageIdFromUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        // Проверяем различные варианты параметров где может быть pageId
        return urlObj.searchParams.get('pageId') || 
               urlObj.searchParams.get('spaceKey') || 
               urlObj.pathname.split('/').pop() || 
               null;
    } catch {
        // Если URL невалиден, пытаемся извлечь pageId регулярным выражением
        const pageIdMatch = url.match(/pageId[=/](\d+)/i);
        if (pageIdMatch) {
            return pageIdMatch[1];
        }
        // Если ничего не найдено, используем весь URL как ключ
        return url;
    }
};

/**
 * Дедуплицирует события Confluence по pageId из URL для TimeLine  
 * Группирует события по pageId и создает одну запись для каждого уникального pageId с подсчетом действий
 */
export const dedupConfluenceEvents = (events: ConfluenceInfo[]): Array<ConfluenceInfo & { count: number }> => {
    const groupedByPageId = new Map<string, ConfluenceInfo[]>();

    // Группируем события по pageId (из поля pageId, затем из URL, затем objectId)
    events.forEach(event => {
        const key = event.pageId?.toString() || 
                   extractPageIdFromUrl(event.url) || 
                   event.objectId.toString();
        if (!groupedByPageId.has(key)) {
            groupedByPageId.set(key, []);
        }
        groupedByPageId.get(key)!.push(event);
    });

    const result: Array<ConfluenceInfo & { count: number }> = [];

    // Для каждого уникального pageId берем первое событие как представитель и добавляем счетчик
    groupedByPageId.forEach((eventsOfPage, pageId) => {
        if (eventsOfPage.length === 0) return;

        // Берем первое событие как базовое
        const firstEvent = eventsOfPage[0];

        // Создаем дедуплицированное событие с добавлением счетчика
        const dedupedEvent: ConfluenceInfo & { count: number } = {
            ...firstEvent,
            count: eventsOfPage.length
        };

        result.push(dedupedEvent);
    });

    return result;
};

import React, { useMemo } from "react";

import { useConfluenceData } from "../../../../contexts/data";
import { environment } from "../../../../environments/environment.prod";
import styles from "../common/DashboardWidget/DashboardWidget.module.scss";
import { DashboardListWidget } from "../common/DashboardListWidget/DashboardListWidget";

export const TopConfluenceWidget: React.FC = () => {
    const { confluenceData } = useConfluenceData();

    const { allArticles, totalChanges, totalArticles } = useMemo(() => {
        // Собираем названия страниц из записей типа "page"
        const pageTitles = new Map<string, string>();

        confluenceData.forEach((item) => {
            const urlMatch = item.url.match(/pageId=(\d+)/);
            const pageId = urlMatch ? urlMatch[1] : null;

            if (pageId && item.changeType === "page") {
                pageTitles.set(pageId, item.pageTitle);
            }
        });

        // Группируем ВСЕ изменения по pageId, но показываем только страницы с changeType="page"
        const changesByArticle = new Map<
            string,
            { count: number; title: string; url: string; pageChanges: number }
        >();

        confluenceData.forEach((item) => {
            const urlMatch = item.url.match(/pageId=(\d+)/);
            const pageId = urlMatch ? urlMatch[1] : null;

            if (!pageId) {
                return;
            }

            if (!changesByArticle.has(pageId)) {
                const cleanUrl = `${environment.confluenceBrowseUrl}/pages/viewpage.action?pageId=${pageId}`;
                const title = pageTitles.get(pageId) || item.pageTitle;
                changesByArticle.set(pageId, {
                    count: 0,
                    pageChanges: 0,
                    title,
                    url: cleanUrl,
                });
            }

            const article = changesByArticle.get(pageId)!;
            article.count += 1;

            if (item.changeType === "page") {
                article.pageChanges += 1;
            }
        });

        const filteredArticles = Array.from(changesByArticle.entries())
            .filter(([_, data]) => data.pageChanges > 0)
            .map(([key, data]) => ({
                pageId: key,
                ...data,
            }));

        const totalArticlesCount = filteredArticles.length;

        const articlesArray = filteredArticles
            .map((data) => ({
                pageId: data.pageId,
                name: data.title,
                changes: data.count,
                url: data.url,
            }))
            .sort((a, b) => b.changes - a.changes);

        const max =
            articlesArray.length > 0
                ? Math.max(...articlesArray.map((a) => a.changes))
                : 1;

        const allArticlesData = articlesArray.map((article) => ({
            ...article,
            percentage: (article.changes / max) * 100,
        }));

        const total = articlesArray.reduce((sum, article) => sum + article.changes, 0);

        return {
            allArticles: allArticlesData,
            totalChanges: total,
            totalArticles: totalArticlesCount,
        };
    }, [confluenceData]);

    const displayItems = allArticles.map((article) => ({
        id: article.pageId,
        label: article.name,
        value: article.changes,
        percentage: article.percentage,
        tooltip: `${article.changes} ${article.changes === 1 ? "change" : "changes"}`,
        onClick: () => window.open(article.url, "_blank"),
        labelClassName: styles.labelWide,
    }));

    return (
        <DashboardListWidget
            title="CONFLUENCE: TOP CHANGED ARTICLES"
            stats={[
                {
                    value: totalChanges,
                    label: "Page changes",
                },
                {
                    value: totalArticles,
                    label: "Articles",
                },
            ]}
            items={displayItems}
            barColor="#22c55e"
            emptyState="Нет данных о статьях Confluence"
            maxVisible={5}
        />
    );
};

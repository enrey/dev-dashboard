import React, { useMemo } from "react";

import { useJiraData } from "../../../../contexts/data";
import { DashboardListWidget } from "../common/DashboardListWidget/DashboardListWidget";

export const TopJiraWidget: React.FC = () => {
    const { tasksData } = useJiraData();

    const { allProjects, totalTasks, totalProjects } = useMemo(() => {
        // Группируем уникальные задачи по проектам Jira
        const tasksByProject = new Map<string, Set<string>>();

        tasksData.forEach((task) => {
            const projectName = task.project;
            if (!tasksByProject.has(projectName)) {
                tasksByProject.set(projectName, new Set());
            }
            tasksByProject.get(projectName)!.add(task.issueNumber);
        });

        const totalProjectsCount = tasksByProject.size;

        const projectsArray = Array.from(tasksByProject.entries())
            .map(([name, tasks]) => ({ name, tasks: tasks.size }))
            .sort((a, b) => b.tasks - a.tasks);

        const max =
            projectsArray.length > 0 ? Math.max(...projectsArray.map((p) => p.tasks)) : 1;

        const allUniqueTasks = new Set<string>();
        tasksData.forEach((task) => {
            allUniqueTasks.add(task.issueNumber);
        });
        const total = allUniqueTasks.size;

        const allProjectsData = projectsArray.map((project) => ({
            ...project,
            percentage: (project.tasks / max) * 100,
        }));

        return {
            allProjects: allProjectsData,
            totalTasks: total,
            totalProjects: totalProjectsCount,
        };
    }, [tasksData]);

    const displayItems = allProjects.map((project) => ({
        id: project.name,
        label: project.name,
        value: project.tasks,
        percentage: project.percentage,
        tooltip: `${project.tasks} ${project.tasks === 1 ? "task" : "tasks"}`,
    }));

    return (
        <DashboardListWidget
            title="JIRA TASKS: TOP PROJECTS"
            stats={[
                {
                    value: totalTasks,
                    label: "Unique tasks",
                },
                {
                    value: totalProjects,
                    label: "Projects",
                },
            ]}
            items={displayItems}
            barColor="#14b8a6"
            emptyState="Нет данных о проектах Jira"
            maxVisible={5}
        />
    );
};

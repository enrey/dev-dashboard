export const reduceProjectsQuery = (projects: string[]): string => {
    return projects.reduce((prev, cur, index) => {
        if (projects.length === index + 1) {
            return prev + cur;
        }
        return prev + `${cur}+`;
    }, "");
};

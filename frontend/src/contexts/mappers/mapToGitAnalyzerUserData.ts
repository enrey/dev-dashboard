import { GitAnalyzerInfoModel, GitAnalyzerFlatData } from "shared/models";

export const mapToGitAnalyzerUserData = (
    source: GitAnalyzerInfoModel[]
): GitAnalyzerFlatData[] => {
    return source.map((stat) => {
        return {
            repositoryName: stat.repositoryName,
            webUI: stat.webUI,
            date: stat.date,
            email: stat.email.toLowerCase(),
            name: stat.name,
            commitsCount: stat.commitsCount,
            added: stat.added,
            deleted: stat.deleted,
            total: stat.total,
            commitsArray: stat.commitsArray.map((i) => {
                return {
                    commitDate: i.commitDate,
                    sha: i.sha,
                    message: i.message,
                    added: i.added,
                    deleted: i.deleted,
                    total: i.total,
                    changedFilesCount: i.changedFilesCount,
                };
            }),
        };
    });
};

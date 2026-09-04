import { GitAnalyzerCommitFlatData } from "shared/models";

export interface ConvertedGitTaskModel {
    repositoryName: string;
    webUI: string;
    date: string;
    email: string;
    name: string;
    commitsArray: GitAnalyzerCommitFlatData[];
    commitsCount: number;
    added: number;
    deleted: number;
    totalChanges: number;
    number: string;
}

import { GitAnalyzerInfoCommitModel } from "./GitAnalyzerInfoCommit.model";

export interface GitAnalyzerInfoModel {
    repositoryName: string;
    webUI: string;
    date: string;
    name: string;
    email: string;
    commitsCount: number;
    deleted: number;
    added: number;
    total: number;
    commitsArray: GitAnalyzerInfoCommitModel[];
}

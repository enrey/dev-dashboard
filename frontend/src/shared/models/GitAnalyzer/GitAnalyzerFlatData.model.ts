import { GitAnalyzerCommitFlatData } from "./GitAnalyzerCommitFlatData.model";

export interface GitAnalyzerFlatData {
    repositoryName: string;
    webUI: string;
    date: string;
    email: string;
    name: string;
    commitsArray: GitAnalyzerCommitFlatData[];
    commitsCount: number;
    added: number;
    deleted: number;
    total: number;
}

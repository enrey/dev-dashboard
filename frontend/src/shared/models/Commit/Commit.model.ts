import { CommitStats } from "./CommitStats.model";

export interface CommitModel {
    id: string;
    short_id: string;
    created_at: string;
    parent_ids: string[];
    title: string;
    message: string;
    author_name: string;
    author_email: string;
    authored_date: string;
    committer_name: string;
    committer_email: string;
    committed_date: string;
    stats: CommitStats;
    status?: any;
    last_pipeline?: any;
    project_id: number;
}

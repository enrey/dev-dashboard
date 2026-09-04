import { GitlabCommentItem } from "./GitlabCommentItem.model";

export interface GitlabCommentModel {
    email: string;
    items: GitlabCommentItem[];
    totalComments: number;
    username: string;
}

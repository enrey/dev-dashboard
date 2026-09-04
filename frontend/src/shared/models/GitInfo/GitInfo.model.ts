import { GitInfoAuthor } from "./GitInfoAuthor.model";
import { GitInfoPushdata } from "./GitInfoPushdata.model";

export interface GitInfoModel {
    project_id: number;
    action_name: string;
    target_id?: any;
    target_iid?: any;
    target_type?: any;
    author_id: number;
    target_title?: any;
    created_at: string;
    author: GitInfoAuthor;
    push_data: GitInfoPushdata;
    author_username: string;
}

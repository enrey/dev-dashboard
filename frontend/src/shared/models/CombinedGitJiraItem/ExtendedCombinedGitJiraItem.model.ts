import { GitJiraItemWithMr } from "./GitJiraItemWithMr.model";
import { CommentDto } from "../CommentDto.model";

export interface ExtendedCombinedGitJiraItem extends GitJiraItemWithMr {
    comments: CommentDto[];
}

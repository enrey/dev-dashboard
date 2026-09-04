import { JiraInfoItem } from "./JiraInfoItem";

export interface DeveloperModel {
    name: string;
    displayName: string;
    emailAddress: string;
    active: boolean;
    //locale: string;
    //stack: 'Java' | 'Frontend' | 'NET' | 'Python';
    //gitlab_id: number;
    //gitlab_name: string;
    //region: string;
    //self: string;
    //work_started_at?: string;
    tasks: JiraInfoItem[];
    tasksCount: number;
}

import { ProjectGroupaccess } from "./ProjectGroupaccess.model";

export interface ProjectPermissions {
    project_access?: any;
    group_access: ProjectGroupaccess;
}

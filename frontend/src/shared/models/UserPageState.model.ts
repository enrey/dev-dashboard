import type { UserRole } from "./UserRole.model";

export interface UserPageState {
    roles: UserRole[];
    userRoles: Record<string, UserRole[]>;
    userNames: Record<string, string>;
    linkedEmails: Record<string, string[]>;
    version: number;
}

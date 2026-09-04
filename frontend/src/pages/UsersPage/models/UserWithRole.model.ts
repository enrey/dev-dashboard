import type { UserRole } from "shared/models";

export interface UserWithRole {
    email: string;
    name: string;
    role: UserRole;
}


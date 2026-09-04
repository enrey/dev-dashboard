import { UserRole } from "./UsersTableRowProps.model";

export interface UserRowProps {
    rowNumber?: number;
    isMatched: boolean;
    email: string;
    name: string;
    totalProjects: string[];
    selectedDate?: Date;
    userNames: Record<string, string>;
    userRoles: Record<string, UserRole[]>;
    linkedEmails: Record<string, string[]>;
}

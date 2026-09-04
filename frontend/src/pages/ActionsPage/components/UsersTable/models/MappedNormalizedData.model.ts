import { UsersTableRowProps } from "./UsersTableRowProps.model";

export type MappedNormalizedData = Omit<
    UsersTableRowProps,
    "filter" | "userNames" | "userRoles" | "linkedEmails" | "days"
>;

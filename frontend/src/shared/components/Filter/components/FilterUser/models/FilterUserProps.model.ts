import { ChartUser } from "shared/models";

export interface FilterUserProps {
    usersFilterList: ChartUser[];
    setUsers: (value: ChartUser[]) => void;
    selectUsers: ChartUser[];
}

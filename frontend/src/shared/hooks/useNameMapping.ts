import { useUsersData } from "../../contexts/data";
import { ContributorData } from "../models";

/**
 * Маппинг имени в случае если после всех предыдущих маппингов вместо имени остался логин или почта
 */
export const useNameMapping = (contributor: ContributorData) => {
    const { users } = useUsersData();
    const regex = /^[a-zA-Z]+$/g;
    let name = contributor.name;
    if (!contributor.name || contributor.name?.match(regex)) {
        const fiendUser = users.filter((u) => u.email === contributor.email)?.[0]?.name;
        name = fiendUser || contributor.name || contributor.email;
    }
    return {
        name,
    };
};

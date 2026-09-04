import { PersonStaticsStoreDto } from ".";

export interface TaskResponseDto {
    task: string;
    titles: string[];
    commits: PersonStaticsStoreDto[];
}

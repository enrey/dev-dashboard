import { PersonStaticsWithItemSize } from "shared/models";

export interface CommitsCellProps {
    date: Date;
    crossedDayAndCommitDate: PersonStaticsWithItemSize[];
    taskCommitsArrayWithItemSize: PersonStaticsWithItemSize[];
    onHover: boolean;
}

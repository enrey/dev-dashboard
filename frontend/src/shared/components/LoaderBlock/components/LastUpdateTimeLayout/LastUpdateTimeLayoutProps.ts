import { JobStatus } from "shared/models";

export interface LastUpdateTimeLayoutProps {
    loadedResource?: JobStatus;
    source?: string;
    withoutDateUpdateBlock?: boolean;
}

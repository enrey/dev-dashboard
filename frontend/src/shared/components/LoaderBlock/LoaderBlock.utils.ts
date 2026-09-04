import { JobStatus } from "shared/models";

export const getLastUpdatedProjectInfo = (
    gitProjectsStatus: JobStatus[],
    selectedProject: string
) => gitProjectsStatus?.find((project) => project.jobName === selectedProject);

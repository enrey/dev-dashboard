import { ReactNode } from "react";

import { JobStatus } from "shared/models";

import { LoadingStatus } from "shared/enums";

export interface LoadableItemBlockProps {
    loadingStatus: LoadingStatus;
    source: string;
    sourceHref?: string;
    method?: string;
    loadedResource?: JobStatus;
    withoutDateUpdateBlock?: boolean;
    summary?: ReactNode[];
    isFromCache?: boolean;
}

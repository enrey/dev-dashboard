import { DatasourceStatusEnum } from "shared/enums";

import { FilterFromEnum } from "../enum";

export interface FilterData {
    users: any[];
    projects: any[];
    sources: DatasourceStatusEnum[];
    dateStart: Date;
    dateEnd: Date;
    searchParamsString?: string;
}

export interface FilterProps {
    from?: FilterFromEnum;
    skipUrlSync?: boolean;
    children?: React.ReactNode;
}

export interface FilterBySourceProps {
    from: FilterFromEnum;
}

export interface FormatQueryParam {
    users?: string;
    projects?: string;
}

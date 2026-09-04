import { FC, useContext } from "react";

import Box from "@mui/material/Box";
import { DataSourceIcon } from "shared/components/DataSourceIcon";

import { DatasourceStatusEnum } from "shared/enums";

import { FilterContext } from "../../../../../contexts/filter";
import { FilterFromEnum } from "../../enum";
import { FilterBySourceProps } from "../../models";

const filterDataSources = [
    DatasourceStatusEnum.JIRA,
    DatasourceStatusEnum.GITLAB,
    DatasourceStatusEnum.MAIL,
    DatasourceStatusEnum.GIT,
    DatasourceStatusEnum.CONFLUENCE,
];

export const FilterBySource: FC<FilterBySourceProps> = ({ from }) => {
    const { filter, setFilter } = useContext(FilterContext);
    const sources = filter.sources;

    const handleCheck = (icon: DatasourceStatusEnum) => () => {
        const filteredSources = sources.includes(icon)
            ? sources.filter((i) => i !== icon)
            : [...sources, icon];
        setFilter({ sources: filteredSources });
    };
    const dataSources = filterDataSources.filter((icon) => {
        if (from === FilterFromEnum.statsWorkflow) {
            return icon !== DatasourceStatusEnum.CONFLUENCE;
        }
        return true;
    });

    return (
        <Box display="flex" columnGap="1px">
            {dataSources.map((icon) => (
                <Box
                    key={icon}
                    sx={{
                        display: "flex",
                        cursor: "pointer",
                        opacity: sources.includes(icon) ? 1 : 0.2,
                    }}
                    onClick={handleCheck(icon)}
                >
                    <DataSourceIcon key={icon} icon={icon} />
                </Box>
            ))}
        </Box>
    );
};

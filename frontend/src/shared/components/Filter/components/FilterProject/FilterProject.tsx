import { FC, ReactNode } from "react";

import { Autocomplete, Chip, TextField } from "@mui/material";

import { FilterProjectProps } from "./models";
import { useQueryParam } from "../../hook/useQueryParam";

export const FilterProject: FC<FilterProjectProps> = ({
    options,
    limitTags,
    setProjects,
}) => {
    const { projectArrayQueryParam } = useQueryParam();
    return (
        <Autocomplete
            size="small"
            multiple
            disableCloseOnSelect
            value={projectArrayQueryParam}
            limitTags={limitTags}
            id="projects"
            options={options}
            renderTags={(value, getTagProps) =>
                value.map((item, index) => (
                    <Chip
                        key={`${index}_${item}`}
                        size="small"
                        label={item as ReactNode}
                        onDelete={getTagProps({ index }).onDelete}
                    />
                ))
            }
            onChange={(event: any, newValue) => {
                setProjects(newValue as string[]);
            }}
            renderInput={(params) => <TextField {...params} label="Проекты" />}
            sx={{ ml: "16px", minWidth: "80px", width: "200px" }}
        />
    );
};

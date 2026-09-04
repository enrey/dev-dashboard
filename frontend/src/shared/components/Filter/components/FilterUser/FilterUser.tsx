import { FC } from "react";

import {
    Autocomplete,
    AutocompleteRenderGetTagProps,
    AutocompleteRenderInputParams,
    Chip,
    TextField,
} from "@mui/material";

import { ChartUser } from "shared/models";

import { FilterUserProps } from "./models";

export const FilterUser: FC<FilterUserProps> = ({
    usersFilterList,
    setUsers,
    selectUsers,
}) => {
    return (
        <Autocomplete
            size="small"
            multiple
            disableCloseOnSelect
            limitTags={2}
            id="users"
            options={usersFilterList}
            isOptionEqualToValue={(option, value) =>
                (option as ChartUser).email === (value as ChartUser).email
            }
            renderTags={(value, getTagProps: AutocompleteRenderGetTagProps) => {
                return (value as ChartUser[]).map(({ name, email }, index) => {
                    return (
                        <Chip
                            key={email}
                            size="small"
                            label={name}
                            title={`${name}(${email})`}
                            onDelete={getTagProps({ index }).onDelete}
                        />
                    );
                });
            }}
            getOptionLabel={(label) =>
                `${(label as ChartUser).name}(${(label as ChartUser).email})`
            }
            onChange={(event: any, newValue) => {
                setUsers(newValue as ChartUser[]);
            }}
            renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField {...params} label="Разработчики" />
            )}
            value={selectUsers}
            sx={{ ml: "16px", minWidth: "80px", width: "200px" }}
        />
    );
};

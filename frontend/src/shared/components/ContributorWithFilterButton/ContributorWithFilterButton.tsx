import StartIcon from "@mui/icons-material/Start";
import { Box, Button, Link, Tooltip, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

import { FullContributorModel } from "shared/models";

import styles from "./ContributorWithFilterButton.module.scss";
import { useNameMapping } from "shared/hooks";
import { useAddToFilterContributor } from "../../hooks/useAddToFilterContributor";
import { useFilterQueryParams } from "../../hooks/useFilterQueryParams.hook";
import { MuiRouterLink } from "../MuiRouterLink";

import { ContributorWithFilterButtonProps } from ".";

export const ContributorWithFilterButton = ({
    contributor,
}: ContributorWithFilterButtonProps) => {
    const { linkWithQuery } = useFilterQueryParams();
    const { name } = useNameMapping(contributor);
    const handleAddToFilterContributor = useAddToFilterContributor();
    const location = useLocation();
    const worklogLink = linkWithQuery(`/worklog/${contributor.email}`);
    const [worklogPathname, worklogQuery = ""] = worklogLink.split("?");
    const worklogSearch = `?${worklogQuery}${worklogQuery ? "&" : ""}from=tasks`;
    return (
        <Box
            display="grid"
            alignItems="center"
            sx={{
                justifyContent: "space-between",
                gridTemplateColumns: "1fr 20px",
                gridTemplateRows: "20px",
            }}
        >
            <Link
                sx={{
                    display: "flex",
                    fontWeight: "bolder",
                    m: 0,
                }}
                underline="none"
                to={{
                    pathname: worklogPathname,
                    search: worklogSearch,
                }}
                state={{ backgroundLocation: location }}
                component={MuiRouterLink}
            >
                <Box display="flex">
                    <Tooltip title={name.length > 15 && name}>
                        <Typography
                            sx={{
                                lineHeight: "1",
                                opacity: (contributor as FullContributorModel).isMatched
                                    ? "1"
                                    : "0.6",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                maxWidth: "145px",
                            }}
                        >
                            {name}
                        </Typography>
                    </Tooltip>
                </Box>
            </Link>
            <Button
                className={styles.fastFilter_button}
                sx={{
                    padding: "5px",
                    minWidth: "20px",
                }}
                endIcon={
                    <StartIcon
                        sx={{
                            transform: "rotate(-90deg)",
                            fill: "#3244ccc1",
                        }}
                    />
                }
                onClick={() => handleAddToFilterContributor(contributor)}
            />
        </Box>
    );
};

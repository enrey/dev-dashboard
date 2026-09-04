import { Typography } from "@mui/material";

import { MAX_ARRAY_ITEM_LENGTH } from "shared/constants";
import { FullPersonStaticsStoreDto, PersonStaticsWithItemSize } from "shared/models";

import { CommitItem } from "..";

import { OverloadedCommitsLayoutProps } from ".";

export const OverloadedCommitsLayout = ({
    commitsToIterate,
    onHover,
}: OverloadedCommitsLayoutProps) => (
    <>
        <Typography>+{commitsToIterate?.length - MAX_ARRAY_ITEM_LENGTH}</Typography>
        {commitsToIterate
            ?.slice(0, MAX_ARRAY_ITEM_LENGTH)
            .map((slicedCommit: PersonStaticsWithItemSize, index) => (
                <CommitItem
                    key={`OCL_${index}-${slicedCommit.sha}_${slicedCommit.email}_${slicedCommit.date}`}
                    commit={slicedCommit as FullPersonStaticsStoreDto}
                    onHover={onHover}
                />
            ))}
    </>
);

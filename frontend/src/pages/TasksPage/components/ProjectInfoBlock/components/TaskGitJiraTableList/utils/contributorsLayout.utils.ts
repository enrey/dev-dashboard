import { createElement } from "react";

import { ContributorWithFilterButton } from "shared/components";
import { FullContributorModel } from "shared/models";

const sortContributors = (a: FullContributorModel, b: FullContributorModel) => {
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    return 0;
};
export const contributorsLayout = (contributors: FullContributorModel[]) => {
    const soringContributors = contributors.sort(sortContributors);
    return soringContributors.map((contributor: FullContributorModel) => {
        return createElement(ContributorWithFilterButton, {
            key: contributor.selfColor,
            contributor: contributor,
        });
    });
};

import { PersonStaticsStoreWithItemSizeDto } from "./PersonStaticsStoreWithItemSizeDto.model";
import { FullContributorModel } from "../Contributor";

export type FullPersonStaticsStoreDto = PersonStaticsStoreWithItemSizeDto & {
    contributor: FullContributorModel;
};

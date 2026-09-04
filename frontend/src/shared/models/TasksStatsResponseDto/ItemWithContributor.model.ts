import { DateAndIdItemStore } from "./DateAndIdItemStore.model";
import { FullContributorModel } from "../Contributor";

export interface ItemWithContributor extends DateAndIdItemStore {
    contributor: FullContributorModel;
}

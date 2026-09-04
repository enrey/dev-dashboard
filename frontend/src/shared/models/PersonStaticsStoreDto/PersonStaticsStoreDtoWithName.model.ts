import { PersonStaticsStoreDto } from "./PersonStaticsStoreDto.model";
import { FullContributorModel } from "../Contributor";

export interface PersonStaticsStoreDtoWithName extends PersonStaticsStoreDto {
    contributor: FullContributorModel;
}

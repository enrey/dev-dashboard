import { ItemWithContributor } from "shared/models";

import { MrTypeEnum } from "./MrType.enum";

export interface MrInfoLayoutPropsModel {
    mrType: MrTypeEnum;
    mr: ItemWithContributor;
    onHover: boolean;
}

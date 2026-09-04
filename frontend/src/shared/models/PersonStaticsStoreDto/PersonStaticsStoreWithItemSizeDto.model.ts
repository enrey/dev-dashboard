import { ItemSizeModel } from "./ItemSizeModel.model";
import { PersonStaticsStoreDtoWithPresence } from "./PersonStaticsStoreDtoWithPresence.model";

export type PersonStaticsStoreWithItemSizeDto = PersonStaticsStoreDtoWithPresence &
    ItemSizeModel;

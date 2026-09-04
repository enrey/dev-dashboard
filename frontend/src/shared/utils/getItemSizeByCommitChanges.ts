import { ITEM_SIZE_VALUES } from "shared/constants";
import { ITEMS_SIZE_IN_WORD } from "shared/enums";

export const getItemSizeByCommitChanges = (total: number) => {
    if (total > ITEM_SIZE_VALUES.S && total < ITEM_SIZE_VALUES.L)
        return ITEMS_SIZE_IN_WORD.M;

    if (total > ITEM_SIZE_VALUES.L) return ITEMS_SIZE_IN_WORD.L;

    if (total > ITEM_SIZE_VALUES.XL) return ITEMS_SIZE_IN_WORD.XL;

    return ITEMS_SIZE_IN_WORD.S;
};

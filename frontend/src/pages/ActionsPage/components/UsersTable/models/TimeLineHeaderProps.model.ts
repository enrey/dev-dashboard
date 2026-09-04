import { ColumnProps } from "./ColumnProps.model";
import { TableSort } from "./TableSort.model";

export interface TimeLineHeaderProps extends ColumnProps, TableSort {
    cellIndex: number;
    isSticky?: boolean;
}

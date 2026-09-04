import { TableSort } from "./TableSort.model";
import { ColumnProps } from "./ColumnProps.model";

export interface EnhancedTableProps extends TableSort {
    rowCount: number;
    columns: ColumnProps[];
}

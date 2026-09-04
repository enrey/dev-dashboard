export interface TableCellForDateProps {
    isDayWeekend: boolean;
    children?: JSX.Element | JSX.Element[];
    setOnHover: (hover: boolean) => void;
}

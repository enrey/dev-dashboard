import { ReactNode } from "react";

export interface ShowTaskProps {
    children?: ReactNode;
    onHover: boolean;
    label: ReactNode;
    onRight?: boolean;
}

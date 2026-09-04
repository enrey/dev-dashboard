import { PropsWithChildren } from "react";

import { TaskType } from "shared/enums";

export interface TypeTaskBarProps {
    type: TaskType;
}
export interface ContainerTypeBarProps extends TypeTaskBarProps {
    children: PropsWithChildren<any>;
}

import { SourceTypes } from "shared/enums";

export interface TimeLineItemProps {
    title: string;
    url?: string;
    variant?: string;
    createdAt?: string;
    sourceType: SourceTypes;
}

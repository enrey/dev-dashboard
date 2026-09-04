import { TimeLineItemVariant } from "./index";
export interface TimeLineItem {
    title: string;
    url?: string;
    variant?: TimeLineItemVariant;
    createdAt?: string;
}

import { ConfluenceChangeTypeEnum } from "../enums";

export interface ConfluenceInfo {
    date: string;
    objectId: number;
    version: number;
    pageTitle: string;
    changer: string;
    changerFio: string;
    changeType: ConfluenceChangeTypeEnum;
    added: number;
    deleted: number;
    churn: number;
    url: string;
    pageId?: number; // Добавляем опциональное поле pageId если оно приходит с бэкенда
}

export interface ConfluenceInfoResponse {
    items: ConfluenceInfo[];
    dtStorageMax: string;
}

import { ProjectInformationModel } from "../../../../../models";

export interface ProjectInfoProps extends ProjectInformationModel {
    // Adding a component-specific property to avoid ESLint no-empty-object-type error
    additionalInfo?: string;
}

import { FC } from "react";

import { AllProjectInfoProps } from "./models";
import { ProjectButton } from "../ProjectButton";
import { ProjectButtonTitle } from "../ProjectButtonTitle";

export const AllProjectInfo: FC<AllProjectInfoProps> = ({ allFilterStats }) => {
    const { quantityOfTasks, quantityOfBugs, quantityOfUnidentified } = allFilterStats;
    const titleTooltip = `Всего задач: ${quantityOfTasks + quantityOfBugs + quantityOfUnidentified}.
     Тасок: ${quantityOfTasks}. Багов: ${quantityOfBugs}. Неопознанных: ${quantityOfUnidentified}.`;
    return (
        <ProjectButton projectName={""}>
            <ProjectButtonTitle
                title={"Все"}
                titleTooltip={titleTooltip}
                allTaskCount={quantityOfTasks}
                undefinedTaskCount={quantityOfUnidentified}
                bugTaskCount={quantityOfBugs}
            />
        </ProjectButton>
    );
};

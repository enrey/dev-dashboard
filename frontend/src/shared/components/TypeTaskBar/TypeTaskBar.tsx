import React from "react";

import { Box, Tooltip } from "@mui/material";

import BugIcon from "assets/bug_type_task_icon.svg";
import DefectIcon from "assets/defect_type_task_icon.svg";
import EpicIcon from "assets/epic_type_task_icon.svg";
import FeatureIcon from "assets/feature_type_task_icon.svg";
import Ghost from "assets/ghost.png";
import ImprovementIcon from "assets/improvement_type_task_icon.svg";
import SubtaskIcon from "assets/subtask_type_task_icon.svg";
import { TaskType } from "shared/enums";

import { ContainerTypeBarProps, TypeTaskBarProps } from ".";

export const ContainerTypeBar: React.FC<ContainerTypeBarProps> = ({ type, children }) => (
    <Tooltip title={type}>
        <Box sx={{ height: "16px" }} component="div">
            {children}
        </Box>
    </Tooltip>
);

const typeTaskBarListLayout = new Map([
    [
        TaskType.Bug,
        <ContainerTypeBar type={TaskType.Bug}>
            <img src={BugIcon} alt="баг" />
        </ContainerTypeBar>,
    ],
    [
        TaskType.Defect,
        <ContainerTypeBar type={TaskType.Defect}>
            <img src={DefectIcon} alt="ошибка" />
        </ContainerTypeBar>,
    ],
    [
        TaskType.Epic,
        <ContainerTypeBar type={TaskType.Epic}>
            <img src={EpicIcon} alt="эпик" />
        </ContainerTypeBar>,
    ],
    [
        TaskType.NewFeature,
        <ContainerTypeBar type={TaskType.NewFeature}>
            <img src={FeatureIcon} alt="задача" />
        </ContainerTypeBar>,
    ],
    [
        TaskType.Subtask,
        <ContainerTypeBar type={TaskType.Subtask}>
            <img src={SubtaskIcon} alt="подзадача" />
        </ContainerTypeBar>,
    ],
    [
        TaskType.Improvement,
        <ContainerTypeBar type={TaskType.Improvement}>
            <img src={ImprovementIcon} alt="улучшение" />
        </ContainerTypeBar>,
    ],
    [
        TaskType.Empty,
        <ContainerTypeBar type={TaskType.Empty}>
            <img style={{ width: "16px" }} src={Ghost} alt="Неопознанно" />
        </ContainerTypeBar>,
    ],
]);

export const TypeTaskBar = ({ type }: TypeTaskBarProps) => {
    const typeBar = typeTaskBarListLayout.get(type);

    return typeBar || <></>;
};

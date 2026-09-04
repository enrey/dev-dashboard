import { FC } from "react";

import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

import { LoadingStatus } from "shared/enums";

export interface LoadingIconProps {
    status: LoadingStatus;
    isLoadSuccessful?: boolean;
}

export const LoadingIcon: FC<LoadingIconProps> = ({ status, isLoadSuccessful }) => {
    if (status === LoadingStatus.error || isLoadSuccessful === false) {
        return <ErrorOutlinedIcon color="error" />;
    }

    if (status === LoadingStatus.done || isLoadSuccessful) {
        return <DownloadDoneIcon color="primary" />;
    }

    if (status === LoadingStatus.inProgress) {
        return <HourglassEmptyIcon color="secondary" className="rotate-icon" />;
    }

    return null;
};

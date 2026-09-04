import { ListItemText } from "@mui/material";
import { format, intervalToDuration } from "date-fns";

import { LastUpdateTimeLayoutProps } from "./LastUpdateTimeLayoutProps";

export const LastUpdateTimeLayout: React.FC<LastUpdateTimeLayoutProps> = ({
    loadedResource,
    source,
    withoutDateUpdateBlock,
}) => {
    if (withoutDateUpdateBlock) {
        return null;
    }

    const differenceBetweenTwoDays =
        loadedResource?.lastUpdate &&
        intervalToDuration({
            start: new Date(loadedResource?.lastUpdate),
            end: new Date(),
        }).days;

    const lastUpdateDateAsString =
        loadedResource && loadedResource?.lastUpdate.toString();

    /** Переменная для корректного отображения данных.
     *  Если сурс гита грузится с ошибкой, то в попапе
     *  индификации загрузки данных нарушается визуальный
     *  порядок отображения. И чтобы его починить, была
     *  заведена эта переменная */
    const isGitResourceDownloadedWithError =
        source === "Gitlab Users" && !!loadedResource;

    const formatedDate =
        lastUpdateDateAsString &&
        `${format(
            new Date(loadedResource?.lastUpdate),
            "dd.MM.yyyy"
        )} - ${lastUpdateDateAsString.slice(
            lastUpdateDateAsString.indexOf("T") + 1,
            lastUpdateDateAsString.indexOf("T") + 6
        )}`;

    const isMoreThanOneDaySinceLastUpdate =
        differenceBetweenTwoDays && differenceBetweenTwoDays >= 1;
    return (
        <ListItemText
            primaryTypographyProps={{
                style: {
                    fontSize: "12px",
                    paddingLeft: 0,
                    color: isMoreThanOneDaySinceLastUpdate ? "red" : "inherit",
                    visibility: isGitResourceDownloadedWithError ? "hidden" : "initial",
                },
            }}
            style={{ marginTop: 0 }}
        >
            {loadedResource?.lastUpdate && `Дата запроса данных: ${formatedDate}`}
        </ListItemText>
    );
};

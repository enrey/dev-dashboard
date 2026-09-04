import { FC } from "react";

import { Box, Link, Tooltip } from "@mui/material";

import { ShowTask } from "shared/components";
import { ColorsBySourceType, TaskChangeType } from "shared/enums";

import styles from "./JiraHistoryItem.module.scss";
import { JiraHistoryItemProps } from "./models";
import { useUsersData } from "../../../../../../contexts/data";

export const JiraHistoryItem: FC<JiraHistoryItemProps> = ({
    changerEmail,
    statusTo = null,
    changeType,
    selfColor,
    onHover,
    issueUrl,
    issueNumber,
    statuses,
    descriptionChangesCount,
}) => {
    const { users } = useUsersData();

    // Формируем лейбл для ShowTask
    let label = "";
    if (changeType === TaskChangeType.Description) {
        label = descriptionChangesCount
            ? `${issueNumber}: Изменений описания (${descriptionChangesCount})`
            : `${issueNumber}: Изменение описания`;
    } else {
        // Для статусов показываем все статусы или последний статус
        if (statuses && statuses.length > 0) {
            const statusText = statuses.length === 1 ? statuses[0] : `${statuses[0]} → ${statuses[statuses.length - 1]}`;
            label = `${issueNumber}: ${statusText}`;
        } else {
            label = issueNumber ? `${issueNumber}: ${statusTo || ""}` : statusTo || "";
        }
    }

    // Формируем title для tooltip
    let title = "";
    if (changeType === TaskChangeType.Description) {
        if (descriptionChangesCount && descriptionChangesCount > 1) {
            title = `Изменений описания: ${descriptionChangesCount}`;
        } else {
            title = "Изменение описания";
        }
    } else {
        if (statuses && statuses.length > 1) {
            title = `Изменения статуса: ${statuses.join(" → ")}`;
        } else {
            title = `Изменение статуса → ${statusTo}`;
        }
    }

    const changer = users.find((u) => u.email === changerEmail)?.name || changerEmail;
    const color = selfColor || ColorsBySourceType.issue;
    return (
        <Link
            sx={{ textDecoration: "none" }}
            target="_blank"
            rel="noopener"
            href={issueUrl}
        >
            <ShowTask label={label} onHover={onHover} onRight={true}>
                <Tooltip
                    title={
                        <>
                            {issueNumber && <p style={{ marginTop: 0, marginBottom: 4, fontWeight: 'bold' }}>Задача: {issueNumber}</p>}
                            <p style={{ marginTop: 0, marginBottom: 0 }}>{changer}:</p>
                            <span>{title}</span>
                        </>
                    }
                >
                    <Box
                        style={{
                            backgroundColor: color,
                            borderColor: color,
                        }}
                        className={styles.jiraHistoryItem}
                        sx={{
                            zIndex: 1100,
                            position: "relative",
                        }}
                    />
                </Tooltip>
            </ShowTask>
        </Link>
    );
};

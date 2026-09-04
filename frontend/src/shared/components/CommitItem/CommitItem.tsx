import { Box, Link, Tooltip } from "@mui/material";

import { CommitItemProps } from "./CommitItemProps";
import { ShowTask } from "../ShowTask";

export const CommitItem = ({ commit, onHover }: CommitItemProps) => {
    const hrefToCommit = `${commit.webUI}/-/commit/${commit.sha}`;
    return (
        <Link
            key={`${commit.sha}_${commit.email}`}
            sx={{ textDecoration: "none" }}
            target="_blank"
            rel="noopener"
            href={hrefToCommit}
        >
            <Tooltip
                title={
                    <>
                        <p style={{ marginTop: 0, fontWeight: "bold" }}>{commit.name}:</p>
                        <p style={{ margin: "4px 0" }}>{commit.message}</p>
                        <p style={{ marginBottom: 0, fontSize: "12px", color: "#ccc" }}>
                            Строк кода: {commit.total} | Файлов: {commit.changedFilesCount}
                        </p>
                    </>
                }
                arrow
            >
                <Box
                    className={`item-size__${commit.itemSize} scaleUp`}
                    sx={{
                        backgroundColor: commit.contributor.selfColor
                            ? commit.contributor.selfColor
                            : "rgb(255, 193, 7)",
                        borderRadius: "50%",
                        display: "flex",
                        mb: "1px",
                        position: "relative",
                        zIndex: 1100,
                    }}
                >
                    <ShowTask onHover={onHover} label={commit.message} />
                </Box>
            </Tooltip>
        </Link>
    );
};

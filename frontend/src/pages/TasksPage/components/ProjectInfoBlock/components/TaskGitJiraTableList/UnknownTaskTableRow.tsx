import { memo } from "react";

import { Link, TableCell, TableRow, Tooltip } from "@mui/material";

import { ExpandableTextForArrayText } from "shared/components";

import { UnknownTaskTableRowProps } from "./models";
import { contributorsLayout } from "./utils/contributorsLayout.utils";
import { DateCellInfography } from "./DateCellInfography";
import { TaskTableEntityEnum } from "./models";

export const UnknownTaskTableRow = memo(
    ({ periodBetweenStarAndEndDaysList, unknownTask }: UnknownTaskTableRowProps) => {
        const contributorsPartLayout = contributorsLayout(unknownTask.contributors);
        return (
            <TableRow>
                <TableCell />
                <TableCell sx={{ padding: "10px", textAlign: "center" }}>—</TableCell>
                <TableCell />
                <TableCell sx={{ padding: "10px" }}>
                    <ExpandableTextForArrayText textArray={unknownTask.titles} />
                </TableCell>

                <TableCell
                    sx={{
                        maxWidth: "40px",
                        minWidth: "40px",
                        width: "40px",
                        overflow: "hidden",
                        whiteSpace: "pre",
                    }}
                >
                    <Tooltip title={unknownTask.repositoryName} placement="top">
                        <Link
                            sx={{
                                textDecoration: "none",
                            }}
                            target="_blank"
                            rel="noopener"
                            href={unknownTask.webUI}
                        >
                            {unknownTask.repositoryName}
                        </Link>
                    </Tooltip>
                </TableCell>

                <TableCell sx={{ overflow: "hidden", padding: "10px" }}>
                    {contributorsPartLayout}
                </TableCell>
                <DateCellInfography
                    periodBetweenStarAndEndDaysList={periodBetweenStarAndEndDaysList}
                    task={unknownTask}
                    entity={TaskTableEntityEnum.UNKNOWN}
                />
            </TableRow>
        );
    }
);

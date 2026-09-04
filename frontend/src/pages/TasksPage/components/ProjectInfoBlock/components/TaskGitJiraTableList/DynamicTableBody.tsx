import { FC, ReactElement, useEffect, useRef, useState } from "react";

import { Box, LinearProgress, TableBody, TableFooter, TableRow } from "@mui/material";

import { MAX_SHOWING_TASK } from "shared/constants";

import style from "./DynamicTableBody.module.scss";
import { DynamicTableBodyProps } from "./models";

export const DynamicTableBody: FC<DynamicTableBodyProps> = ({ tableBody }) => {
    const [rows, setRows] = useState<ReactElement[]>([]);
    const [hiddenRows, setHiddenRows] = useState<ReactElement[]>([]);
    const [lastChild, setLastChild] = useState<Element | null | undefined>(null);

    const observerCallback = (
        [entry]: Array<IntersectionObserverEntry>,
        observer: IntersectionObserver
    ) => {
        if (entry.isIntersecting) {
            observer.unobserve(lastChild!);
            setRows((prevState) => {
                return [...prevState, ...hiddenRows.slice(0, MAX_SHOWING_TASK)];
            });
            setHiddenRows((prevState) =>
                prevState.slice(MAX_SHOWING_TASK, prevState.length)
            );
        }
    };

    useEffect(() => {
        setRows(tableBody.slice(0, MAX_SHOWING_TASK));
        setHiddenRows(tableBody.slice(MAX_SHOWING_TASK, tableBody.length));
    }, [tableBody]);

    const ref = useRef<HTMLTableSectionElement | null>(null);

    useEffect(() => {
        const lastElementChild = ref.current?.lastElementChild;
        setLastChild(lastElementChild);
        const observer = new IntersectionObserver(observerCallback);
        if (lastElementChild) {
            if (rows.length !== tableBody.length) {
                observer.observe(lastElementChild);
            } else {
                observer.unobserve(lastElementChild);
            }
        }
        return () => {
            if (lastElementChild) {
                observer.unobserve(lastElementChild);
            }
        };
    }, [ref, rows]);

    return (
        <>
            <TableBody ref={ref}>{rows}</TableBody>
            {rows.length !== tableBody.length && (
                <TableFooter sx={{ position: "relative", height: "30px" }}>
                    <TableRow>
                        <Box component={"td"} className={style.tableBodyLoading}>
                            <LinearProgress
                                variant={"indeterminate"}
                                value={100}
                                color="secondary"
                                sx={{ width: 300 }}
                            />
                        </Box>
                    </TableRow>
                </TableFooter>
            )}
        </>
    );
};

import { cloneElement, FC, ReactElement, useRef } from "react";

import { ScrollByGrabbingProps } from "./ScrollByGrabbingProps";

export const ScrollByGrabbing: FC<ScrollByGrabbingProps> = ({ children }) => {
    const childRef = useRef<HTMLElement>(null);
    const pos = useRef({ top: 0, left: 0, x: 0, y: 0 });

    const mouseDownHandler = function (e: MouseEvent) {
        if (!childRef.current) return;

        pos.current = {
            left: childRef.current.scrollLeft,
            top: childRef.current.scrollTop,
            x: e.clientX,
            y: e.clientY,
        };

        childRef.current.addEventListener("mousemove", mouseMoveHandler);
        childRef.current.addEventListener("mouseup", mouseUpHandler);
    };

    const mouseMoveHandler = function (e: MouseEvent) {
        if (!childRef.current) return;

        const dx = e.clientX - pos.current.x;
        const dy = e.clientY - pos.current.y;

        childRef.current.scrollTop = pos.current.top - dy;
        childRef.current.scrollLeft = pos.current.left - dx;
    };

    const mouseUpHandler = function () {
        if (!childRef.current) return;

        childRef.current.removeEventListener("mousedown", mouseDownHandler);
        childRef.current.removeEventListener("mousemove", mouseMoveHandler);
        childRef.current.removeEventListener("mouseup", mouseUpHandler);
    };

    return (
        <div style={{ cursor: "grab", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {children &&
                cloneElement(children as ReactElement, {
                    ref: childRef,
                    onMouseDown: mouseDownHandler,
                    onMouseLeave: mouseUpHandler,
                })}
        </div>
    );
};

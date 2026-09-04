import { forwardRef } from "react";

import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
} from "react-router-dom";

export const MuiRouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
    function MuiRouterLink(itemProps, ref) {
        return <RouterLink ref={ref} {...itemProps} />;
    }
);




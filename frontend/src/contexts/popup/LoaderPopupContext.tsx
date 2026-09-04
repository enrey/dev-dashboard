import { createContext, FC, useCallback, useState } from "react";

import { PropsWithChildren } from "react";

interface LoaderPopupContextValue {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
}

export const LoaderPopupContext = createContext<LoaderPopupContextValue>({
    isOpen: false,
    setOpen: () => {},
});

export const LoaderPopupContextProvider: FC<{ children: PropsWithChildren<any> }> = ({
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

    return (
        <LoaderPopupContext.Provider value={{ isOpen, setOpen }}>
            {children}
        </LoaderPopupContext.Provider>
    );
};

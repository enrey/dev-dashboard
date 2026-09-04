import React from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import "./index.scss";
import { DataContextProvider } from "./contexts/data";
import { FilterContextProvider } from "./contexts/filter";
import { LoaderPopupContextProvider } from "./contexts/popup";
import { queryClient } from "./lib/queryClient";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const startApp = async () => {
    if (import.meta.env.VITE_DEMO === "true") {
        const { worker } = await import("./mocks/browser");
        await worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: {
                url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
            },
        });
    }

    root.render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <FilterContextProvider>
                    <DataContextProvider>
                        <LoaderPopupContextProvider>
                            <App />
                        </LoaderPopupContextProvider>
                    </DataContextProvider>
                </FilterContextProvider>
            </QueryClientProvider>
        </React.StrictMode>
    );
};

void startApp();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import { FC, memo } from "react";

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { Location } from "react-router-dom";

import { ActionsPage, SummaryPage, TasksPage, UsersPage, WorklogModal, WorklogPage } from "pages";
import { ROUTES } from "shared/constants";

export const Routing: FC = memo(() => {
    const location = useLocation();
    const state = location.state as { backgroundLocation?: Location };
    const backgroundLocation = state?.backgroundLocation;

    return (
        <>
            <Routes location={backgroundLocation ?? location}>
                <Route path={ROUTES.SUMMARY} element={<SummaryPage />} />
                <Route path={ROUTES.ACTIONS} element={<ActionsPage />} />
                <Route path={ROUTES.STATS_WORKFLOW} element={<TasksPage />} />
                <Route path={ROUTES.USERS} element={<UsersPage />} />
                <Route path={`${ROUTES.WORKLOG}/:mail`} element={<WorklogPage />} />

                <Route path="*" element={<Navigate to={ROUTES.SUMMARY} />} />
            </Routes>

            {backgroundLocation && (
                <Routes>
                    <Route path={`${ROUTES.WORKLOG}/:mail`} element={<WorklogModal />} />
                </Routes>
            )}
        </>
    );
});

import React from "react";

import { Container } from "@mui/material";

import { Filter } from "shared/components";

import styles from "./SummaryPage.module.scss";

import { CommitsPerDayWidget } from "./components/CommitsPerDayWidget";
import { MergeRequestsWidget } from "./components/MergeRequestsWidget";
import { TopConfluenceWidget } from "./components/TopConfluenceWidget";
import { TopJiraWidget } from "./components/TopJiraWidget";
import { TopMergeRequestsWidget } from "./components/TopMergeRequestsWidget";
import { TopMRUsersWidget } from "./components/TopMRUsersWidget";
import { TopRepositoriesWidget } from "./components/TopRepositoriesWidget";
import { TopReviewTimeWidget } from "./components/TopReviewTimeWidget";
import { TopUsersWidget } from "./components/TopUsersWidget";

export const SummaryPage: React.FC = () => {
    return (
        <Container className={styles.summaryPage} maxWidth={false} disableGutters>
            <Filter />
            <section className={styles.summaryGrid}>
                <TopRepositoriesWidget />
                <TopUsersWidget />
                <CommitsPerDayWidget />
                <TopMergeRequestsWidget />
                <TopReviewTimeWidget />
                <TopMRUsersWidget />
                <MergeRequestsWidget />
                <TopJiraWidget />
                <TopConfluenceWidget />
            </section>
        </Container>
    );
};

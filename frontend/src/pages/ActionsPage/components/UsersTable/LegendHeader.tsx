import { Box } from "@mui/material";
import { ColorsBySourceType } from "shared/enums/ColorsBySourceType.enum";

import styles from "./LegendHeader.module.scss";

export const LegendHeader = () => (
    <Box className={styles.legend}>
        <Box className={styles.legendItem}>
            <Box
                className={styles.legendSquare}
                sx={{ bgcolor: ColorsBySourceType.issue }}
            />
            Issues
        </Box>
        <Box className={styles.legendItem}>
            <Box
                className={styles.legendDot}
                sx={{ bgcolor: ColorsBySourceType.commit }}
            />
            Commits
        </Box>
        <Box className={styles.legendItem}>
            <Box
                className={styles.legendSquare}
                sx={{ bgcolor: ColorsBySourceType.mrOpened }}
            />
            MR opened
        </Box>
        <Box className={styles.legendItem}>
            <Box
                className={styles.legendOutline}
                sx={{ borderColor: ColorsBySourceType.mrClosed }}
            />
            MR closed
        </Box>
        <Box className={styles.legendItem}>
            <Box
                className={styles.legendTriangle}
                sx={{ borderBottomColor: ColorsBySourceType.comment }}
            />
            Comments
        </Box>
        <Box className={styles.legendItem}>
            <Box className={`${styles.legendConfluence} ${styles.confluence}`} />
            Confluence
        </Box>
    </Box>
);

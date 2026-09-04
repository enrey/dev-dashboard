import { FC, useContext } from "react";

import { Box, Checkbox } from "@mui/material";
import { ChartTypeEnum } from "shared/enums/ChartTypeEnum";
import { ColorsBySourceType } from "shared/enums/ColorsBySourceType.enum";

import styles from "./LegendFilter.module.scss";
import { FilterContext } from "../../../../../contexts/filter";


export const LegendFilter: FC = () => {
    const { chartTypes, setChartTypes } = useContext(FilterContext);

    const handleToggle = (type: ChartTypeEnum) => {
        if (chartTypes.includes(type)) {
            setChartTypes(chartTypes.filter((t) => t !== type));
        } else {
            setChartTypes([...chartTypes, type]);
        }
    };

    return (
        <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" gap={1} alignItems="center" sx={{ fontSize: "12px" }}>
                <Box display="flex" alignItems="center" gap={0.2}>
                    <Checkbox
                        size="small"
                        checked={chartTypes.includes(ChartTypeEnum.ISSUES)}
                        onChange={() => handleToggle(ChartTypeEnum.ISSUES)}
                        sx={{ padding: "0 2px", "& .MuiSvgIcon-root": { fontSize: 16 } }}
                    />
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            transform: "rotate(-45deg)",
                            bgcolor: ColorsBySourceType.issue,
                        }}
                    />
                    <Box sx={{ ml: 0.2 }}>Issues</Box>
                </Box>
                <Box display="flex" alignItems="center" gap={0.2}>
                    <Checkbox
                        size="small"
                        checked={chartTypes.includes(ChartTypeEnum.COMMITS)}
                        onChange={() => handleToggle(ChartTypeEnum.COMMITS)}
                        sx={{ padding: "0 2px", "& .MuiSvgIcon-root": { fontSize: 16 } }}
                    />
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            bgcolor: ColorsBySourceType.commit,
                        }}
                    />
                    <Box sx={{ ml: 0.2 }}>Commits</Box>
                </Box>
                <Box display="flex" alignItems="center" gap={0.2}>
                    <Checkbox
                        size="small"
                        checked={chartTypes.includes(ChartTypeEnum.MR_OPENED)}
                        onChange={() => handleToggle(ChartTypeEnum.MR_OPENED)}
                        sx={{ padding: "0 2px", "& .MuiSvgIcon-root": { fontSize: 16 } }}
                    />
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            bgcolor: ColorsBySourceType.mrOpened,
                        }}
                    />
                    <Box sx={{ ml: 0.2 }}>MR opened</Box>
                </Box>
            </Box>
            <Box display="flex" gap={1} alignItems="center" sx={{ fontSize: "12px" }}>
                <Box display="flex" alignItems="center" gap={0.2}>
                    <Checkbox
                        size="small"
                        checked={chartTypes.includes(ChartTypeEnum.MR_CLOSED)}
                        onChange={() => handleToggle(ChartTypeEnum.MR_CLOSED)}
                        sx={{ padding: "0 2px", "& .MuiSvgIcon-root": { fontSize: 16 } }}
                    />
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            border: `1px solid ${ColorsBySourceType.mrClosed}`,
                        }}
                    />
                    <Box sx={{ ml: 0.2 }}>MR closed</Box>
                </Box>
                <Box display="flex" alignItems="center" gap={0.2}>
                    <Checkbox
                        size="small"
                        checked={chartTypes.includes(ChartTypeEnum.COMMENTS)}
                        onChange={() => handleToggle(ChartTypeEnum.COMMENTS)}
                        sx={{ padding: "0 2px", "& .MuiSvgIcon-root": { fontSize: 16 } }}
                    />
                    <Box
                        sx={{
                            borderLeft: "3px solid transparent",
                            borderRight: "3px solid transparent",
                            borderBottom: `7px solid ${ColorsBySourceType.comment}`,
                        }}
                    />
                    <Box sx={{ ml: 0.2 }}>Comments</Box>
                </Box>
                <Box display="flex" alignItems="center" gap={0.2}>
                    <Checkbox
                        size="small"
                        checked={chartTypes.includes(ChartTypeEnum.CONFLUENCE)}
                        onChange={() => handleToggle(ChartTypeEnum.CONFLUENCE)}
                        sx={{ padding: "0 2px", "& .MuiSvgIcon-root": { fontSize: 16 } }}
                    />
                    <Box
                        sx={{
                            color: ColorsBySourceType.confluence,
                            fontSize: "11px",
                        }}
                        className={styles.confluence}
                    />
                    <Box sx={{ ml: 0.2 }}>Confluence</Box>
                </Box>
            </Box>
        </Box>
    );
};


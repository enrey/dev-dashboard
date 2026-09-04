import React, { useState, useEffect } from "react";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
    Box,
    Button,
    Popover,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { PickerValidDate } from "@mui/x-date-pickers/models";
import { format } from "date-fns";

import { RELATIVE_TIME_OPTIONS } from "./constants";
import { TimeRangePickerProps, RelativeTimeOption } from "./models";
import { calculateRelativeRange, createAbsoluteRange } from "./utils";

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({ value, onChange }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selectedTab, setSelectedTab] = useState<"relative" | "absolute">(
        value.isRelative ? "relative" : "absolute"
    );
    const [tempFromDate, setTempFromDate] = useState<Date>(value.from);
    const [tempToDate, setTempToDate] = useState<Date>(value.to);
    const [searchQuery, setSearchQuery] = useState("");

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSearchQuery("");
    };

    const handleRelativeOptionClick = (option: RelativeTimeOption) => {
        const newRange = calculateRelativeRange(option);
        onChange(newRange);
        handleClose();
    };

    const handleAbsoluteApply = () => {
        const newRange = createAbsoluteRange(tempFromDate, tempToDate);
        onChange(newRange);
        handleClose();
    };

    const getDisplayText = () => {
        if (value.isRelative) {
            return value.label;
        }
        return `${format(value.from, "dd.MM.yyyy")} - ${format(value.to, "dd.MM.yyyy")}`;
    };

    const filteredOptions = RELATIVE_TIME_OPTIONS.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (open) {
            setTempFromDate(value.from);
            setTempToDate(value.to);
            setSelectedTab(value.isRelative ? "relative" : "absolute");
        }
    }, [open, value]);

    return (
        <>
            <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={handleClick}
                startIcon={<AccessTimeIcon sx={{ fontSize: "18px" }} />}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: "20px", ml: "auto" }} />}
                sx={{
                    textTransform: "none",
                    minWidth: "250px",
                    maxWidth: "350px",
                    height: "40px",
                    justifyContent: "space-between",
                    bgcolor: "background.paper",
                    borderRadius: "8px",
                    borderColor: "divider",
                    color: "text.primary",
                    fontFamily: "var(--ds-font-family)",
                    px: 1.5,
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                    },
                    "& .MuiButton-startIcon": {
                        marginRight: "8px",
                        color: "text.secondary",
                    },
                    "& .MuiButton-endIcon": {
                        marginLeft: "auto",
                        color: "text.secondary",
                    },
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        textAlign: "left",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "inherit",
                        fontSize: "14px",
                        fontWeight: 400,
                    }}
                >
                    {getDisplayText()}
                </Box>
            </Button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                PaperProps={{
                    sx: {
                        minWidth: "500px",
                        maxWidth: "600px",
                        mt: 1,
                    },
                }}
            >
                <Box sx={{ display: "flex", height: "400px" }}>
                    {/* Левая панель - вкладки */}
                    <Box
                        sx={{
                            width: "140px",
                            borderRight: 1,
                            borderColor: "divider",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <List component="nav" disablePadding>
                            <ListItemButton
                                selected={selectedTab === "relative"}
                                onClick={() => setSelectedTab("relative")}
                                sx={{
                                    py: 1.5,
                                    "&.Mui-selected": {
                                        bgcolor: "action.selected",
                                        borderRight: 2,
                                        borderColor: "primary.main",
                                    },
                                }}
                            >
                                <ListItemText
                                    primary="Относительно"
                                    primaryTypographyProps={{
                                        fontSize: "14px",
                                        fontFamily: "var(--ds-font-family)",
                                        color: "text.secondary",
                                    }}
                                />
                            </ListItemButton>
                            <ListItemButton
                                selected={selectedTab === "absolute"}
                                onClick={() => setSelectedTab("absolute")}
                                sx={{
                                    py: 1.5,
                                    "&.Mui-selected": {
                                        bgcolor: "action.selected",
                                        borderRight: 2,
                                        borderColor: "primary.main",
                                    },
                                }}
                            >
                                <ListItemText
                                    primary="Абсолютно"
                                    primaryTypographyProps={{
                                        fontSize: "14px",
                                        fontFamily: "var(--ds-font-family)",
                                        color: "text.secondary",
                                    }}
                                />
                            </ListItemButton>
                        </List>
                    </Box>

                    {/* Правая панель - содержимое */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        {selectedTab === "relative" ? (
                            <>
                                <Box sx={{ p: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Поиск быстрых диапазонов"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </Box>
                                <Divider />
                                <List
                                    sx={{
                                        flex: 1,
                                        overflow: "auto",
                                        py: 0,
                                    }}
                                >
                                    {filteredOptions.map((option) => {
                                        const isSelected =
                                            value.isRelative &&
                                            value.label === option.label;
                                        return (
                                            <ListItemButton
                                                key={option.value}
                                                selected={isSelected}
                                                onClick={() =>
                                                    handleRelativeOptionClick(option)
                                                }
                                                sx={{
                                                    py: 1,
                                                    px: 2,
                                                    "&:hover": {
                                                        bgcolor: "action.hover",
                                                    },
                                                    "&.Mui-selected": {
                                                        bgcolor: "action.selected",
                                                        "&:hover": {
                                                            bgcolor: "action.selected",
                                                        },
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={option.label}
                                                    primaryTypographyProps={{
                                                        fontSize: "14px",
                                                        fontWeight: isSelected
                                                            ? 600
                                                            : 400,
                                                        fontFamily:
                                                            "var(--ds-font-family)",
                                                        color: "text.primary",
                                                    }}
                                                />
                                            </ListItemButton>
                                        );
                                    })}
                                    {filteredOptions.length === 0 && (
                                        <Box
                                            sx={{
                                                p: 2,
                                                textAlign: "center",
                                                color: "text.secondary",
                                            }}
                                        >
                                            Ничего не найдено
                                        </Box>
                                    )}
                                </List>
                            </>
                        ) : (
                            <Box
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Box
                                        sx={{
                                            mb: 1,
                                            fontSize: "12px",
                                            color: "text.secondary",
                                        }}
                                    >
                                        Диапазон времени
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                        }}
                                    >
                                        <Box>
                                            <Box
                                                sx={{
                                                    mb: 0.5,
                                                    fontSize: "12px",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                От
                                            </Box>
                                            <DatePicker
                                                value={tempFromDate as PickerValidDate}
                                                onChange={(value: Date | null) => {
                                                    if (value) {
                                                        setTempFromDate(value);
                                                    }
                                                }}
                                                format="dd.MM.yyyy"
                                                slotProps={{
                                                    textField: {
                                                        size: "small",
                                                        fullWidth: true,
                                                    },
                                                }}
                                                maxDate={tempToDate as PickerValidDate}
                                            />
                                        </Box>
                                        <Box>
                                            <Box
                                                sx={{
                                                    mb: 0.5,
                                                    fontSize: "12px",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                До
                                            </Box>
                                            <DatePicker
                                                value={tempToDate as PickerValidDate}
                                                onChange={(value: Date | null) => {
                                                    if (value) {
                                                        setTempToDate(value);
                                                    }
                                                }}
                                                format="dd.MM.yyyy"
                                                slotProps={{
                                                    textField: {
                                                        size: "small",
                                                        fullWidth: true,
                                                    },
                                                }}
                                                minDate={tempFromDate as PickerValidDate}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 1,
                                        mt: 2,
                                    }}
                                >
                                    <Button size="small" onClick={handleClose}>
                                        Отмена
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleAbsoluteApply}
                                    >
                                        Применить временной диапазон
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Popover>
        </>
    );
};

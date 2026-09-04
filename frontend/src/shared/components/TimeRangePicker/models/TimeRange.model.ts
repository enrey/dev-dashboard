export interface TimeRange {
    from: Date;
    to: Date;
    label: string;
    isRelative: boolean;
}

export interface RelativeTimeOption {
    label: string;
    value: string;
    days?: number;
    months?: number;
}

export interface TimeRangePickerProps {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
}



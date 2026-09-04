import { FC, useState, useEffect, CSSProperties } from "react";

interface TimerProps {
    seconds: number;
    onFinish: () => void;
    style?: CSSProperties;
    className?: string;
}

export const Timer: FC<TimerProps> = (props) => {
    const { seconds, onFinish, style, className } = props;

    const [time, setTime] = useState(seconds);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime((prevTime) => {
                const updatedTime = prevTime - 1;

                if (updatedTime === 0) {
                    onFinish();
                    clearInterval(interval);
                }

                return updatedTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <span style={style} className={className}>
            {time}
        </span>
    );
};

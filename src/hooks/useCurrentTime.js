import { useState, useEffect } from 'react';

/**
 * Custom hook that provides highly accurate, reactive 1-second interval time data.
 * @returns {{ now: Date, hours: number, minutes: number, seconds: number }}
 */
export function useCurrentTime() {
    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        now: currentTime,
        hours: currentTime.getHours(),
        minutes: currentTime.getMinutes(),
        seconds: currentTime.getSeconds(),
    };
}

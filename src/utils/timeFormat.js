/**
 * Formats milliseconds into a standard stopwatch display.
 * @param {number} ms - The total elapsed milliseconds.
 * @returns {{ m: string, s: string, ms: string }} The formatted time components.
 */
export const formatStopwatchTime = (ms) => {
    const minutes = Math.floor(ms / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const milliseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return { m: minutes, s: seconds, ms: milliseconds };
};

/**
 * Calculates the relative time difference and formats a display string.
 * @param {Date} now - The current local date time.
 * @param {string} targetTimezone - The target IANA timezone string.
 * @returns {{ text: string, className: string, visible: boolean }} The difference metadata.
 */
export const calculateTimezoneDifference = (now, targetTimezone) => {
    try {
        const targetDateStr = now.toLocaleString('en-US', { timeZone: targetTimezone });
        const targetDate = new Date(targetDateStr);
        const diffMinutes = Math.round((targetDate - now) / 60000);

        if (diffMinutes === 0) {
            return { text: 'Same time as local', className: 'same', visible: true };
        }

        const isAhead = diffMinutes > 0;
        const absDiff = Math.abs(diffMinutes);
        const diffH = Math.floor(absDiff / 60);
        const diffM = absDiff % 60;

        let diffText = "";
        if (diffH > 0) diffText += `${diffH}h `;
        if (diffM > 0) diffText += `${diffM}m `;
        diffText += isAhead ? "ahead" : "behind";

        return { text: diffText.trim(), className: isAhead ? 'ahead' : 'behind', visible: true };
    } catch {
        return { text: '', className: '', visible: false };
    }
};

/**
 * Calculates the celestial status string (Sun/Moon phase) based on decimal time.
 * @param {number} h - The current hours (0-23).
 * @param {number} m - The current minutes (0-59).
 * @param {number} s - The current seconds (0-59).
 * @returns {string} The formatted celestial status text.
 */
export const getCelestialStatus = (h, m, s) => {
    const decimalHours = h + (m / 60) + (s / 3600);
    const isDayTime = decimalHours >= 6 && decimalHours < 18;

    if (isDayTime) {
        const dayProgress = (decimalHours - 6) / 12;
        if (dayProgress < 0.2) return "🌅 Morning • Sun is rising";
        if (dayProgress > 0.8) return "🌇 Evening • Sun is setting";
        return "☀️ Daytime • Sun is shining";
    }

    let nightProgress;
    if (decimalHours >= 18) {
        nightProgress = (decimalHours - 18) / 12;
    } else {
        nightProgress = 0.5 + (decimalHours / 12);
    }

    if (nightProgress < 0.2) return "🌒 Evening • Moon is rising";
    if (nightProgress > 0.8) return "🌘 Early Morning • Moon is setting";
    return "🌔 Nighttime • Moon is shining";
};

/**
 * Formats full countdown timer seconds into HH:MM:SS object.
 * @param {number} totalSeconds - Total remaining seconds.
 * @returns {{ h: string, m: string, s: string }}
 */
export const formatTimerDisplay = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return { h, m, s };
};

/**
 * Formats focus session duration into MM:SS object.
 * @param {number} totalSeconds - Total remaining seconds.
 * @returns {{ m: string, s: string }}
 */
export const formatFocusDisplay = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return { m, s };
};


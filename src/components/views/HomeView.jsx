import { useState } from 'react';
import PropTypes from 'prop-types';
import SpaceFactWidget from '../SpaceFactWidget';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { getCelestialStatus } from '../../utils/timeFormat';

/**
 * Main Home View component displaying the active world clock.
 * @param {{ isActive: boolean }} props
 */
export default function HomeView({ isActive }) {
    const { location } = useGeolocation();
    const { now, hours, minutes, seconds } = useCurrentTime();
    const [is24Hour, setIs24Hour] = useState(false);

    const ampmDisplay = hours >= 12 ? 'PM' : 'AM';
    const displayHour = is24Hour ? hours : (hours % 12 || 12);

    const dateStr = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statusText = getCelestialStatus(hours, minutes, seconds);

    return (
        <div id="view-home" className={`view ${isActive ? 'active' : ''}`}>
            <div className="clock-panel main-clock">
                <div id="location">{location}</div>
                <div className="time-wrapper">
                    <span id="hours">{displayHour.toString().padStart(2, '0')}</span>
                    <span className="colon">:</span>
                    <span id="minutes">{minutes.toString().padStart(2, '0')}</span>
                    <span className="colon seconds-colon">:</span>
                    <span id="seconds">{seconds.toString().padStart(2, '0')}</span>
                    {!is24Hour && <span id="ampm">{ampmDisplay}</span>}
                </div>
                <div id="date">{dateStr}</div>
                <div className="status-message" id="celestial-status">{statusText}</div>

                <div className="format-toggle-container">
                    <span>12h</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={is24Hour}
                            onChange={() => setIs24Hour(!is24Hour)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                    <span style={{ color: is24Hour ? '#64ffda' : '#8da4d0', transition: 'color 0.3s' }}>24h</span>
                </div>
            </div>

            <SpaceFactWidget isActive={isActive} />
        </div>
    );
}

HomeView.propTypes = {
    isActive: PropTypes.bool.isRequired,
};

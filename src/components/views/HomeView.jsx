import { useState, useEffect } from 'react';
import SpaceFactWidget from '../SpaceFactWidget';

export default function HomeView({ isActive }) {
    const [timeData, setTimeData] = useState({
        location: 'Local Time',
        hours: '00',
        minutes: '00',
        seconds: '00',
        ampm: 'AM',
        date: 'Loading date...',
        status: 'Tracking...'
    });
    const [is24Hour, setIs24Hour] = useState(false);

    useEffect(() => {
        // Find location once
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state;
                        const country = data.address.country;
                        if (city && country) {
                            setTimeData(prev => ({ ...prev, location: `${city}, ${country}` }));
                        } else if (city || country) {
                            setTimeData(prev => ({ ...prev, location: city || country }));
                        }
                    }
                } catch (e) {
                    // Fallback to timeZone name
                    const tzFallback = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    if (tzFallback) {
                        const parts = tzFallback.split('/');
                        const city = parts[parts.length - 1].replace(/_/g, ' ');
                        const region = parts[0] ? parts[0].replace(/_/g, ' ') : '';
                        setTimeData(prev => ({ ...prev, location: `${city}${region && region !== city ? ', ' + region : ''}` }));
                    }
                }
            }, () => {
                const tzFallback = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (tzFallback) {
                    const parts = tzFallback.split('/');
                    const city = parts[parts.length - 1].replace(/_/g, ' ');
                    const region = parts[0] ? parts[0].replace(/_/g, ' ') : '';
                    setTimeData(prev => ({ ...prev, location: `${city}${region && region !== city ? ', ' + region : ''}` }));
                }
            });
        }

        const updateClock = () => {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            const s = now.getSeconds();
            const ampmDisplay = h >= 12 ? 'PM' : 'AM';

            let displayHour;
            if (is24Hour) {
                displayHour = h;
            } else {
                displayHour = h % 12 || 12;
            }

            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

            const decimalHours = h + (m / 60) + (s / 3600);
            const isDayTime = decimalHours >= 6 && decimalHours < 18;
            let statusText = "";

            if (isDayTime) {
                const dayProgress = (decimalHours - 6) / 12;
                if (dayProgress < 0.2) statusText = "🌅 Morning • Sun is rising";
                else if (dayProgress > 0.8) statusText = "🌇 Evening • Sun is setting";
                else statusText = "☀️ Daytime • Sun is shining";
            } else {
                let nightProgress;
                if (decimalHours >= 18) {
                    nightProgress = (decimalHours - 18) / 12;
                } else {
                    nightProgress = 0.5 + (decimalHours / 12);
                }
                if (nightProgress < 0.2) statusText = "🌒 Evening • Moon is rising";
                else if (nightProgress > 0.8) statusText = "🌘 Early Morning • Moon is setting";
                else statusText = "🌔 Nighttime • Moon is shining";
            }

            setTimeData(prev => ({
                ...prev,
                hours: displayHour.toString().padStart(2, '0'),
                minutes: m.toString().padStart(2, '0'),
                seconds: s.toString().padStart(2, '0'),
                ampm: ampmDisplay,
                date: now.toLocaleDateString(undefined, options),
                status: statusText
            }));
        };

        updateClock();
        const inter = setInterval(updateClock, 1000);
        return () => clearInterval(inter);
    }, [is24Hour]);

    return (
        <div id="view-home" className={`view ${isActive ? 'active' : ''}`}>
            <div className="clock-panel main-clock">
                <div id="location">{timeData.location}</div>
                <div className="time-wrapper">
                    <span id="hours">{timeData.hours}</span>
                    <span className="colon">:</span>
                    <span id="minutes">{timeData.minutes}</span>
                    <span className="colon seconds-colon">:</span>
                    <span id="seconds">{timeData.seconds}</span>
                    {!is24Hour && <span id="ampm">{timeData.ampm}</span>}
                </div>
                <div id="date">{timeData.date}</div>
                <div className="status-message" id="celestial-status">{timeData.status}</div>

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

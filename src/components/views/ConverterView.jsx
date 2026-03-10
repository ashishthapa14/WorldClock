import { useState, useEffect, useRef } from 'react';

export default function ConverterView({ isActive }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedTimezone, setSelectedTimezone] = useState('');

    const [displayTime, setDisplayTime] = useState('--:-- --');
    const [displayLocation, setDisplayLocation] = useState('Search for a city');
    const [diffInfo, setDiffInfo] = useState({ text: '', className: '', visible: false });

    // Handle live time updating for selected timezone
    useEffect(() => {
        if (!selectedTimezone) {
            setDisplayTime('--:-- --');
            setDiffInfo({ visible: false });
            return;
        }

        const updateConvertedTime = () => {
            try {
                const now = new Date();
                const options = {
                    timeZone: selectedTimezone,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                };
                const formatter = new Intl.DateTimeFormat('en-US', options);
                setDisplayTime(formatter.format(now));

                const targetDateStr = now.toLocaleString('en-US', { timeZone: selectedTimezone });
                const targetDate = new Date(targetDateStr);
                const diffMinutes = Math.round((targetDate - now) / 60000);

                if (diffMinutes === 0) {
                    setDiffInfo({ text: 'Same time as local', className: 'same', visible: true });
                } else {
                    const isAhead = diffMinutes > 0;
                    const absDiff = Math.abs(diffMinutes);
                    const diffH = Math.floor(absDiff / 60);
                    const diffM = absDiff % 60;

                    let diffText = "";
                    if (diffH > 0) diffText += `${diffH}h `;
                    if (diffM > 0) diffText += `${diffM}m `;
                    diffText += isAhead ? "ahead" : "behind";

                    setDiffInfo({ text: diffText.trim(), className: isAhead ? 'ahead' : 'behind', visible: true });
                }
            } catch (e) {
                setDisplayTime("Invalid Zone");
                setDiffInfo({ visible: false });
            }
        };

        updateConvertedTime();
        const inter = setInterval(updateConvertedTime, 1000);
        return () => clearInterval(inter);
    }, [selectedTimezone]);

    // Handle Search API debounce
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!query.trim()) {
                setSuggestions([]);
                setShowSuggestions(false);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setShowSuggestions(true);
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
                const data = await res.json();
                if (data.results) {
                    setSuggestions(data.results.filter(p => p.timezone));
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error("Search API failed:", err);
                setSuggestions([]);
            }
            setIsLoading(false);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (place) => {
        const details = [place.name];
        if (place.admin1 && place.admin1 !== place.name) details.push(place.admin1);
        if (place.country) details.push(place.country);

        setSelectedTimezone(place.timezone);
        setQuery(place.name);
        setDisplayLocation(details.join(', '));
        setShowSuggestions(false);
    };

    return (
        <div id="view-converter" className={`view ${isActive ? 'active' : ''}`}>
            <div className="clock-panel converter-panel">
                <div className="widget-header">
                    <svg viewBox="0 0 24 24" fill="none" className="widget-icon" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Time Converter</span>
                </div>
                <div className="converter-content">
                    <div className="search-container">
                        <input
                            id="timezone-search"
                            type="text"
                            placeholder="Search city or country..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => { if (query) setShowSuggestions(true); }}
                            autoComplete="off"
                        />
                        {showSuggestions && (
                            <ul className="suggestions-list" style={{ display: 'block' }}>
                                {isLoading && <li className="suggestion-item">Searching...</li>}
                                {!isLoading && suggestions.length === 0 && <li className="suggestion-item">No results found</li>}
                                {!isLoading && suggestions.map(place => (
                                    <li key={place.id} className="suggestion-item" onClick={() => handleSelect(place)}>
                                        {[place.name, place.admin1, place.country].filter(Boolean).join(', ')}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="converted-time">{displayTime}</div>
                    <div className="converted-location">{displayLocation}</div>
                    {diffInfo.visible && (
                        <div className={`time-difference ${diffInfo.className}`} style={{ display: 'inline-block' }}>
                            {diffInfo.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useCitySearch } from '../../hooks/useCitySearch';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { calculateTimezoneDifference } from '../../utils/timeFormat';

/**
 * Converter view for global timezone searches and comparisons.
 * @param {{ isActive: boolean }} props
 */
export default function ConverterView({ isActive }) {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedTimezone, setSelectedTimezone] = useState('');
    const [displayLocation, setDisplayLocation] = useState('Search for a city');

    const { suggestions, isLoading } = useCitySearch(query);
    const { now } = useCurrentTime();

    // Memoize the time formatting to prevent expensive Intl API calls every tick
    // if the selectedTimezone is invalid or missing, it will throw, which we catch.
    const displayTime = useMemo(() => {
        if (!selectedTimezone) return '--:-- --';
        try {
            const options = {
                timeZone: selectedTimezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            return new Intl.DateTimeFormat('en-US', options).format(now);
        } catch {
            return "Invalid Zone";
        }
    }, [now, selectedTimezone]);

    const diffInfo = useMemo(() => {
        if (!selectedTimezone || displayTime === "Invalid Zone") {
            return { text: '', className: '', visible: false };
        }
        return calculateTimezoneDifference(now, selectedTimezone);
    }, [now, selectedTimezone, displayTime]);

    const handleSelect = useCallback((place) => {
        const details = [place.name];
        if (place.admin1 && place.admin1 !== place.name) details.push(place.admin1);
        if (place.country) details.push(place.country);

        setSelectedTimezone(place.timezone);
        setQuery(place.name);
        setDisplayLocation(details.join(', '));
        setShowSuggestions(false);
    }, []);

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

ConverterView.propTypes = {
    isActive: PropTypes.bool.isRequired,
};

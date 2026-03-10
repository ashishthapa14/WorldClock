import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch and format the user's current geographical location.
 * Falls back to Intl TimeZone resolution if blocked or unavailable.
 * @returns {{ location: string }} The resolved location data.
 */
export function useGeolocation() {
    const [location, setLocation] = useState('Local Time');

    useEffect(() => {
        const getFallbackTimezone = () => {
            const tzFallback = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tzFallback) {
                const parts = tzFallback.split('/');
                const tzCity = parts[parts.length - 1]?.replace(/_/g, ' ');
                const tzRegion = parts[0]?.replace(/_/g, ' ');
                return `${tzCity}${tzRegion && tzRegion !== tzCity ? ', ' + tzRegion : ''}`;
            }
            return 'Local Time';
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude: lat, longitude: lon } = position.coords;
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        if (!response.ok) throw new Error('Geocoding failed');

                        const data = await response.json();
                        const addr = data?.address;

                        if (addr) {
                            const city = addr.city || addr.town || addr.village || addr.county || addr.state;
                            const country = addr.country;

                            if (city && country) {
                                setLocation(`${city}, ${country}`);
                                return;
                            } else if (city || country) {
                                setLocation(city || country);
                                return;
                            }
                        }
                        setLocation(getFallbackTimezone());
                    } catch (e) {
                        setLocation(getFallbackTimezone());
                    }
                },
                () => {
                    setLocation(getFallbackTimezone());
                }
            );
        } else {
            setLocation(getFallbackTimezone());
        }
    }, []);

    return { location };
}

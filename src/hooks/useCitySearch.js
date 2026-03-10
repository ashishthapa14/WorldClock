import { useState, useEffect } from 'react';

/**
 * Custom hook for debounce-searching the Open-Meteo API for Timezones.
 * @param {string} query - The search query term.
 * @returns {{ suggestions: Array, isLoading: boolean }} The search results.
 */
export function useCitySearch(query) {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!query?.trim()) {
                setSuggestions([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
                if (!res.ok) throw new Error("Search API failed");
                const data = await res.json();
                if (data.results) {
                    setSuggestions(data.results.filter(p => p.timezone));
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error("City search error:", err);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [query]);

    return { suggestions, isLoading };
}

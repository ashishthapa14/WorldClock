import { useState, useEffect } from 'react';

const spaceFacts = [
    "Venus is the only planet that rotates clockwise.",
    "A day on Venus is longer than a year on Venus.",
    "Jupiter's Great Red Spot is a storm that has been raging for over 300 years.",
    "Neutron stars can spin 600 times per second.",
    "There are more trees on Earth than stars in the Milky Way.",
    "Halley's Comet will next appear in the night sky in the year 2061.",
    "One million Earths could fit inside the Sun.",
    "The sunset on Mars appears blue.",
    "Saturn has 146 moons, the most of any planet in our solar system.",
    "The footprints on the Moon will be there for 100 million years.",
    "The Milky Way galaxy is hurtling through space at roughly 1.3 million miles per hour.",
    "A year on Mercury consists of only 88 Earth days."
];

export default function SpaceFactWidget({ isActive }) {
    const [factText, setFactText] = useState("Loading the universe...");
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const fetchFact = async () => {
            try {
                // Fetch a random astronomy picture of the day to use its title and first sentence as a fact
                const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=1');
                if (!res.ok) throw new Error('Network error');
                const data = await res.json();
                if (data && data.length > 0) {
                    const item = data[0];
                    let firstSentence = item.explanation.split('.')[0];
                    if (firstSentence) firstSentence += '.';
                    return `${item.title}: ${firstSentence}`;
                }
                throw new Error('No data');
            } catch (error) {
                // Fallback to local facts if network fails or rate limited
                return spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
            }
        };

        const updateFact = async () => {
            setOpacity(0);
            const newFact = await fetchFact();
            setTimeout(() => {
                setFactText(newFact);
                setOpacity(1);
            }, 500);
        };

        // Initial fetch
        updateFact();

        // Update every 15 seconds
        const interval = setInterval(updateFact, 15000);

        return () => clearInterval(interval);
    }, []);

    if (!isActive) return null;

    return (
        <div className="space-fact-widget">
            <div className="widget-header">
                <svg viewBox="0 0 24 24" fill="none" className="widget-icon" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Cosmic Fact</span>
            </div>
            <p id="space-fact-text" style={{ opacity, transition: 'opacity 0.5s ease' }}>{factText}</p>
        </div>
    );
}

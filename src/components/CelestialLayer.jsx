import { useState, useEffect } from 'react';

function getMoonPhase(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 3) {
        year--;
        month += 12;
    }

    month++;
    let jd = 365.25 * year + 30.6 * month + day - 694039.09;
    jd /= 29.5305882;
    let phase = jd - Math.floor(jd);

    if (phase < 0.03) return { name: "New Moon", icon: <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"></circle> };
    else if (phase < 0.22) return { name: "Waxing Crescent", icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path> };
    else if (phase < 0.28) return { name: "First Quarter", icon: <path d="M12 3a9 9 0 0 1 0 18z"></path> };
    else if (phase < 0.47) return { name: "Waxing Gibbous", icon: <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" fillOpacity="0.3"></path> };
    else if (phase < 0.53) return { name: "Full Moon", icon: <circle cx="12" cy="12" r="9" fill="currentColor"></circle> };
    else if (phase < 0.72) return { name: "Waning Gibbous", icon: <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" fillOpacity="0.3"></path> };
    else if (phase < 0.78) return { name: "Last Quarter", icon: <path d="M12 3a9 9 0 0 0 0 18z"></path> };
    else return { name: "Waning Crescent", icon: <path d="M3 11.21A9 9 0 1 0 12.79 21 7 7 0 0 1 3 11.21z"></path> };
}

export default function CelestialLayer() {
    const [celestialData, setCelestialData] = useState({
        isDayTime: true,
        sunStyles: { opacity: 0, top: '50%', left: '50%' },
        moonStyles: { opacity: 0, top: '50%', left: '50%' },
        moonPhase: { name: 'Moon', icon: null }
    });

    useEffect(() => {
        const updatePositions = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            const decimalHours = hours + (minutes / 60) + (seconds / 3600);
            const isDayTime = decimalHours >= 6 && decimalHours < 18;

            if (isDayTime) {
                const dayProgress = (decimalHours - 6) / 12;
                const xPos = 10 + (dayProgress * 80);
                const yPos = 80 - (Math.sin(dayProgress * Math.PI) * 60);

                setCelestialData(prev => ({
                    ...prev,
                    isDayTime: true,
                    sunStyles: { opacity: 1, left: `${xPos}%`, top: `${yPos}%` },
                    moonStyles: { opacity: 0, left: '50%', top: '50%' }
                }));
            } else {
                let nightProgress;
                if (decimalHours >= 18) {
                    nightProgress = (decimalHours - 18) / 12;
                } else {
                    nightProgress = 0.5 + (decimalHours / 12);
                }

                const xPos = 10 + (nightProgress * 80);
                const yPos = 80 - (Math.sin(nightProgress * Math.PI) * 60);

                setCelestialData({
                    isDayTime: false,
                    sunStyles: { opacity: 0, left: '50%', top: '50%' },
                    moonStyles: { opacity: 1, left: `${xPos}%`, top: `${yPos}%` },
                    moonPhase: getMoonPhase(now)
                });
            }
        };

        updatePositions();
        const inter = setInterval(updatePositions, 1000);
        return () => clearInterval(inter);
    }, []);

    return (
        <>
            <div id="sun" className="celestial-body sun" style={celestialData.sunStyles}>
                <div className="celestial-info">Our Sun</div>
                <svg viewBox="0 0 24 24" fill="none" className="icon" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            </div>
            <div id="moon" className="celestial-body moon" style={celestialData.moonStyles}>
                <div className="celestial-info">{celestialData.moonPhase.name}</div>
                <svg viewBox="0 0 24 24" fill="none" className="icon" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {celestialData.moonPhase.icon}
                </svg>
            </div>
        </>
    );
}

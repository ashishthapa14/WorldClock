import { useState, useEffect } from 'react';

export default function FocusView({ isActive }) {
    const defaultTime = 25 * 60;
    const [timeRemaining, setTimeRemaining] = useState(defaultTime);
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState('Ready to focus');

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        setStatus('Session Complete!');
                        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
                        audio.play().catch(() => { });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const toggleTimer = () => {
        if (isRunning) {
            setIsRunning(false);
            setStatus('Session paused');
        } else {
            if (timeRemaining === 0) setTimeRemaining(defaultTime);
            setIsRunning(true);
            setStatus('Focusing...');
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeRemaining(defaultTime);
        setStatus('Ready to focus');
    };

    const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const secs = (timeRemaining % 60).toString().padStart(2, '0');

    return (
        <div id="view-focus" className={`view ${isActive ? 'active' : ''}`}>
            <div className="clock-panel focus-panel">
                <div className="widget-header">
                    <svg viewBox="0 0 24 24" fill="none" className="widget-icon" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Focus Session</span>
                </div>
                <div className="focus-time-wrapper">
                    <span>{mins}</span><span className="colon">:</span><span>{secs}</span>
                </div>
                <div className="focus-controls">
                    <button onClick={toggleTimer} className="control-btn primary">
                        {isRunning ? 'Pause' : (timeRemaining < defaultTime && timeRemaining > 0 ? 'Resume' : 'Start')}
                    </button>
                    <button onClick={resetTimer} className="control-btn secondary">Reset</button>
                </div>
                <div className="focus-status">{status}</div>
            </div>
        </div>
    );
}

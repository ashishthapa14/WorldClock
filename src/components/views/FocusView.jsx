import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { formatFocusDisplay } from '../../utils/timeFormat';

const DEFAULT_FOCUS_TIME = 25 * 60;

/**
 * Focus session view acting as a Pomodoro timer.
 * @param {{ isActive: boolean }} props
 */
export default function FocusView({ isActive }) {
    const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_TIME);
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

    const toggleTimer = useCallback(() => {
        if (isRunning) {
            setIsRunning(false);
            setStatus('Session paused');
        } else {
            if (timeRemaining === 0) setTimeRemaining(DEFAULT_FOCUS_TIME);
            setIsRunning(true);
            setStatus('Focusing...');
        }
    }, [isRunning, timeRemaining]);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeRemaining(DEFAULT_FOCUS_TIME);
        setStatus('Ready to focus');
    }, []);

    const { m, s } = formatFocusDisplay(timeRemaining);

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
                    <span>{m}</span><span className="colon">:</span><span>{s}</span>
                </div>
                <div className="focus-controls">
                    <button onClick={toggleTimer} className="control-btn primary">
                        {isRunning ? 'Pause' : (timeRemaining < DEFAULT_FOCUS_TIME && timeRemaining > 0 ? 'Resume' : 'Start')}
                    </button>
                    <button onClick={resetTimer} className="control-btn secondary">Reset</button>
                </div>
                <div className="focus-status">{status}</div>
            </div>
        </div>
    );
}

FocusView.propTypes = {
    isActive: PropTypes.bool.isRequired,
};

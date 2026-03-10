import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { formatTimerDisplay } from '../../utils/timeFormat';

/**
 * Customizable countdown timer view.
 * @param {{ isActive: boolean }} props
 */
export default function TimerView({ isActive }) {
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showInputs, setShowInputs] = useState(true);

    const [inputH, setInputH] = useState('');
    const [inputM, setInputM] = useState('');
    const [inputS, setInputS] = useState('');

    useEffect(() => {
        let interval;
        if (isRunning && totalSeconds > 0) {
            interval = setInterval(() => {
                setTotalSeconds(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        setShowInputs(true);
                        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
                        audio.play().catch(() => { });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, totalSeconds]);

    const handleStart = useCallback(() => {
        if (isRunning) {
            setIsRunning(false);
        } else {
            if (showInputs) {
                const h = parseInt(inputH) || 0;
                const m = parseInt(inputM) || 0;
                const s = parseInt(inputS) || 0;
                const total = (h * 3600) + (m * 60) + s;
                if (total <= 0) return;
                setTotalSeconds(total);
                setShowInputs(false);
            } else if (totalSeconds <= 0) {
                return;
            }
            setIsRunning(true);
        }
    }, [isRunning, showInputs, inputH, inputM, inputS, totalSeconds]);

    const handleReset = useCallback(() => {
        setIsRunning(false);
        setTotalSeconds(0);
        setShowInputs(true);
        setInputH('');
        setInputM('');
        setInputS('');
    }, []);

    const { h, m, s } = formatTimerDisplay(totalSeconds);

    return (
        <div id="view-timer" className={`view ${isActive ? 'active' : ''}`}>
            <div className="clock-panel timer-panel">
                <div className="widget-header">
                    <svg viewBox="0 0 24 24" fill="none" className="widget-icon" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 12"></polyline>
                    </svg>
                    <span>Timer</span>
                </div>

                {showInputs ? (
                    <div className="timer-input-group">
                        <input type="number" placeholder="00" min="0" max="99" value={inputH} onChange={e => setInputH(e.target.value)} />
                        <span className="colon">:</span>
                        <input type="number" placeholder="00" min="0" max="59" value={inputM} onChange={e => setInputM(e.target.value)} />
                        <span className="colon">:</span>
                        <input type="number" placeholder="00" min="0" max="59" value={inputS} onChange={e => setInputS(e.target.value)} />
                    </div>
                ) : (
                    <div className="focus-time-wrapper">
                        <span>{h}</span><span className="colon">:</span>
                        <span>{m}</span><span className="colon">:</span>
                        <span>{s}</span>
                    </div>
                )}

                <div className="focus-controls mt-20">
                    <button onClick={handleStart} className="control-btn primary">
                        {isRunning ? 'Pause' : (!showInputs && totalSeconds > 0 ? 'Resume' : 'Start')}
                    </button>
                    <button onClick={handleReset} className="control-btn secondary">Reset</button>
                </div>
            </div>
        </div>
    );
}

TimerView.propTypes = {
    isActive: PropTypes.bool.isRequired,
};

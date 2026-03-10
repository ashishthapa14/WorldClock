import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { formatStopwatchTime } from '../../utils/timeFormat';

/**
 * High precision animated stopwatch using RequestAnimationFrame.
 * @param {{ isActive: boolean }} props 
 */
export default function StopwatchView({ isActive }) {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState([]);

    const lastTimeRef = useRef(0);
    const animationFrameRef = useRef(null);

    const updateTimer = useCallback(() => {
        const nowTime = performance.now();
        setElapsedTime(prev => prev + (nowTime - lastTimeRef.current));
        lastTimeRef.current = nowTime;
        animationFrameRef.current = requestAnimationFrame(updateTimer);
    }, []);

    useEffect(() => {
        if (isRunning) {
            lastTimeRef.current = performance.now();
            animationFrameRef.current = requestAnimationFrame(updateTimer);
        } else {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isRunning, updateTimer]);

    const handleStart = useCallback(() => setIsRunning(prev => !prev), []);

    const handleReset = useCallback(() => {
        setIsRunning(false);
        setElapsedTime(0);
        setLaps([]);
    }, []);

    const handleLap = useCallback(() => {
        if (!isRunning) return;
        setLaps(prev => [{ time: elapsedTime, lapCount: prev.length + 1 }, ...prev]);
    }, [isRunning, elapsedTime]);

    const display = formatStopwatchTime(elapsedTime);

    return (
        <div id="view-stopwatch" className={`view ${isActive ? 'active' : ''}`}>
            <div className="clock-panel stopwatch-panel">
                <div className="widget-header">
                    <svg viewBox="0 0 24 24" fill="none" className="widget-icon" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12"></polyline>
                        <line x1="12" y1="2" x2="12" y2="4"></line>
                    </svg>
                    <span>Stopwatch</span>
                </div>

                <div className="focus-time-wrapper stopwatch-display">
                    <span>{display.m}</span><span className="colon">:</span>
                    <span>{display.s}</span><span className="colon">.</span>
                    <span className="ms-text">{display.ms}</span>
                </div>

                <div className="focus-controls mt-20">
                    <button onClick={handleStart} className="control-btn primary">
                        {isRunning ? 'Pause' : (elapsedTime > 0 ? 'Resume' : 'Start')}
                    </button>
                    <button onClick={handleLap} className="control-btn secondary" disabled={!isRunning}>Lap</button>
                    <button onClick={handleReset} className="control-btn secondary">Reset</button>
                </div>

                <div className="laps-container">
                    <ul id="laps-list">
                        {laps.map((lap, idx) => {
                            const formatted = formatStopwatchTime(lap.time);
                            return (
                                <li key={idx} className="lap-item">
                                    <span className="lap-number">Lap {lap.lapCount}</span>
                                    <span className="lap-time">{`${formatted.m}:${formatted.s}.${formatted.ms}`}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}

StopwatchView.propTypes = {
    isActive: PropTypes.bool.isRequired,
};

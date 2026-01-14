// =====================================================================
// RaceContextPanel Component
// Session state, flag status, lap counter, track name
// =====================================================================

import { useSessionStore } from '../../stores/session.store';
import './RaceContextPanel.css';

export function RaceContextPanel() {
    const { session, sessionState } = useSessionStore();

    return (
        <section className="race-context">
            {/* Lap Counter */}
            <div className="race-context__header">
                <div className="lap-display">
                    <span className="lap-label">LAP</span>
                    <span className="lap-current">{session?.currentLap ?? '-'}</span>
                    <span className="lap-time">
                        {session?.timeRemaining ? formatTime(session.timeRemaining) : '00:00'}
                    </span>
                </div>
            </div>

            {/* Flag Status */}
            <div className={`flag-banner flag-banner--${session?.flagStatus ?? 'green'}`}>
                <span className="flag-indicator-dot" />
                <span className="flag-text">
                    {session?.flagStatus?.toUpperCase() ?? 'GREEN'}
                </span>
            </div>

            {/* Track Info */}
            <div className="track-info">
                <span className="track-indicator">■</span>
                <div className="track-details">
                    <span className="track-name">{session?.trackName ?? 'No Session'}</span>
                    <span className="track-config">{session?.trackConfig ?? ''}</span>
                </div>
            </div>

            {/* Lap Progress */}
            <div className="lap-progress">
                <span className="progress-icon">⊞</span>
                <span className="progress-label">LAP</span>
                <span className="progress-current">{session?.currentLap ?? 0}</span>
                <span className="progress-separator">of</span>
                <span className="progress-total">{session?.totalLaps ?? 0}</span>
            </div>
        </section>
    );
}

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

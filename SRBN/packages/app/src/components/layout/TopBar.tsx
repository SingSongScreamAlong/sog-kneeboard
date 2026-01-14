// =====================================================================
// TopBar Component
// Top navigation bar with logo, session info, LIVE status, and controls
// =====================================================================

import { useBroadcastStore } from '../../stores/broadcast.store';
import { useSessionStore } from '../../stores/session.store';
import { useDriverStore } from '../../stores/driver.store';
import './TopBar.css';

export function TopBar() {
    const {
        showAdvancedOptions,
        toggleAdvancedOptions,
        featuredDriverId,
        cameraLocked,
        resetToAuto
    } = useBroadcastStore();
    const { session, sessionState, isConnected } = useSessionStore();
    const { drivers } = useDriverStore();

    const featuredDriver = drivers.find(d => d.id === featuredDriverId);
    const hasManualOverride = featuredDriverId !== null || cameraLocked;

    return (
        <header className="topbar panel panel--topbar">
            {/* Logo Section */}
            <div className="topbar__logo">
                <div className="logo-stripes">
                    <span className="stripe stripe--black" />
                    <span className="stripe stripe--blue" />
                    <span className="stripe stripe--orange" />
                </div>
                <span className="logo-text">OK, BOX BOX</span>
                <span className="logo-divider">|</span>
                <span className="logo-product">BroadcastBox</span>
            </div>

            {/* Center - Session State + Progress */}
            <div className="topbar__center">
                {session && (
                    <>
                        <div className={`state-banner state-banner--${sessionState.toLowerCase()}`}>
                            <span className="state-banner__icon">○</span>
                            <span className="state-banner__text">{sessionState.replace('_', ' ')}</span>
                        </div>
                        {/* Session Progress */}
                        <div className="session-progress">
                            <span className="progress-label">LAP</span>
                            <span className="progress-current">{session.currentLap ?? 0}</span>
                            <span className="progress-sep">/</span>
                            <span className="progress-total">{session.totalLaps ?? 30}</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-bar__fill"
                                    style={{ width: `${((session.currentLap ?? 0) / (session.totalLaps ?? 30)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Focus Indicator - who we're watching and why */}
            {featuredDriver && (
                <div className="focus-indicator">
                    <span className="focus-indicator__label">FOCUS</span>
                    <span className="focus-indicator__driver">{featuredDriver.name}</span>
                    {featuredDriver.isInBattle && (
                        <span className="focus-indicator__reason">Battle P{featuredDriver.position}-P{featuredDriver.position + 1}</span>
                    )}
                </div>
            )}

            {/* Right Section */}
            <div className="topbar__right">
                {/* LIVE/OFFLINE Indicator */}
                <div className={`live-badge ${isConnected ? 'live-badge--live' : 'live-badge--offline'}`}>
                    <span className="live-badge__dot" />
                    <span className="live-badge__text">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                </div>

                {/* Reset to Auto - always visible when manual override active */}
                {hasManualOverride && (
                    <button
                        className="btn btn--reset"
                        onClick={resetToAuto}
                        title="Return to AI Direction (Esc)"
                    >
                        ↺ AUTO
                    </button>
                )}

                {/* Connection Indicator */}
                <div className={`connection-dot ${isConnected ? 'connection-dot--connected' : ''}`} />

                {/* ADV OPTIONS Button */}
                <button
                    className={`btn btn--ghost topbar__adv-btn ${showAdvancedOptions ? 'btn--active' : ''}`}
                    onClick={toggleAdvancedOptions}
                >
                    <span className="adv-icon">▸</span>
                    ADV OPTIONS
                </button>
            </div>
        </header>
    );
}

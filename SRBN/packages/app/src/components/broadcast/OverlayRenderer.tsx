// =====================================================================
// Overlay Renderer
// Renders race overlays as compositor layers
// =====================================================================

import { useEffect, useRef } from 'react';
import type { OverlayConfig } from '../../engine/types';
import { useDriverStore } from '../../stores/driver.store';
import { useSessionStore } from '../../stores/session.store';
import { useBroadcastStore } from '../../stores/broadcast.store';
import './OverlayRenderer.css';

interface OverlayRendererProps {
    overlays: OverlayConfig[];
    width: number;
    height: number;
}

export function OverlayRenderer({ overlays, width, height }: OverlayRendererProps) {
    const { drivers } = useDriverStore();
    const { session, sessionState } = useSessionStore();
    const { featuredDriverId, cameraLocked } = useBroadcastStore();

    const featuredDriver = drivers.find(d => d.id === featuredDriverId);
    const topDrivers = [...drivers].sort((a, b) => a.position - b.position).slice(0, 5);

    return (
        <div
            className="overlay-renderer"
            style={{ width, height }}
        >
            {overlays.map((overlay, index) => {
                if (!overlay.enabled) return null;

                const style: React.CSSProperties = {
                    position: 'absolute',
                    left: `${overlay.position.x * 100}%`,
                    top: `${overlay.position.y * 100}%`,
                    opacity: overlay.opacity,
                    zIndex: overlay.zIndex,
                };

                switch (overlay.type) {
                    case 'timing-tower':
                        return (
                            <div key={index} className="overlay-timing-tower" style={style}>
                                <div className="timing-tower__header">LIVE TIMING</div>
                                {topDrivers.map((driver, i) => (
                                    <div
                                        key={driver.id}
                                        className={`timing-tower__row ${driver.id === featuredDriverId ? 'timing-tower__row--featured' : ''}`}
                                    >
                                        <span className="timing-tower__pos">{driver.position}</span>
                                        <span className="timing-tower__name">{driver.name}</span>
                                        <span className="timing-tower__gap">
                                            {i === 0 ? 'LEADER' : `+${driver.gapToLeader?.toFixed(1) || '0.0'}s`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );

                    case 'lower-third':
                        if (!featuredDriver) return null;
                        return (
                            <div key={index} className="overlay-lower-third" style={style}>
                                <div className="lower-third__position">P{featuredDriver.position}</div>
                                <div className="lower-third__info">
                                    <div className="lower-third__name">{featuredDriver.name}</div>
                                    <div className="lower-third__details">
                                        #{featuredDriver.carNumber} • {featuredDriver.tireCompound?.toUpperCase() || 'MED'} • L{featuredDriver.tireLaps || 0}
                                    </div>
                                </div>
                                {cameraLocked && <div className="lower-third__locked">🔒</div>}
                            </div>
                        );

                    case 'battle-box':
                        const battlingDrivers = drivers.filter(d => d.isInBattle).slice(0, 2);
                        if (battlingDrivers.length < 2) return null;
                        return (
                            <div key={index} className="overlay-battle-box" style={style}>
                                <div className="battle-box__header">BATTLE FOR P{battlingDrivers[0]?.position}</div>
                                <div className="battle-box__drivers">
                                    <div className="battle-box__driver">
                                        <span className="battle-box__name">{battlingDrivers[0]?.name}</span>
                                    </div>
                                    <div className="battle-box__gap">
                                        {Math.abs(battlingDrivers[0]?.gapAhead || 0).toFixed(1)}s
                                    </div>
                                    <div className="battle-box__driver">
                                        <span className="battle-box__name">{battlingDrivers[1]?.name}</span>
                                    </div>
                                </div>
                            </div>
                        );

                    case 'incident-banner':
                        if (sessionState !== 'CAUTION') return null;
                        return (
                            <div key={index} className="overlay-incident-banner" style={style}>
                                <span className="incident-banner__icon">⚠️</span>
                                <span className="incident-banner__text">CAUTION — SAFETY CAR DEPLOYED</span>
                            </div>
                        );

                    default:
                        return null;
                }
            })}

            {/* Session info bug */}
            <div className="overlay-session-bug">
                <span className="session-bug__track">{session?.trackName || 'Unknown Track'}</span>
                <span className="session-bug__state">{sessionState}</span>
                <span className="session-bug__lap">LAP {session?.currentLap || 0}</span>
            </div>
        </div>
    );
}

// =====================================================================
// TelemetryOverlay Component
// Real-time speed, throttle, brake traces and tire visualization
// =====================================================================

import { useDriverStore } from '../../stores/driver.store';
import { useBroadcastStore } from '../../stores/broadcast.store';
import './TelemetryOverlay.css';

interface TelemetryOverlayProps {
    driverId?: string;
    showSpeed?: boolean;
    showThrottleBrake?: boolean;
    showTires?: boolean;
    showDelta?: boolean;
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export function TelemetryOverlay({
    driverId,
    showSpeed = true,
    showThrottleBrake = true,
    showTires = true,
    showDelta = true,
    position = 'bottom-right',
}: TelemetryOverlayProps) {
    const { featuredDriverId } = useBroadcastStore();
    const { drivers } = useDriverStore();

    const targetDriverId = driverId || featuredDriverId;
    const driver = drivers.find(d => d.id === targetDriverId);

    if (!driver) return null;

    const speed = driver.speed ?? 0;
    const throttle = driver.throttle ?? 0;
    const brake = driver.brake ?? 0;
    const gear = driver.gear ?? 0;

    return (
        <div className={`telemetry-overlay telemetry-overlay--${position}`}>
            {/* Driver Badge */}
            <div className="telemetry-driver">
                <span className="telemetry-position">P{driver.position}</span>
                <span className="telemetry-name">{driver.name.split(' ').pop()}</span>
            </div>

            {/* Speed Display */}
            {showSpeed && (
                <div className="telemetry-speed">
                    <span className="speed-value">{Math.round(speed)}</span>
                    <span className="speed-unit">KM/H</span>
                    <span className="gear-indicator">G{gear}</span>
                </div>
            )}

            {/* Throttle/Brake Traces */}
            {showThrottleBrake && (
                <div className="telemetry-traces">
                    <div className="trace-container">
                        <div className="trace-label">THR</div>
                        <div className="trace-bar trace-bar--throttle">
                            <div
                                className="trace-fill trace-fill--throttle"
                                style={{ width: `${throttle}%` }}
                            />
                        </div>
                        <span className="trace-value">{Math.round(throttle)}%</span>
                    </div>
                    <div className="trace-container">
                        <div className="trace-label">BRK</div>
                        <div className="trace-bar trace-bar--brake">
                            <div
                                className="trace-fill trace-fill--brake"
                                style={{ width: `${brake}%` }}
                            />
                        </div>
                        <span className="trace-value">{Math.round(brake)}%</span>
                    </div>
                </div>
            )}

            {/* Tire Visualization */}
            {showTires && (
                <div className="telemetry-tires">
                    <div className="tire-label">{driver.tireCompound?.toUpperCase() || 'MED'}</div>
                    <div className="tire-grid">
                        <TireIndicator position="FL" tireLaps={driver.tireLaps} />
                        <TireIndicator position="FR" tireLaps={driver.tireLaps} />
                        <TireIndicator position="RL" tireLaps={driver.tireLaps} />
                        <TireIndicator position="RR" tireLaps={driver.tireLaps} />
                    </div>
                    <div className="tire-age">{driver.tireLaps || 0} LAPS</div>
                </div>
            )}

            {/* Delta Time */}
            {showDelta && driver.gapToLeader && (
                <div className="telemetry-delta">
                    <span className="delta-label">GAP</span>
                    <span className={`delta-value ${driver.gapToLeader > 0 ? 'delta-value--behind' : 'delta-value--ahead'}`}>
                        {driver.gapToLeader > 0 ? '+' : ''}{driver.gapToLeader.toFixed(1)}s
                    </span>
                </div>
            )}
        </div>
    );
}

// Individual tire indicator
interface TireIndicatorProps {
    position: 'FL' | 'FR' | 'RL' | 'RR';
    tireLaps: number;
}

function TireIndicator({ position, tireLaps }: TireIndicatorProps) {
    const wear = Math.min(tireLaps / 40, 1); // Normalize: 40 laps = fully worn
    const wearPct = wear * 100;
    const tempColor = wearPct > 75 ? 'var(--bb-red)' :
        wearPct > 50 ? 'var(--bb-orange)' :
            wearPct > 25 ? 'var(--bb-green)' : 'var(--bb-blue)';

    return (
        <div className="tire-indicator" style={{ '--tire-color': tempColor } as React.CSSProperties}>
            <div className="tire-box">
                <div className="tire-wear" style={{ height: `${wearPct}%` }} />
            </div>
            <span className="tire-temp">{position}</span>
        </div>
    );
}

// =====================================================================
// TelemetryOverlay Component
// Real-time speed, throttle, brake traces and tire visualization
// =====================================================================

import { useMemo } from 'react';
import { useDriverStore } from '../../stores/driver.store';
import { useBroadcastStore } from '../../stores/broadcast.store';
import './TelemetryOverlay.css';

interface TelemetryData {
    speed: number;
    throttle: number;
    brake: number;
    gear: number;
    rpm: number;
    steeringAngle: number;
}

// Mock telemetry data generator for demo
function generateMockTelemetry(): TelemetryData {
    return {
        speed: Math.floor(180 + Math.random() * 150),
        throttle: Math.random() * 100,
        brake: Math.random() > 0.7 ? Math.random() * 100 : 0,
        gear: Math.floor(3 + Math.random() * 5),
        rpm: Math.floor(8000 + Math.random() * 10000),
        steeringAngle: (Math.random() - 0.5) * 90,
    };
}

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

    // For demo, generate mock telemetry
    const telemetry = useMemo(() => generateMockTelemetry(), []);

    if (!driver) return null;

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
                    <span className="speed-value">{telemetry.speed}</span>
                    <span className="speed-unit">KM/H</span>
                    <span className="gear-indicator">G{telemetry.gear}</span>
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
                                style={{ width: `${telemetry.throttle}%` }}
                            />
                        </div>
                        <span className="trace-value">{Math.round(telemetry.throttle)}%</span>
                    </div>
                    <div className="trace-container">
                        <div className="trace-label">BRK</div>
                        <div className="trace-bar trace-bar--brake">
                            <div
                                className="trace-fill trace-fill--brake"
                                style={{ width: `${telemetry.brake}%` }}
                            />
                        </div>
                        <span className="trace-value">{Math.round(telemetry.brake)}%</span>
                    </div>
                </div>
            )}

            {/* Tire Visualization */}
            {showTires && (
                <div className="telemetry-tires">
                    <div className="tire-label">{driver.tireCompound?.toUpperCase() || 'MED'}</div>
                    <div className="tire-grid">
                        <TireIndicator position="FL" temp={85} wear={0.15} />
                        <TireIndicator position="FR" temp={88} wear={0.18} />
                        <TireIndicator position="RL" temp={82} wear={0.12} />
                        <TireIndicator position="RR" temp={84} wear={0.14} />
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
    temp: number;
    wear: number;
}

function TireIndicator({ position, temp, wear }: TireIndicatorProps) {
    const tempColor = temp > 100 ? 'var(--bb-red)' :
        temp > 90 ? 'var(--bb-orange)' :
            temp > 80 ? 'var(--bb-green)' : 'var(--bb-blue)';

    return (
        <div className="tire-indicator" style={{ '--tire-color': tempColor } as React.CSSProperties}>
            <div className="tire-box">
                <div className="tire-wear" style={{ height: `${wear * 100}%` }} />
            </div>
            <span className="tire-temp">{temp}°</span>
        </div>
    );
}

// =====================================================================
// BlackBox Team View - Pit Wall (Week 7 MVP)
// Live timing list with gap analysis and incident notifications.
// =====================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { realtimeClient, type ThinTelemetryFrame } from '../../lib/realtime-client';
import { useAuth } from '../../lib/auth-context';
import type { SessionTiming, TimingEntry } from '@controlbox/common';
import './BlackBoxTeam.css';

// =====================================================================
// Types
// =====================================================================

interface DriverState {
    driverId: string;
    driverName: string;
    position: number;
    gap: string;
    lastLap: string;
    bestLap: string;
    speed: number;
    inPit: boolean;
    incidentCount: number;
    lastUpdate: number;
}

// =====================================================================
// Component
// =====================================================================

export function BlackBoxTeamView() {
    const { claims } = useAuth();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [drivers, setDrivers] = useState<Map<string, DriverState>>(new Map());
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastTimingUpdate, setLastTimingUpdate] = useState<SessionTiming | null>(null);

    // Connect to realtime on mount
    useEffect(() => {
        if (!claims) return;

        realtimeClient.connect(claims, 'blackbox');

        const unsubConnection = realtimeClient.onConnection((status) => {
            setIsConnected(status === 'connected');
        });

        return () => {
            unsubConnection();
        };
    }, [claims]);

    // Subscribe to session when selected
    useEffect(() => {
        if (!sessionId || !isConnected) return;

        // Team gets 20Hz
        realtimeClient.subscribe(sessionId, 20);

        return () => {
            realtimeClient.unsubscribe(sessionId);
        };
    }, [sessionId, isConnected]);

    // Handle timing updates (2Hz - main source for pit wall)
    useEffect(() => {
        const unsubTiming = realtimeClient.onTiming((timing) => {
            setLastTimingUpdate(timing);

            // Update driver states from timing entries
            setDrivers(prev => {
                const next = new Map(prev);
                for (const entry of timing.entries) {
                    next.set(entry.driverId, {
                        driverId: entry.driverId,
                        driverName: entry.driverName,
                        position: entry.position,
                        gap: formatGap(entry.gapToLeader),
                        lastLap: formatLapTime(entry.lastLapTime),
                        bestLap: formatLapTime(entry.bestLapTime),
                        speed: 0,  // Updated from telemetry frames
                        inPit: entry.inPit,
                        incidentCount: entry.incidentCount,
                        lastUpdate: Date.now(),
                    });
                }
                return next;
            });
        });

        return () => unsubTiming();
    }, []);

    // Handle telemetry frames (for speed updates)
    useEffect(() => {
        const unsubFrame = realtimeClient.onThinFrame((frame) => {
            setDrivers(prev => {
                const driver = prev.get(frame.driverId);
                if (driver) {
                    const next = new Map(prev);
                    next.set(frame.driverId, {
                        ...driver,
                        speed: frame.speed,
                        position: frame.position ?? driver.position,
                        inPit: frame.inPit,
                        lastUpdate: Date.now(),
                    });
                    return next;
                }
                return prev;
            });
        });

        return () => unsubFrame();
    }, []);

    // Sort drivers by position
    const sortedDrivers = useMemo(() => {
        return Array.from(drivers.values()).sort((a, b) => a.position - b.position);
    }, [drivers]);

    // Select a session (for demo, use first available or prompt)
    const handleSessionSelect = useCallback((id: string) => {
        setSessionId(id);
    }, []);

    // Request burst for battles
    const handleBattleBurst = useCallback((driverId: string) => {
        if (sessionId) {
            realtimeClient.requestBurst(sessionId, `battle:${driverId}`);
        }
    }, [sessionId]);

    return (
        <div className="blackbox-team">
            <header className="blackbox-team__header">
                <h1>🏎️ Pit Wall</h1>
                <div className="connection-status">
                    {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </div>
            </header>

            {/* Session Selector */}
            {!sessionId && (
                <div className="session-selector">
                    <h2>Select Session</h2>
                    <p>Enter a session ID to connect:</p>
                    <input
                        type="text"
                        placeholder="Session ID"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSessionSelect((e.target as HTMLInputElement).value);
                            }
                        }}
                    />
                </div>
            )}

            {/* Timing Board */}
            {sessionId && (
                <div className="timing-board">
                    <table>
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Driver</th>
                                <th>Gap</th>
                                <th>Last Lap</th>
                                <th>Best Lap</th>
                                <th>Speed</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedDrivers.map((driver) => (
                                <tr
                                    key={driver.driverId}
                                    className={`
                                        ${driver.inPit ? 'in-pit' : ''}
                                        ${selectedDriverId === driver.driverId ? 'selected' : ''}
                                        ${driver.incidentCount > 0 ? 'has-incident' : ''}
                                    `}
                                    onClick={() => setSelectedDriverId(driver.driverId)}
                                >
                                    <td className="pos">{driver.position}</td>
                                    <td className="driver">{driver.driverName}</td>
                                    <td className="gap">{driver.gap}</td>
                                    <td className="last-lap">{driver.lastLap}</td>
                                    <td className="best-lap">{driver.bestLap}</td>
                                    <td className="speed">{Math.round(driver.speed * 3.6)} km/h</td>
                                    <td className="status">
                                        {driver.inPit && <span className="pit-badge">PIT</span>}
                                        {driver.incidentCount > 0 && (
                                            <span className="incident-badge">⚠️ {driver.incidentCount}</span>
                                        )}
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="burst-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBattleBurst(driver.driverId);
                                            }}
                                        >
                                            ⚡ Burst
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Selected Driver Panel */}
            {selectedDriverId && (
                <SelectedDriverPanel
                    driverId={selectedDriverId}
                    driver={drivers.get(selectedDriverId)}
                    sessionId={sessionId}
                    onClose={() => setSelectedDriverId(null)}
                />
            )}
        </div>
    );
}

// =====================================================================
// Selected Driver Panel
// =====================================================================

interface SelectedDriverPanelProps {
    driverId: string;
    driver: DriverState | undefined;
    sessionId: string | null;
    onClose: () => void;
}

function SelectedDriverPanel({ driverId, driver, sessionId, onClose }: SelectedDriverPanelProps) {
    const { hasCap } = useAuth();
    const canRequestFat = hasCap('blackbox:telemetry:fat');

    const handleRequestFat = () => {
        if (sessionId) {
            realtimeClient.requestFatFrames(sessionId, driverId);
        }
    };

    if (!driver) return null;

    return (
        <div className="driver-panel">
            <div className="driver-panel__header">
                <h3>{driver.driverName}</h3>
                <button onClick={onClose}>✕</button>
            </div>
            <div className="driver-panel__content">
                <div className="stat">
                    <label>Position</label>
                    <value>P{driver.position}</value>
                </div>
                <div className="stat">
                    <label>Gap to Leader</label>
                    <value>{driver.gap}</value>
                </div>
                <div className="stat">
                    <label>Current Speed</label>
                    <value>{Math.round(driver.speed * 3.6)} km/h</value>
                </div>
                <div className="stat">
                    <label>Last Lap</label>
                    <value>{driver.lastLap}</value>
                </div>
                <div className="stat">
                    <label>Best Lap</label>
                    <value>{driver.bestLap}</value>
                </div>
            </div>
            {canRequestFat && (
                <div className="driver-panel__actions">
                    <button onClick={handleRequestFat}>
                        📊 Request Detailed Telemetry
                    </button>
                </div>
            )}
        </div>
    );
}

// =====================================================================
// Helpers
// =====================================================================

function formatGap(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined) return '—';
    if (seconds === 0) return 'Leader';
    return `+${seconds.toFixed(3)}`;
}

function formatLapTime(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined || seconds <= 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : secs;
}

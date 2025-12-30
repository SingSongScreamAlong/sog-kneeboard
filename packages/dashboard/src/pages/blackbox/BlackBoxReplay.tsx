// =====================================================================
// BlackBox Replay View (Week 7 MVP)
// Time-range selection and playback of persisted telemetry.
// =====================================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import type { SessionTiming } from '@controlbox/common';
import './BlackBoxReplay.css';

// =====================================================================
// Types
// =====================================================================

interface ReplayMetadata {
    sessionId: string;
    startTimeMs: number;
    endTimeMs: number;
    durationMs: number;
    driversCount: number;
    totalFrames: number;
}

interface ReplayFrame {
    driver_id: string;
    driver_name: string;
    position: number;
    speed: number;
    gear: number;
    lap: number;
    last_lap_time: number | null;
    gap_to_leader: number | null;
    in_pit: boolean;
    session_time_ms: number;
}

// =====================================================================
// Component
// =====================================================================

export function BlackBoxReplayView() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { claims, hasCap } = useAuth();

    const [metadata, setMetadata] = useState<ReplayMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Playback state
    const [currentTimeMs, setCurrentTimeMs] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [frames, setFrames] = useState<ReplayFrame[]>([]);

    // Selected range
    const [rangeStart, setRangeStart] = useState(0);
    const [rangeEnd, setRangeEnd] = useState(0);

    // Fetch metadata on mount
    useEffect(() => {
        if (!sessionId) return;

        async function fetchMetadata() {
            try {
                const res = await fetch(`/api/replay/sessions/${sessionId}`);
                if (!res.ok) throw new Error('Failed to load session');

                const json = await res.json();
                setMetadata(json.data);
                setRangeStart(json.data.startTimeMs);
                setRangeEnd(json.data.endTimeMs);
                setCurrentTimeMs(json.data.startTimeMs);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMetadata();
    }, [sessionId]);

    // Fetch frames for current window
    const fetchFrames = useCallback(async (fromMs: number, toMs: number) => {
        if (!sessionId) return;

        try {
            const role = claims?.role || 'broadcast';
            const res = await fetch(
                `/api/replay/sessions/${sessionId}/telemetry?fromMs=${fromMs}&toMs=${toMs}&role=${role}`
            );
            if (!res.ok) throw new Error('Failed to load frames');

            const json = await res.json();
            setFrames(json.data.frames || []);
        } catch (err) {
            console.error('Failed to fetch frames:', err);
        }
    }, [sessionId, claims?.role]);

    // Playback loop
    useEffect(() => {
        if (!isPlaying || !metadata) return;

        const intervalMs = 100; // 10 fps visual update
        const stepMs = intervalMs * playbackSpeed;

        const interval = setInterval(() => {
            setCurrentTimeMs(prev => {
                const next = prev + stepMs;
                if (next >= rangeEnd) {
                    setIsPlaying(false);
                    return rangeEnd;
                }
                return next;
            });
        }, intervalMs);

        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, rangeEnd, metadata]);

    // Fetch frames when time changes (debounced)
    useEffect(() => {
        const windowMs = 5000; // 5 second window
        const fromMs = currentTimeMs;
        const toMs = Math.min(currentTimeMs + windowMs, rangeEnd);

        const timeout = setTimeout(() => {
            fetchFrames(fromMs, toMs);
        }, 200);

        return () => clearTimeout(timeout);
    }, [currentTimeMs, rangeEnd, fetchFrames]);

    // Controls
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleSeek = (ms: number) => {
        setCurrentTimeMs(ms);
        setIsPlaying(false);
    };

    if (isLoading) {
        return <div className="replay-loading">Loading replay...</div>;
    }

    if (error) {
        return <div className="replay-error">Error: {error}</div>;
    }

    if (!metadata) {
        return <div className="replay-empty">No replay data found</div>;
    }

    const progressPct = metadata.durationMs > 0
        ? ((currentTimeMs - metadata.startTimeMs) / metadata.durationMs) * 100
        : 0;

    return (
        <div className="blackbox-replay">
            <header className="replay-header">
                <h1>📼 Session Replay</h1>
                <div className="session-info">
                    <span>Session: {sessionId?.slice(0, 8)}...</span>
                    <span>Duration: {formatDuration(metadata.durationMs)}</span>
                    <span>Drivers: {metadata.driversCount}</span>
                </div>
            </header>

            {/* Timeline */}
            <div className="replay-timeline">
                <div className="timeline-bar">
                    <div
                        className="timeline-progress"
                        style={{ width: `${progressPct}%` }}
                    />
                    <input
                        type="range"
                        min={metadata.startTimeMs}
                        max={metadata.endTimeMs}
                        value={currentTimeMs}
                        onChange={(e) => handleSeek(Number(e.target.value))}
                        className="timeline-slider"
                    />
                </div>
                <div className="timeline-time">
                    {formatSessionTime(currentTimeMs - metadata.startTimeMs)}
                    {' / '}
                    {formatSessionTime(metadata.durationMs)}
                </div>
            </div>

            {/* Controls */}
            <div className="replay-controls">
                <button onClick={() => handleSeek(metadata.startTimeMs)}>⏮</button>
                {isPlaying ? (
                    <button onClick={handlePause}>⏸️</button>
                ) : (
                    <button onClick={handlePlay}>▶️</button>
                )}
                <button onClick={() => handleSeek(rangeEnd)}>⏭</button>

                <div className="speed-selector">
                    <span>Speed:</span>
                    {[1, 2, 5, 10].map(speed => (
                        <button
                            key={speed}
                            className={playbackSpeed === speed ? 'active' : ''}
                            onClick={() => setPlaybackSpeed(speed)}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>

            {/* Frame Display */}
            <div className="replay-frames">
                <table>
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Driver</th>
                            <th>Lap</th>
                            <th>Gap</th>
                            <th>Speed</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {frames
                            .filter((f, i, arr) => arr.findIndex(x => x.driver_id === f.driver_id) === i)
                            .sort((a, b) => (a.position || 99) - (b.position || 99))
                            .map(frame => (
                                <tr key={frame.driver_id}>
                                    <td>{frame.position}</td>
                                    <td>{frame.driver_name || frame.driver_id}</td>
                                    <td>{frame.lap}</td>
                                    <td>{formatGap(frame.gap_to_leader)}</td>
                                    <td>{Math.round((frame.speed || 0) * 3.6)} km/h</td>
                                    <td>{frame.in_pit ? '🔧 PIT' : '🟢'}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// =====================================================================
// Helpers
// =====================================================================

function formatDuration(ms: number): string {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);

    if (hours > 0) {
        return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m ${secs % 60}s`;
}

function formatSessionTime(ms: number): string {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    return `${mins}:${String(secs % 60).padStart(2, '0')}`;
}

function formatGap(seconds: number | null): string {
    if (seconds === null || seconds === undefined) return '—';
    if (seconds === 0) return 'Leader';
    return `+${seconds.toFixed(3)}`;
}

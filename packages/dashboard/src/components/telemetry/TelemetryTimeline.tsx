// =====================================================================
// Telemetry Timeline Component
// Visual timeline scrubber for incident review
// =====================================================================

import { useState, useRef, useEffect } from 'react';
import { useIncidentStore } from '../../stores/incident.store';

// Local type definitions (matching timeline.ts types)
type TelemetryChannel = 'speed' | 'throttle' | 'brake' | 'steering' | 'gear' | 'rpm' | 'lateralG' | 'longitudinalG';

interface TimelineMarker {
    id: string;
    sessionId: string;
    timestamp: number;
    lapNumber: number;
    type: string;
    label: string;
    description?: string;
    severity?: 'info' | 'warning' | 'critical';
    relatedIncidentId?: string;
    relatedDriverIds?: string[];
}

interface TimelineProps {
    sessionDuration: number;     // Total session duration in ms
    currentLap?: number;
    totalLaps?: number;
}

export function TelemetryTimeline({ sessionDuration, currentLap = 0, totalLaps = 50 }: TimelineProps) {
    const { incidents } = useIncidentStore();
    const timelineRef = useRef<HTMLDivElement>(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState<TimelineMarker | null>(null);
    const [showChannels, setShowChannels] = useState<TelemetryChannel[]>(['speed', 'throttle', 'brake']);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Convert incidents to timeline markers
    const markers: TimelineMarker[] = incidents.map(incident => ({
        id: incident.id,
        sessionId: incident.sessionId,
        timestamp: incident.sessionTimeMs,
        lapNumber: incident.lapNumber,
        type: 'incident',
        label: `Lap ${incident.lapNumber} - ${incident.type}`,
        description: `${incident.type} incident at session time ${Math.floor(incident.sessionTimeMs / 1000)}s`,
        severity: incident.severity === 'heavy' ? 'critical' :
            incident.severity === 'medium' ? 'warning' : 'info',
        relatedIncidentId: incident.id,
    }));

    // Playback logic
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentTime(prev => {
                const next = prev + (100 * playbackSpeed);
                if (next >= sessionDuration) {
                    setIsPlaying(false);
                    return sessionDuration;
                }
                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, sessionDuration]);

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = Math.floor(percentage * sessionDuration);
        setCurrentTime(Math.max(0, Math.min(sessionDuration, newTime)));
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        setCurrentTime(Math.floor(percentage * sessionDuration));
    };

    const formatTime = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getMarkerPosition = (timestamp: number): number => {
        return (timestamp / sessionDuration) * 100;
    };

    const getMarkerColor = (marker: TimelineMarker): string => {
        switch (marker.severity) {
            case 'critical': return 'bg-red-500';
            case 'warning': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };

    const toggleChannel = (channel: TelemetryChannel) => {
        setShowChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    const channelConfig: { channel: TelemetryChannel; label: string; color: string }[] = [
        { channel: 'speed', label: 'Speed', color: 'bg-blue-500' },
        { channel: 'throttle', label: 'Throttle', color: 'bg-green-500' },
        { channel: 'brake', label: 'Brake', color: 'bg-red-500' },
        { channel: 'steering', label: 'Steering', color: 'bg-purple-500' },
        { channel: 'lateralG', label: 'Lateral G', color: 'bg-orange-500' },
        { channel: 'longitudinalG', label: 'Long G', color: 'bg-cyan-500' },
    ];

    // Suppress unused variable warning
    void zoomLevel;

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Telemetry Timeline
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                        Lap {currentLap} / {totalLaps}
                    </span>
                    <span className="text-sm font-mono text-white bg-slate-700 px-2 py-1 rounded">
                        {formatTime(currentTime)}
                    </span>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentTime(0)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white"
                        title="Go to start"
                    >
                        ⏮
                    </button>
                    <button
                        onClick={() => setCurrentTime(prev => Math.max(0, prev - 10000))}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white"
                        title="Rewind 10s"
                    >
                        ⏪
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${isPlaying ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'
                            } text-white text-lg`}
                    >
                        {isPlaying ? '⏸' : '▶️'}
                    </button>
                    <button
                        onClick={() => setCurrentTime(prev => Math.min(sessionDuration, prev + 10000))}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white"
                        title="Forward 10s"
                    >
                        ⏩
                    </button>
                    <button
                        onClick={() => setCurrentTime(sessionDuration)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white"
                        title="Go to end"
                    >
                        ⏭
                    </button>
                </div>

                {/* Speed control */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Speed:</span>
                    {[0.25, 0.5, 1, 2, 4].map(speed => (
                        <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`px-2 py-1 rounded text-xs font-medium ${playbackSpeed === speed
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>

                {/* Zoom control */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-slate-400">Zoom:</span>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                        className="w-24 accent-primary-500"
                    />
                    <span className="text-sm text-white font-mono">{zoomLevel.toFixed(1)}x</span>
                </div>
            </div>

            {/* Timeline Track */}
            <div className="p-4">
                <div
                    ref={timelineRef}
                    className="relative h-16 bg-slate-900 rounded-lg cursor-pointer overflow-hidden"
                    onClick={handleTimelineClick}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onMouseMove={handleMouseMove}
                >
                    {/* Progress bar */}
                    <div
                        className="absolute top-0 left-0 h-full bg-primary-600/30 transition-all duration-75"
                        style={{ width: `${(currentTime / sessionDuration) * 100}%` }}
                    />

                    {/* Incident markers */}
                    {markers.map(marker => (
                        <button
                            key={marker.id}
                            className={`absolute top-2 w-3 h-12 rounded-sm ${getMarkerColor(marker)} opacity-80 hover:opacity-100 transition-opacity transform -translate-x-1/2`}
                            style={{ left: `${getMarkerPosition(marker.timestamp)}%` }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMarker(marker);
                                setCurrentTime(marker.timestamp);
                            }}
                            title={marker.label}
                        />
                    ))}

                    {/* Playhead */}
                    <div
                        className="absolute top-0 w-0.5 h-full bg-white shadow-lg transform -translate-x-1/2 z-10"
                        style={{ left: `${(currentTime / sessionDuration) * 100}%` }}
                    >
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-3 h-3 bg-white rotate-45" />
                    </div>

                    {/* Time labels */}
                    <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-xs text-slate-500">
                        <span>0:00</span>
                        <span>{formatTime(sessionDuration / 4)}</span>
                        <span>{formatTime(sessionDuration / 2)}</span>
                        <span>{formatTime((sessionDuration * 3) / 4)}</span>
                        <span>{formatTime(sessionDuration)}</span>
                    </div>
                </div>

                {/* Marker count legend */}
                <div className="flex items-center gap-4 mt-2 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-slate-400">Critical ({markers.filter(m => m.severity === 'critical').length})</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-slate-400">Warning ({markers.filter(m => m.severity === 'warning').length})</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-slate-400">Info ({markers.filter(m => m.severity === 'info').length})</span>
                    </div>
                </div>
            </div>

            {/* Telemetry Channels Toggle */}
            <div className="px-4 py-3 border-t border-slate-700">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-400">Overlay:</span>
                    {channelConfig.map(({ channel, label, color }) => (
                        <button
                            key={channel}
                            onClick={() => toggleChannel(channel)}
                            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${showChannels.includes(channel)
                                ? `${color} text-white`
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${showChannels.includes(channel) ? 'bg-white' : color}`} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Marker Detail */}
            {selectedMarker && (
                <div className="px-4 py-3 border-t border-slate-700 bg-slate-700/30">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-medium text-white">{selectedMarker.label}</h4>
                            {selectedMarker.description && (
                                <p className="text-sm text-slate-400 mt-1">{selectedMarker.description}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                                Time: {formatTime(selectedMarker.timestamp)}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedMarker(null)}
                            className="text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

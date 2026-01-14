// =====================================================================
// Streaming Controls Component
// UI for managing RTMP streams to YouTube/Twitch
// =====================================================================

import { useState, useEffect, useRef } from 'react';
import { getCompositor } from '../../engine/Compositor';
import { useOutputManager } from '../../engine/OutputManager';
import './StreamingControls.css';

interface StreamDestination {
    id: string;
    name: string;
    platform: 'youtube' | 'twitch' | 'custom';
    rtmpUrl: string;
    streamKey: string;
}

const PLATFORMS: Record<string, { name: string; rtmpUrl: string }> = {
    youtube: { name: 'YouTube', rtmpUrl: 'rtmp://a.rtmpUrl.youtube.com/live2' },
    twitch: { name: 'Twitch', rtmpUrl: 'rtmp://live.twitch.tv/app' },
    custom: { name: 'Custom RTMP', rtmpUrl: '' },
};

export function StreamingControls() {
    const { encoder, addOutput, setOutputStatus } = useOutputManager();

    const [destinations, setDestinations] = useState<StreamDestination[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamTime, setStreamTime] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPlatform, setNewPlatform] = useState<'youtube' | 'twitch' | 'custom'>('youtube');
    const [newStreamKey, setNewStreamKey] = useState('');
    const [customRtmpUrl, setCustomRtmpUrl] = useState('');

    const wsRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Connect to stream relay
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3002/stream');

        ws.onopen = () => {
            console.log('🎬 Connected to stream relay');
            ws.send(JSON.stringify({ type: 'status' }));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'status') {
                setIsStreaming(message.isStreaming);
            }
        };

        ws.onerror = (error) => {
            console.error('Stream relay error:', error);
        };

        wsRef.current = ws;

        return () => {
            ws.close();
        };
    }, []);

    const handleAddDestination = () => {
        const platform = PLATFORMS[newPlatform];
        const destination: StreamDestination = {
            id: `dest-${Date.now()}`,
            name: platform.name,
            platform: newPlatform,
            rtmpUrl: newPlatform === 'custom' ? customRtmpUrl : platform.rtmpUrl,
            streamKey: newStreamKey,
        };

        setDestinations(prev => [...prev, destination]);
        setShowAddModal(false);
        setNewStreamKey('');
        setCustomRtmpUrl('');
    };

    const handleRemoveDestination = (id: string) => {
        setDestinations(prev => prev.filter(d => d.id !== id));
    };

    const handleStartStreaming = async () => {
        if (destinations.length === 0) {
            alert('Add at least one streaming destination');
            return;
        }

        const compositor = getCompositor();
        if (!compositor) {
            console.error('Compositor not initialized');
            return;
        }

        // Get video stream from compositor
        const stream = compositor.getStream(encoder.frameRate);

        // Create MediaRecorder to encode video
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=h264')
            ? 'video/webm;codecs=h264'
            : 'video/webm;codecs=vp8';

        const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: encoder.bitrate * 1000,
        });

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                // Send video chunks to stream relay
                wsRef.current.send(event.data);
            }
        };

        // Use first destination for now
        const dest = destinations[0];

        // Tell server to start FFmpeg
        wsRef.current?.send(JSON.stringify({
            type: 'start',
            config: {
                rtmpUrl: dest.rtmpUrl,
                streamKey: dest.streamKey,
                width: encoder.width,
                height: encoder.height,
                frameRate: encoder.frameRate,
                bitrate: encoder.bitrate,
            },
        }));

        recorder.start(1000); // Send data every second
        mediaRecorderRef.current = recorder;

        setIsStreaming(true);
        setStreamTime(0);

        // Start timer
        timerRef.current = setInterval(() => {
            setStreamTime(t => t + 1);
        }, 1000);

        // Add output entry
        addOutput({ name: dest.name, type: 'rtmp', url: dest.rtmpUrl });
        setOutputStatus(`output-${Date.now()}`, 'active');
    };

    const handleStopStreaming = () => {
        // Stop MediaRecorder
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
        }

        // Tell server to stop FFmpeg
        wsRef.current?.send(JSON.stringify({ type: 'stop' }));

        // Stop timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsStreaming(false);
    };

    const formatTime = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="streaming-controls">
            <div className="streaming-controls__header">
                <span className="streaming-controls__title">STREAMING</span>
                {isStreaming && (
                    <span className="streaming-controls__timer">
                        ● LIVE {formatTime(streamTime)}
                    </span>
                )}
            </div>

            <div className="streaming-controls__destinations">
                <div className="streaming-controls__dest-header">
                    <span>Destinations</span>
                    <button
                        className="streaming-controls__add-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        + Add
                    </button>
                </div>

                {destinations.length === 0 ? (
                    <div className="streaming-controls__empty">
                        No destinations configured
                    </div>
                ) : (
                    destinations.map(dest => (
                        <div key={dest.id} className="streaming-controls__dest">
                            <span className="streaming-controls__dest-icon">
                                {dest.platform === 'youtube' && '📺'}
                                {dest.platform === 'twitch' && '🎮'}
                                {dest.platform === 'custom' && '📡'}
                            </span>
                            <span className="streaming-controls__dest-name">{dest.name}</span>
                            <button
                                className="streaming-controls__dest-remove"
                                onClick={() => handleRemoveDestination(dest.id)}
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="streaming-controls__actions">
                {!isStreaming ? (
                    <button
                        className="streaming-controls__btn streaming-controls__btn--start"
                        onClick={handleStartStreaming}
                        disabled={destinations.length === 0}
                    >
                        🔴 Go Live
                    </button>
                ) : (
                    <button
                        className="streaming-controls__btn streaming-controls__btn--stop"
                        onClick={handleStopStreaming}
                    >
                        ⏹ End Stream
                    </button>
                )}
            </div>

            {/* Add Destination Modal */}
            {showAddModal && (
                <div className="streaming-controls__modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="streaming-controls__modal" onClick={e => e.stopPropagation()}>
                        <h3>Add Streaming Destination</h3>

                        <div className="streaming-controls__field">
                            <label>Platform</label>
                            <select
                                value={newPlatform}
                                onChange={e => setNewPlatform(e.target.value as any)}
                            >
                                <option value="youtube">YouTube</option>
                                <option value="twitch">Twitch</option>
                                <option value="custom">Custom RTMP</option>
                            </select>
                        </div>

                        {newPlatform === 'custom' && (
                            <div className="streaming-controls__field">
                                <label>RTMP URL</label>
                                <input
                                    type="text"
                                    placeholder="rtmp://..."
                                    value={customRtmpUrl}
                                    onChange={e => setCustomRtmpUrl(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="streaming-controls__field">
                            <label>Stream Key</label>
                            <input
                                type="password"
                                placeholder="Your stream key"
                                value={newStreamKey}
                                onChange={e => setNewStreamKey(e.target.value)}
                            />
                        </div>

                        <div className="streaming-controls__modal-actions">
                            <button onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button
                                className="streaming-controls__btn--primary"
                                onClick={handleAddDestination}
                                disabled={!newStreamKey || (newPlatform === 'custom' && !customRtmpUrl)}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

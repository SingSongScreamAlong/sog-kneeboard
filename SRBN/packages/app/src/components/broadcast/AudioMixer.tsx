// =====================================================================
// AudioMixer Component
// Audio source selection and volume controls
// =====================================================================

import { useState } from 'react';
import { useBroadcastStore } from '../../stores/broadcast.store';
import { useDriverStore } from '../../stores/driver.store';
import './AudioMixer.css';

interface AudioSource {
    id: string;
    name: string;
    type: 'world' | 'driver' | 'youtube' | 'commentary';
    icon: string;
}

export function AudioMixer() {
    const {
        masterVolume,
        setMasterVolume,
        youtubeUrl,
        setYoutubeUrl,
        driverAudioMuted,
        toggleDriverAudio,
        featuredDriverId
    } = useBroadcastStore();

    const { drivers } = useDriverStore();
    const [activeSource, setActiveSource] = useState<string>('world');
    const [showYoutubeInput, setShowYoutubeInput] = useState(false);
    const [youtubeInputValue, setYoutubeInputValue] = useState(youtubeUrl || '');

    // Available audio sources
    const sources: AudioSource[] = [
        { id: 'world', name: 'World Feed', type: 'world', icon: '🌐' },
        { id: 'youtube', name: 'YouTube Live', type: 'youtube', icon: '▶️' },
        { id: 'commentary', name: 'Commentary', type: 'commentary', icon: '🎙️' },
    ];

    // Get top drivers for driver audio sources
    const topDrivers = [...drivers]
        .sort((a, b) => a.position - b.position)
        .slice(0, 5);

    const handleYoutubeUrlSubmit = () => {
        setYoutubeUrl(youtubeInputValue || null);
        setShowYoutubeInput(false);
    };

    return (
        <div className="audio-mixer">
            <header className="mixer-header">
                <span className="mixer-title">🎧 AUDIO MIXER</span>
            </header>

            {/* Master Volume */}
            <div className="mixer-section">
                <div className="mixer-row mixer-row--master">
                    <span className="mixer-label">Master</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={masterVolume}
                        onChange={(e) => setMasterVolume(Number(e.target.value))}
                        className="mixer-slider"
                    />
                    <span className="mixer-value">{masterVolume}%</span>
                </div>
            </div>

            {/* Source Selection */}
            <div className="mixer-section">
                <div className="section-label">Audio Source</div>
                <div className="source-buttons">
                    {sources.map((source) => (
                        <button
                            key={source.id}
                            className={`source-btn ${activeSource === source.id ? 'source-btn--active' : ''} ${source.id === 'youtube' && !youtubeUrl ? 'source-btn--disabled' : ''}`}
                            onClick={() => {
                                if (source.id === 'youtube' && !youtubeUrl) {
                                    setShowYoutubeInput(true);
                                } else {
                                    setActiveSource(source.id);
                                }
                            }}
                        >
                            <span className="source-icon">{source.icon}</span>
                            <span className="source-name">{source.name}</span>
                            {source.id === 'youtube' && !youtubeUrl && (
                                <span className="source-setup">Setup</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* YouTube URL Input */}
            {showYoutubeInput && (
                <div className="mixer-section youtube-setup">
                    <div className="section-label">YouTube Live URL</div>
                    <div className="youtube-input-row">
                        <input
                            type="text"
                            placeholder="https://youtube.com/watch?v=..."
                            value={youtubeInputValue}
                            onChange={(e) => setYoutubeInputValue(e.target.value)}
                            className="youtube-input"
                        />
                        <button
                            className="btn btn--small btn--primary"
                            onClick={handleYoutubeUrlSubmit}
                        >
                            Save
                        </button>
                        <button
                            className="btn btn--small btn--ghost"
                            onClick={() => setShowYoutubeInput(false)}
                        >
                            Cancel
                        </button>
                    </div>
                    {youtubeUrl && (
                        <div className="youtube-status">
                            ✓ Connected: {youtubeUrl.substring(0, 40)}...
                        </div>
                    )}
                </div>
            )}

            {/* Driver Audio Channels */}
            <div className="mixer-section">
                <div className="section-label">Driver Onboards</div>
                <div className="driver-channels">
                    {topDrivers.map((driver) => {
                        const isMuted = driverAudioMuted[driver.id] ?? false;
                        const isFeatured = driver.id === featuredDriverId;

                        return (
                            <div
                                key={driver.id}
                                className={`driver-channel ${isFeatured ? 'driver-channel--featured' : ''}`}
                            >
                                <div className="channel-info">
                                    <span className="channel-pos">P{driver.position}</span>
                                    <span className="channel-name">{driver.name.split(' ').pop()}</span>
                                </div>
                                <button
                                    className={`mute-btn ${isMuted ? 'mute-btn--muted' : ''}`}
                                    onClick={() => toggleDriverAudio(driver.id)}
                                    title={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    {isMuted ? '🔇' : '🔊'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Active Source Indicator */}
            <div className="mixer-footer">
                <span className="active-source-label">Playing:</span>
                <span className="active-source-name">
                    {sources.find(s => s.id === activeSource)?.icon} {sources.find(s => s.id === activeSource)?.name}
                </span>
            </div>
        </div>
    );
}

// =====================================================================
// OutputPanel Component
// OBS connection status and stream/record controls
// =====================================================================

import { obsConnector, useOBSStore } from '../../services/OBSConnector';
import { useState } from 'react';
import './OutputPanel.css';

export function OutputPanel() {
    const {
        isConnected,
        isStreaming,
        isRecording,
        error,
        currentScene,
        scenes,
        droppedFrames,
        fps,
    } = useOBSStore();

    const [obsUrl, setObsUrl] = useState('ws://localhost:4455');

    const handleConnect = async () => {
        await obsConnector.connect(obsUrl);
    };

    const handleDisconnect = () => {
        obsConnector.disconnect();
    };

    return (
        <div className="output-panel">
            <header className="output-header">
                <span className="output-title">🎬 OUTPUT</span>
                <span className={`output-status ${isConnected ? 'output-status--connected' : ''}`}>
                    {isConnected ? 'OBS Connected' : 'Disconnected'}
                </span>
            </header>

            {/* Connection Controls */}
            <div className="output-connection">
                {!isConnected ? (
                    <>
                        <input
                            type="text"
                            value={obsUrl}
                            onChange={(e) => setObsUrl(e.target.value)}
                            placeholder="ws://localhost:4455"
                            className="obs-url-input"
                        />
                        <button
                            className="btn btn--primary"
                            onClick={handleConnect}
                        >
                            Connect
                        </button>
                    </>
                ) : (
                    <button
                        className="btn btn--secondary"
                        onClick={handleDisconnect}
                    >
                        Disconnect
                    </button>
                )}
            </div>

            {error && (
                <div className="output-error">{error}</div>
            )}

            {isConnected && (
                <>
                    {/* Stream/Record Controls */}
                    <div className="output-controls">
                        <button
                            className={`control-btn ${isStreaming ? 'control-btn--active control-btn--streaming' : ''}`}
                            onClick={() => isStreaming ? obsConnector.stopStreaming() : obsConnector.startStreaming()}
                        >
                            <span className="control-icon">{isStreaming ? '⏹' : '📡'}</span>
                            <span className="control-label">{isStreaming ? 'Stop Stream' : 'Start Stream'}</span>
                        </button>

                        <button
                            className={`control-btn ${isRecording ? 'control-btn--active control-btn--recording' : ''}`}
                            onClick={() => isRecording ? obsConnector.stopRecording() : obsConnector.startRecording()}
                        >
                            <span className="control-icon">{isRecording ? '⏹' : '⏺'}</span>
                            <span className="control-label">{isRecording ? 'Stop Record' : 'Start Record'}</span>
                        </button>
                    </div>

                    {/* Scene Selector */}
                    {scenes.length > 0 && (
                        <div className="output-scenes">
                            <div className="scenes-label">OBS Scene</div>
                            <div className="scenes-list">
                                {scenes.map(scene => (
                                    <button
                                        key={scene}
                                        className={`scene-btn ${currentScene === scene ? 'scene-btn--active' : ''}`}
                                        onClick={() => obsConnector.setCurrentScene(scene)}
                                    >
                                        {scene}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="output-stats">
                        <div className="stat">
                            <span className="stat-label">FPS</span>
                            <span className="stat-value">{fps}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Dropped</span>
                            <span className={`stat-value ${droppedFrames > 0 ? 'stat-value--warning' : ''}`}>
                                {droppedFrames}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

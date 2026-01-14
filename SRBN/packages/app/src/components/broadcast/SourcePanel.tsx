// =====================================================================
// Source Panel Component
// Displays available sources and allows adding new ones
// =====================================================================

import { useSourceManager, useConnectedSources } from '../../engine/SourceManager';
import './SourcePanel.css';

export function SourcePanel() {
    const { sources, addScreenCapture, addTestPattern, removeSource } = useSourceManager();
    const connectedSources = useConnectedSources();

    const handleAddScreenCapture = async () => {
        const source = await addScreenCapture();
        if (source) {
            console.log('✅ Screen capture added:', source.name);
        }
    };

    const handleAddTestPattern = () => {
        const source = addTestPattern();
        console.log('✅ Test pattern added:', source.name);
    };

    return (
        <div className="source-panel">
            <div className="source-panel__header">
                <span className="source-panel__title">SOURCES</span>
                <span className="source-panel__count">{connectedSources.length} active</span>
            </div>

            <div className="source-panel__actions">
                <button
                    className="source-panel__add-btn"
                    onClick={handleAddScreenCapture}
                    title="Add screen capture"
                >
                    🖥️ Screen
                </button>
                <button
                    className="source-panel__add-btn"
                    onClick={handleAddTestPattern}
                    title="Add test pattern"
                >
                    📺 Test Pattern
                </button>
            </div>

            <div className="source-panel__list">
                {sources.length === 0 ? (
                    <div className="source-panel__empty">
                        No sources added
                    </div>
                ) : (
                    sources.map(source => (
                        <div
                            key={source.id}
                            className={`source-panel__item source-panel__item--${source.status}`}
                        >
                            <div className="source-panel__item-preview">
                                {source.element ? (
                                    source.element instanceof HTMLCanvasElement ? (
                                        <canvas
                                            ref={(el) => {
                                                if (el && source.element instanceof HTMLCanvasElement) {
                                                    const ctx = el.getContext('2d');
                                                    ctx?.drawImage(source.element, 0, 0, el.width, el.height);
                                                }
                                            }}
                                            width={160}
                                            height={90}
                                        />
                                    ) : (
                                        <video
                                            ref={(el) => {
                                                if (el && source.element instanceof HTMLVideoElement) {
                                                    el.srcObject = source.element.srcObject;
                                                    el.muted = true;
                                                    el.play();
                                                }
                                            }}
                                            muted
                                            autoPlay
                                        />
                                    )
                                ) : (
                                    <div className="source-panel__item-placeholder">
                                        {source.type === 'screen' && '🖥️'}
                                        {source.type === 'test-pattern' && '📺'}
                                        {source.type === 'media' && '🎬'}
                                        {source.type === 'ndi' && '📡'}
                                    </div>
                                )}
                            </div>

                            <div className="source-panel__item-info">
                                <span className="source-panel__item-name">{source.name}</span>
                                <span className="source-panel__item-meta">
                                    {source.width}×{source.height} • {source.type}
                                </span>
                            </div>

                            <div className="source-panel__item-status">
                                <span className={`status-dot status-dot--${source.status}`} />
                            </div>

                            <button
                                className="source-panel__item-remove"
                                onClick={() => removeSource(source.id)}
                                title="Remove source"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

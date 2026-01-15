// =====================================================================
// AdvancedOptions Component
// Slide-out panel for advanced controls
// =====================================================================

import { useBroadcastStore } from '../../stores/broadcast.store';
import { SceneSwitcher } from '../broadcast/SceneSwitcher';
import { SourcePanel } from '../broadcast/SourcePanel';
import { AudioMixer } from '../broadcast/AudioMixer';
import { ReplayControls } from '../broadcast/ReplayControls';
import { OutputPanel } from '../broadcast/OutputPanel';
import './AdvancedOptions.css';

export function AdvancedOptions() {
    const {
        showAdvancedOptions,
        toggleAdvancedOptions,
        aiAggressiveness,
        setAIAggressiveness,
        cameraLocked,
        toggleCameraLock,
        overlayVerbosity,
        setOverlayVerbosity,
        delayMs,
        setDelay,
    } = useBroadcastStore();

    if (!showAdvancedOptions) return null;

    return (
        <div className="advanced-options advanced-options-overlay">
            {/* Header */}
            <header className="adv-header">
                <span className="adv-title">Advanced Options</span>
                <button className="btn btn--ghost btn--icon" onClick={toggleAdvancedOptions}>
                    ✕
                </button>
            </header>

            {/* AI Director Section */}
            <section className="adv-section">
                <h3 className="adv-section__title">AI Director</h3>

                <div className="adv-control">
                    <label className="adv-label">Aggressiveness</label>
                    <div className="adv-slider-row">
                        <input
                            type="range"
                            className="slider"
                            min="0"
                            max="100"
                            value={aiAggressiveness}
                            onChange={(e) => setAIAggressiveness(Number(e.target.value))}
                        />
                        <span className="slider-value">{aiAggressiveness}%</span>
                    </div>
                    <span className="adv-hint">
                        {aiAggressiveness < 30 ? 'Minimal suggestions' :
                            aiAggressiveness < 70 ? 'Balanced assistance' : 'Proactive direction'}
                    </span>
                </div>
            </section>

            {/* Audio Mixer Section */}
            <section className="adv-section">
                <h3 className="adv-section__title">Audio</h3>
                <AudioMixer />
            </section>

            {/* Camera Section */}
            <section className="adv-section">
                <h3 className="adv-section__title">Camera</h3>

                <div className="adv-control adv-toggle-row">
                    <label className="adv-label">Lock Camera</label>
                    <button
                        className={`toggle ${cameraLocked ? 'toggle--active' : ''}`}
                        onClick={toggleCameraLock}
                    />
                </div>
            </section>

            {/* Overlay Section */}
            <section className="adv-section">
                <h3 className="adv-section__title">Overlay</h3>

                <div className="adv-control">
                    <label className="adv-label">Verbosity</label>
                    <div className="adv-button-group">
                        {(['minimal', 'standard', 'detailed'] as const).map(level => (
                            <button
                                key={level}
                                className={`btn btn--secondary ${overlayVerbosity === level ? 'btn--active' : ''}`}
                                onClick={() => setOverlayVerbosity(level)}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Delay Section */}
            <section className="adv-section">
                <h3 className="adv-section__title">Broadcast Delay</h3>

                <div className="adv-control">
                    <div className="adv-button-group">
                        {[0, 10000, 30000, 60000, 120000].map(ms => (
                            <button
                                key={ms}
                                className={`btn btn--secondary ${delayMs === ms ? 'btn--active' : ''}`}
                                onClick={() => setDelay(ms)}
                            >
                                {ms === 0 ? 'LIVE' : `${ms / 1000}s`}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Replay Section */}
            <section className="adv-section">
                <h3 className="adv-section__title">Replay</h3>
                <ReplayControls />
            </section>

            {/* Broadcast Engine Controls */}
            <section className="adv-section">
                <h3 className="adv-section__title">Broadcast Engine</h3>

                <div className="adv-control-group">
                    <h4 className="adv-subtitle">Switcher</h4>
                    <SceneSwitcher />
                </div>

                <div className="adv-control-group">
                    <h4 className="adv-subtitle">Sources</h4>
                    <SourcePanel />
                </div>
            </section>

            {/* Output Section */}
            <section className="adv-section">
                <h3 className="adv-section__title">OBS Output</h3>
                <OutputPanel />
            </section>
        </div>
    );
}

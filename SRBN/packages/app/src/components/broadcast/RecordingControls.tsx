// =====================================================================
// Recording Controls Component
// Start/stop recording and manage outputs
// =====================================================================

import { useState } from 'react';
import { useOutputManager, downloadRecording } from '../../engine/OutputManager';
import { getCompositor } from '../../engine/Compositor';
import './RecordingControls.css';

export function RecordingControls() {
    const {
        outputs,
        encoder,
        startRecording,
        stopRecording,
        setEncoderSettings
    } = useOutputManager();

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

    const handleStartRecording = () => {
        const compositor = getCompositor();
        if (!compositor) {
            console.error('Compositor not initialized');
            return;
        }

        const stream = compositor.getStream(encoder.frameRate);
        startRecording(stream);
        setIsRecording(true);
        setRecordingTime(0);

        // Start timer
        const interval = setInterval(() => {
            setRecordingTime(t => t + 1);
        }, 1000);
        setTimerInterval(interval);
    };

    const handleStopRecording = async () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }

        const blob = await stopRecording();
        setIsRecording(false);

        if (blob) {
            // Auto-download the recording
            downloadRecording(blob);
        }
    };

    const formatTime = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const recordingOutput = outputs.find(o => o.type === 'recording');

    return (
        <div className="recording-controls">
            <div className="recording-controls__header">
                <span className="recording-controls__title">RECORDING</span>
                {isRecording && (
                    <span className="recording-controls__timer">
                        ● {formatTime(recordingTime)}
                    </span>
                )}
            </div>

            <div className="recording-controls__actions">
                {!isRecording ? (
                    <button
                        className="recording-controls__btn recording-controls__btn--record"
                        onClick={handleStartRecording}
                    >
                        ⏺ Start Recording
                    </button>
                ) : (
                    <button
                        className="recording-controls__btn recording-controls__btn--stop"
                        onClick={handleStopRecording}
                    >
                        ⏹ Stop Recording
                    </button>
                )}
            </div>

            <div className="recording-controls__settings">
                <div className="recording-controls__setting">
                    <label>Resolution</label>
                    <select
                        value={`${encoder.width}x${encoder.height}`}
                        onChange={(e) => {
                            const [w, h] = e.target.value.split('x').map(Number);
                            setEncoderSettings({ width: w, height: h });
                        }}
                    >
                        <option value="1920x1080">1920×1080 (1080p)</option>
                        <option value="1280x720">1280×720 (720p)</option>
                        <option value="2560x1440">2560×1440 (1440p)</option>
                    </select>
                </div>

                <div className="recording-controls__setting">
                    <label>Bitrate</label>
                    <select
                        value={encoder.bitrate}
                        onChange={(e) => setEncoderSettings({ bitrate: Number(e.target.value) })}
                    >
                        <option value="3000">3 Mbps</option>
                        <option value="6000">6 Mbps</option>
                        <option value="10000">10 Mbps</option>
                        <option value="15000">15 Mbps</option>
                    </select>
                </div>

                <div className="recording-controls__setting">
                    <label>Frame Rate</label>
                    <select
                        value={encoder.frameRate}
                        onChange={(e) => setEncoderSettings({ frameRate: Number(e.target.value) })}
                    >
                        <option value="30">30 fps</option>
                        <option value="60">60 fps</option>
                    </select>
                </div>
            </div>

            <div className="recording-controls__outputs">
                <div className="recording-controls__output-title">Outputs</div>
                {outputs.map(output => (
                    <div key={output.id} className="recording-controls__output">
                        <span className={`status-dot status-dot--${output.status}`} />
                        <span className="recording-controls__output-name">{output.name}</span>
                        <span className="recording-controls__output-status">{output.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =====================================================================
// Output Manager
// Manages recording and streaming outputs
// =====================================================================

import { create } from 'zustand';
import type { OutputDestination, OutputStatus, EncoderSettings } from './types';

interface OutputManagerState {
    outputs: OutputDestination[];
    encoder: EncoderSettings;
    previewEnabled: boolean;

    // Recording state
    mediaRecorder: MediaRecorder | null;
    recordedChunks: Blob[];

    // Actions
    addOutput: (output: Omit<OutputDestination, 'id' | 'status'>) => OutputDestination;
    removeOutput: (outputId: string) => void;
    setOutputStatus: (outputId: string, status: OutputStatus) => void;
    setEncoderSettings: (settings: Partial<EncoderSettings>) => void;

    // Recording
    startRecording: (stream: MediaStream) => void;
    stopRecording: () => Promise<Blob | null>;

    // Preview
    setPreviewEnabled: (enabled: boolean) => void;
}

const DEFAULT_ENCODER: EncoderSettings = {
    codec: 'h264',
    bitrate: 6000, // 6 Mbps
    width: 1920,
    height: 1080,
    frameRate: 60,
    keyframeInterval: 2,
};

export const useOutputManager = create<OutputManagerState>((set, get) => ({
    outputs: [
        {
            id: 'output-preview',
            name: 'Preview',
            type: 'preview',
            status: 'active',
        },
    ],
    encoder: DEFAULT_ENCODER,
    previewEnabled: true,
    mediaRecorder: null,
    recordedChunks: [],

    addOutput: (partialOutput) => {
        const output: OutputDestination = {
            ...partialOutput,
            id: `output-${Date.now()}`,
            status: 'stopped',
        };
        set(state => ({ outputs: [...state.outputs, output] }));
        return output;
    },

    removeOutput: (outputId) => {
        set(state => ({ outputs: state.outputs.filter(o => o.id !== outputId) }));
    },

    setOutputStatus: (outputId, status) => {
        set(state => ({
            outputs: state.outputs.map(o => o.id === outputId ? { ...o, status } : o),
        }));
    },

    setEncoderSettings: (settings) => {
        set(state => ({ encoder: { ...state.encoder, ...settings } }));
    },

    startRecording: (stream) => {
        const { encoder } = get();

        // Determine supported MIME type
        const mimeTypes = [
            'video/webm;codecs=h264',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
        ];

        let mimeType = '';
        for (const type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                mimeType = type;
                break;
            }
        }

        if (!mimeType) {
            console.error('No supported MIME type for recording');
            return;
        }

        const mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: encoder.bitrate * 1000,
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
                set({ recordedChunks: chunks });
            }
        };

        mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            get().setOutputStatus('output-recording', 'error');
        };

        mediaRecorder.start(1000); // Collect data every second

        // Add/update recording output
        const existingRecording = get().outputs.find(o => o.id === 'output-recording');
        if (!existingRecording) {
            get().addOutput({ name: 'Recording', type: 'recording' });
        }
        get().setOutputStatus('output-recording', 'active');

        set({ mediaRecorder, recordedChunks: [] });
        console.log('🔴 Recording started');
    },

    stopRecording: async () => {
        const { mediaRecorder, recordedChunks } = get();

        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            return null;
        }

        return new Promise((resolve) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
                set({ mediaRecorder: null, recordedChunks: [] });
                get().setOutputStatus('output-recording', 'stopped');
                console.log('⏹️ Recording stopped, size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
                resolve(blob);
            };

            mediaRecorder.stop();
        });
    },

    setPreviewEnabled: (enabled) => {
        set({ previewEnabled: enabled });
        get().setOutputStatus('output-preview', enabled ? 'active' : 'stopped');
    },
}));

/**
 * Download recorded video
 */
export function downloadRecording(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `broadcastbox-recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
}

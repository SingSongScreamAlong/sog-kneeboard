// =====================================================================
// Source Manager
// Manages video sources (screen capture, NDI, media files, etc.)
// =====================================================================

import { create } from 'zustand';
import type { VideoSource, SourceType, SourceStatus } from './types';

interface SourceManagerState {
    sources: VideoSource[];

    // Actions
    addSource: (source: Omit<VideoSource, 'id' | 'status'>) => VideoSource;
    removeSource: (sourceId: string) => void;
    updateSource: (sourceId: string, updates: Partial<VideoSource>) => void;
    setSourceStatus: (sourceId: string, status: SourceStatus) => void;
    getSource: (sourceId: string) => VideoSource | undefined;

    // Source creation helpers
    addScreenCapture: (name?: string) => Promise<VideoSource | null>;
    addTestPattern: (name?: string) => VideoSource;
    addMediaFile: (name: string, file: File) => Promise<VideoSource | null>;
}

export const useSourceManager = create<SourceManagerState>((set, get) => ({
    sources: [],

    addSource: (partialSource) => {
        const source: VideoSource = {
            ...partialSource,
            id: `source-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'disconnected',
        };
        set(state => ({ sources: [...state.sources, source] }));
        return source;
    },

    removeSource: (sourceId) => {
        const source = get().sources.find(s => s.id === sourceId);
        if (source?.element) {
            // Clean up media streams
            if (source.element instanceof HTMLVideoElement && source.element.srcObject) {
                const stream = source.element.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
        set(state => ({ sources: state.sources.filter(s => s.id !== sourceId) }));
    },

    updateSource: (sourceId, updates) => {
        set(state => ({
            sources: state.sources.map(s => s.id === sourceId ? { ...s, ...updates } : s),
        }));
    },

    setSourceStatus: (sourceId, status) => {
        set(state => ({
            sources: state.sources.map(s => s.id === sourceId ? { ...s, status } : s),
        }));
    },

    getSource: (sourceId) => {
        return get().sources.find(s => s.id === sourceId);
    },

    // Screen capture via getDisplayMedia
    addScreenCapture: async (name = 'Screen Capture') => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 60 },
                },
                audio: false,
            });

            const videoTrack = stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();

            const video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            video.autoplay = true;
            await video.play();

            const source = get().addSource({
                name,
                type: 'screen',
                width: settings.width || 1920,
                height: settings.height || 1080,
                frameRate: settings.frameRate || 60,
                element: video,
            });

            get().setSourceStatus(source.id, 'connected');

            // Handle stream ending (user clicks "Stop sharing")
            videoTrack.onended = () => {
                get().setSourceStatus(source.id, 'disconnected');
            };

            return source;
        } catch (error) {
            console.error('Screen capture failed:', error);
            return null;
        }
    },

    // Test pattern source
    addTestPattern: (name = 'Test Pattern') => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d')!;

        // Draw SMPTE color bars
        const colors = [
            '#C0C0C0', // Gray
            '#C0C000', // Yellow
            '#00C0C0', // Cyan
            '#00C000', // Green
            '#C000C0', // Magenta
            '#C00000', // Red
            '#0000C0', // Blue
        ];
        const barWidth = canvas.width / colors.length;
        colors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(i * barWidth, 0, barWidth, canvas.height * 0.67);
        });

        // Bottom section
        const bottomColors = ['#0000C0', '#000000', '#C000C0', '#000000', '#00C0C0', '#000000', '#C0C0C0'];
        bottomColors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(i * barWidth, canvas.height * 0.67, barWidth, canvas.height * 0.08);
        });

        // Black bar at bottom
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);

        // Add text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BROADCASTBOX TEST PATTERN', canvas.width / 2, canvas.height * 0.88);
        ctx.font = '24px monospace';
        ctx.fillText(`${canvas.width}x${canvas.height} @ 60fps`, canvas.width / 2, canvas.height * 0.94);

        const source = get().addSource({
            name,
            type: 'test-pattern',
            width: 1920,
            height: 1080,
            frameRate: 60,
            element: canvas,
        });

        get().setSourceStatus(source.id, 'connected');
        return source;
    },

    // Media file source
    addMediaFile: async (name, file) => {
        try {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.muted = true;
            video.loop = true;

            await new Promise<void>((resolve, reject) => {
                video.onloadedmetadata = () => resolve();
                video.onerror = () => reject(new Error('Failed to load video'));
            });

            await video.play();

            const source = get().addSource({
                name,
                type: 'media',
                width: video.videoWidth,
                height: video.videoHeight,
                frameRate: 30, // Approximate
                element: video,
            });

            get().setSourceStatus(source.id, 'connected');
            return source;
        } catch (error) {
            console.error('Media file load failed:', error);
            return null;
        }
    },
}));

// Selector hooks
export const useConnectedSources = () => {
    const { sources } = useSourceManager();
    return sources.filter(s => s.status === 'connected');
};

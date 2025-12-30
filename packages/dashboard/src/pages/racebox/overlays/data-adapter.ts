// =====================================================================
// Overlay Data Source Adapters (Week 10)
// Unified interface for live websocket and replay HTTP sources.
// =====================================================================

import { realtimeClient, type ThinTelemetryFrame } from '../../lib/realtime-client';
import type { SessionTiming, TimingEntry } from '@controlbox/common';

// =====================================================================
// Adapter Interface
// =====================================================================

export interface OverlayDataAdapter {
    mode: 'live' | 'replay';
    connect(sessionId: string): void;
    disconnect(): void;
    onTiming(callback: (timing: SessionTiming) => void): () => void;
    onFrame(callback: (frame: ThinTelemetryFrame) => void): () => void;
    isConnected(): boolean;
}

// =====================================================================
// Live Adapter (Websocket)
// =====================================================================

export class LiveDataAdapter implements OverlayDataAdapter {
    readonly mode = 'live' as const;
    private sessionId: string | null = null;
    private timingCallbacks = new Set<(timing: SessionTiming) => void>();
    private frameCallbacks = new Set<(frame: ThinTelemetryFrame) => void>();
    private unsubTiming: (() => void) | null = null;
    private unsubFrame: (() => void) | null = null;

    connect(sessionId: string): void {
        this.sessionId = sessionId;

        const broadcastClaims = {
            userId: 'overlay',
            orgId: 'broadcast',
            role: 'broadcast' as const,
            surfaces: ['racebox' as const],
            capabilities: ['racebox:overlay:view' as const],
            displayName: 'Overlay',
        };

        realtimeClient.connect(broadcastClaims, 'racebox');
        realtimeClient.subscribe(sessionId, 5);

        this.unsubTiming = realtimeClient.onTiming((timing) => {
            for (const cb of this.timingCallbacks) cb(timing);
        });

        this.unsubFrame = realtimeClient.onThinFrame((frame) => {
            for (const cb of this.frameCallbacks) cb(frame);
        });
    }

    disconnect(): void {
        if (this.sessionId) {
            realtimeClient.unsubscribe(this.sessionId);
        }
        this.unsubTiming?.();
        this.unsubFrame?.();
        this.sessionId = null;
    }

    onTiming(callback: (timing: SessionTiming) => void): () => void {
        this.timingCallbacks.add(callback);
        return () => this.timingCallbacks.delete(callback);
    }

    onFrame(callback: (frame: ThinTelemetryFrame) => void): () => void {
        this.frameCallbacks.add(callback);
        return () => this.frameCallbacks.delete(callback);
    }

    isConnected(): boolean {
        return realtimeClient.getStatus() === 'connected';
    }
}

// =====================================================================
// Replay Adapter (HTTP Polling)
// =====================================================================

export interface ReplayAdapterOptions {
    playbackRate: number;
    startMs: number;
    endMs: number;
}

export class ReplayDataAdapter implements OverlayDataAdapter {
    readonly mode = 'replay' as const;
    private sessionId: string | null = null;
    private options: ReplayAdapterOptions;
    private currentTimeMs = 0;
    private isPlaying = false;
    private intervalId: ReturnType<typeof setInterval> | null = null;

    private timingCallbacks = new Set<(timing: SessionTiming) => void>();
    private frameCallbacks = new Set<(frame: ThinTelemetryFrame) => void>();

    private timingCache: Map<number, SessionTiming> = new Map();
    private frameCache: ThinTelemetryFrame[] = [];

    constructor(options: Partial<ReplayAdapterOptions> = {}) {
        this.options = {
            playbackRate: options.playbackRate || 1,
            startMs: options.startMs || 0,
            endMs: options.endMs || 0,
        };
    }

    async connect(sessionId: string): Promise<void> {
        this.sessionId = sessionId;
        this.currentTimeMs = this.options.startMs;

        // Prefetch timing data for the window
        await this.fetchTimingWindow();

        this.startPlayback();
    }

    disconnect(): void {
        this.stopPlayback();
        this.sessionId = null;
        this.timingCache.clear();
        this.frameCache = [];
    }

    onTiming(callback: (timing: SessionTiming) => void): () => void {
        this.timingCallbacks.add(callback);
        return () => this.timingCallbacks.delete(callback);
    }

    onFrame(callback: (frame: ThinTelemetryFrame) => void): () => void {
        this.frameCallbacks.add(callback);
        return () => this.frameCallbacks.delete(callback);
    }

    isConnected(): boolean {
        return this.isPlaying;
    }

    // =====================================================================
    // Playback Control
    // =====================================================================

    private startPlayback(): void {
        if (this.isPlaying) return;
        this.isPlaying = true;

        // Emit at 10 fps visual rate, time advances by playbackRate
        const intervalMs = 100;
        const stepMs = intervalMs * this.options.playbackRate;

        this.intervalId = setInterval(() => {
            if (this.currentTimeMs >= this.options.endMs) {
                this.stopPlayback();
                return;
            }

            this.emitAtTime(this.currentTimeMs);
            this.currentTimeMs += stepMs;
        }, intervalMs);
    }

    private stopPlayback(): void {
        this.isPlaying = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private emitAtTime(timeMs: number): void {
        // Find nearest timing snapshot
        const snapshotTime = Math.floor(timeMs / 500) * 500; // 2Hz snapshots
        const timing = this.timingCache.get(snapshotTime);
        if (timing) {
            for (const cb of this.timingCallbacks) cb(timing);
        }

        // Find frames in this time window
        const frameWindowStart = timeMs - 50;
        const frameWindowEnd = timeMs + 50;
        const frames = this.frameCache.filter(
            f => f.timestamp >= frameWindowStart && f.timestamp < frameWindowEnd
        );
        for (const frame of frames) {
            for (const cb of this.frameCallbacks) cb(frame);
        }
    }

    // =====================================================================
    // Data Fetching
    // =====================================================================

    private async fetchTimingWindow(): Promise<void> {
        if (!this.sessionId) return;

        const windowSize = Math.min(60000, this.options.endMs - this.options.startMs);
        const fromMs = this.options.startMs;
        const toMs = this.options.startMs + windowSize;

        try {
            const res = await fetch(
                `/api/replay/sessions/${this.sessionId}/timing?fromMs=${fromMs}&toMs=${toMs}`
            );
            if (!res.ok) return;

            const json = await res.json();
            const snapshots = json.data?.snapshots || [];

            for (const snap of snapshots) {
                const time = new Date(snap.timestamp).getTime();
                this.timingCache.set(time, this.snapshotToTiming(snap));
            }
        } catch (err) {
            console.error('Failed to fetch timing window:', err);
        }
    }

    private snapshotToTiming(snap: Record<string, unknown>): SessionTiming {
        // Convert DB snapshot to SessionTiming format
        return {
            sessionId: snap.session_id as string,
            entries: (snap.entries as TimingEntry[]) || [],
            sessionState: 'racing',
            sessionTimeElapsed: (snap.session_time_ms as number) / 1000,
            sessionTimeRemaining: -1,
            lapsRemaining: -1,
            leaderId: '',
            fastestLap: { driverId: '', time: 0, lap: 0 },
            timestamp: new Date(snap.timestamp as string).getTime(),
        };
    }

    // =====================================================================
    // Public Controls
    // =====================================================================

    seek(timeMs: number): void {
        this.currentTimeMs = Math.max(this.options.startMs, Math.min(timeMs, this.options.endMs));
    }

    setPlaybackRate(rate: number): void {
        if ([1, 2, 5, 10].includes(rate)) {
            this.options.playbackRate = rate;
        }
    }

    getCurrentTime(): number {
        return this.currentTimeMs;
    }
}

// =====================================================================
// Factory
// =====================================================================

export interface OverlaySourceParams {
    mode: 'live' | 'replay';
    playbackRate?: number;
    startMs?: number;
    endMs?: number;
}

export function createDataAdapter(params: OverlaySourceParams): OverlayDataAdapter {
    if (params.mode === 'replay') {
        return new ReplayDataAdapter({
            playbackRate: params.playbackRate || 1,
            startMs: params.startMs || 0,
            endMs: params.endMs || 0,
        });
    }
    return new LiveDataAdapter();
}

/**
 * Parse overlay source params from URL search params.
 */
export function parseSourceParams(searchParams: URLSearchParams): OverlaySourceParams {
    return {
        mode: (searchParams.get('mode') as 'live' | 'replay') || 'live',
        playbackRate: parseInt(searchParams.get('playbackRate') || '1', 10),
        startMs: parseInt(searchParams.get('startMs') || '0', 10),
        endMs: parseInt(searchParams.get('endMs') || '0', 10),
    };
}

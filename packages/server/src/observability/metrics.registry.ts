// =====================================================================
// Realtime Metrics Registry (Week 5)
// In-memory metrics for realtime telemetry flow observability.
// =====================================================================

// =====================================================================
// Types
// =====================================================================

export interface RealtimeMetrics {
    // Session/connection counts
    activeSessions: number;
    activeSocketsByRole: Record<string, number>;
    activeSocketsBySurface: Record<string, number>;

    // Throughput (per second, rolling 10s window)
    telemetryFramesInPerSec: number;
    telemetryFramesOutPerSec: number;
    droppedFramesPerSec: number;
    droppedFramesByReason: Record<string, number>;

    // Subscription state
    activeBursts: number;
    fatFrameGrants: number;
    totalSubscriptions: number;

    // Latency (milliseconds)
    latencyP50Ms: number;
    latencyP95Ms: number;
    latencyP99Ms: number;

    // Uptime
    uptimeMs: number;
    startedAt: number;
}

export interface DropReason {
    reason: 'rate_limited' | 'dedupe' | 'out_of_order' | 'no_subscription';
}

// =====================================================================
// Rolling Window Tracker
// =====================================================================

class RollingCounter {
    private timestamps: number[] = [];
    private windowMs: number;

    constructor(windowMs: number = 10_000) {
        this.windowMs = windowMs;
    }

    increment(): void {
        this.timestamps.push(Date.now());
        this.cleanup();
    }

    getCount(): number {
        this.cleanup();
        return this.timestamps.length;
    }

    getPerSecond(): number {
        return this.getCount() / (this.windowMs / 1000);
    }

    private cleanup(): void {
        const cutoff = Date.now() - this.windowMs;
        while (this.timestamps.length > 0 && this.timestamps[0] < cutoff) {
            this.timestamps.shift();
        }
    }
}

// =====================================================================
// Latency Tracker (percentiles)
// =====================================================================

class LatencyTracker {
    private samples: number[] = [];
    private maxSamples: number = 1000;

    record(latencyMs: number): void {
        this.samples.push(latencyMs);
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
    }

    getPercentile(p: number): number {
        if (this.samples.length === 0) return 0;

        const sorted = [...this.samples].sort((a, b) => a - b);
        const index = Math.floor((p / 100) * sorted.length);
        return sorted[index] ?? 0;
    }

    getP50(): number { return this.getPercentile(50); }
    getP95(): number { return this.getPercentile(95); }
    getP99(): number { return this.getPercentile(99); }
}

// =====================================================================
// Metrics Registry Singleton
// =====================================================================

class MetricsRegistry {
    private startedAt: number = Date.now();

    // Counters
    private framesIn = new RollingCounter(10_000);
    private framesOut = new RollingCounter(10_000);
    private droppedFrames = new RollingCounter(10_000);
    private droppedByReason: Record<string, RollingCounter> = {};

    // Latency
    private latency = new LatencyTracker();

    // Snapshot values (updated externally)
    private _activeSessions = 0;
    private _socketsByRole: Record<string, number> = {};
    private _socketsBySurface: Record<string, number> = {};
    private _activeBursts = 0;
    private _fatFrameGrants = 0;
    private _totalSubscriptions = 0;

    // Readiness flags
    private _websocketReady = false;
    private _subscriptionRegistryReady = false;
    private _timingGeneratorReady = false;
    private _startupError: string | null = null;

    // =====================================================================
    // Record Methods
    // =====================================================================

    recordFrameIn(): void {
        this.framesIn.increment();
    }

    recordFrameOut(): void {
        this.framesOut.increment();
    }

    recordDrop(reason: string): void {
        this.droppedFrames.increment();
        if (!this.droppedByReason[reason]) {
            this.droppedByReason[reason] = new RollingCounter(10_000);
        }
        this.droppedByReason[reason].increment();
    }

    recordLatency(relayReceiveMs: number, emitMs: number): void {
        const latencyMs = emitMs - relayReceiveMs;
        if (latencyMs > 0 && latencyMs < 60_000) {  // Sanity check
            this.latency.record(latencyMs);
        }
    }

    // =====================================================================
    // Update Snapshot Values
    // =====================================================================

    updateSessionCount(count: number): void {
        this._activeSessions = count;
    }

    updateSocketCounts(byRole: Record<string, number>, bySurface: Record<string, number>): void {
        this._socketsByRole = byRole;
        this._socketsBySurface = bySurface;
    }

    updateSubscriptionStats(bursts: number, fatGrants: number, total: number): void {
        this._activeBursts = bursts;
        this._fatFrameGrants = fatGrants;
        this._totalSubscriptions = total;
    }

    // =====================================================================
    // Readiness
    // =====================================================================

    setWebsocketReady(ready: boolean): void {
        this._websocketReady = ready;
    }

    setSubscriptionRegistryReady(ready: boolean): void {
        this._subscriptionRegistryReady = ready;
    }

    setTimingGeneratorReady(ready: boolean): void {
        this._timingGeneratorReady = ready;
    }

    setStartupError(error: string | null): void {
        this._startupError = error;
    }

    isReady(): { ready: boolean; reason?: string } {
        if (this._startupError) {
            return { ready: false, reason: `startup_error: ${this._startupError}` };
        }
        if (!this._websocketReady) {
            return { ready: false, reason: 'websocket_not_ready' };
        }
        if (!this._subscriptionRegistryReady) {
            return { ready: false, reason: 'subscription_registry_not_ready' };
        }
        if (!this._timingGeneratorReady) {
            return { ready: false, reason: 'timing_generator_not_ready' };
        }
        return { ready: true };
    }

    // =====================================================================
    // Get Metrics
    // =====================================================================

    getMetrics(): RealtimeMetrics {
        const droppedByReason: Record<string, number> = {};
        for (const [reason, counter] of Object.entries(this.droppedByReason)) {
            droppedByReason[reason] = counter.getPerSecond();
        }

        return {
            activeSessions: this._activeSessions,
            activeSocketsByRole: { ...this._socketsByRole },
            activeSocketsBySurface: { ...this._socketsBySurface },
            telemetryFramesInPerSec: Number(this.framesIn.getPerSecond().toFixed(2)),
            telemetryFramesOutPerSec: Number(this.framesOut.getPerSecond().toFixed(2)),
            droppedFramesPerSec: Number(this.droppedFrames.getPerSecond().toFixed(2)),
            droppedFramesByReason: droppedByReason,
            activeBursts: this._activeBursts,
            fatFrameGrants: this._fatFrameGrants,
            totalSubscriptions: this._totalSubscriptions,
            latencyP50Ms: Number(this.latency.getP50().toFixed(2)),
            latencyP95Ms: Number(this.latency.getP95().toFixed(2)),
            latencyP99Ms: Number(this.latency.getP99().toFixed(2)),
            uptimeMs: Date.now() - this.startedAt,
            startedAt: this.startedAt,
        };
    }
}

// =====================================================================
// Singleton Export
// =====================================================================

export const metricsRegistry = new MetricsRegistry();

// =====================================================================
// Periodic Logging (every 10 seconds)
// =====================================================================

let loggingInterval: NodeJS.Timeout | null = null;

export function startMetricsLogging(): void {
    if (loggingInterval) return;

    loggingInterval = setInterval(() => {
        const m = metricsRegistry.getMetrics();
        console.log(
            `📊 METRICS | sessions=${m.activeSessions} | ` +
            `in=${m.telemetryFramesInPerSec}/s | out=${m.telemetryFramesOutPerSec}/s | ` +
            `dropped=${m.droppedFramesPerSec}/s | bursts=${m.activeBursts} | ` +
            `p50=${m.latencyP50Ms}ms p95=${m.latencyP95Ms}ms p99=${m.latencyP99Ms}ms`
        );
    }, 10_000);

    console.log('📊 Metrics logging started (10s interval)');
}

export function stopMetricsLogging(): void {
    if (loggingInterval) {
        clearInterval(loggingInterval);
        loggingInterval = null;
    }
}

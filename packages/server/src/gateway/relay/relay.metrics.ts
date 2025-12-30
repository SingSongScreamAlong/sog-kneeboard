// =====================================================================
// Relay Metrics (Week 1)
// In-memory per-session counters and observability.
// =====================================================================

import type { RelaySessionMetrics, RelaySession } from './relay.types.js';

// Ring buffer size for FPS calculation (5 seconds at 60fps = 300 samples)
const FPS_WINDOW_SIZE = 300;
const FPS_WINDOW_MS = 5000;

// In-memory registries
const sessionRegistry = new Map<string, RelaySession>();
const metricsRegistry = new Map<string, RelaySessionMetrics>();

// =====================================================================
// Session Registry
// =====================================================================

export function getSession(sessionId: string): RelaySession | undefined {
    return sessionRegistry.get(sessionId);
}

export function setSession(session: RelaySession): void {
    sessionRegistry.set(session.sessionId, session);
}

export function getAllSessions(): RelaySession[] {
    return Array.from(sessionRegistry.values());
}

export function removeSession(sessionId: string): void {
    sessionRegistry.delete(sessionId);
    metricsRegistry.delete(sessionId);
}

// =====================================================================
// Metrics Registry
// =====================================================================

export function getMetrics(sessionId: string): RelaySessionMetrics | undefined {
    return metricsRegistry.get(sessionId);
}

export function getOrCreateMetrics(sessionId: string): RelaySessionMetrics {
    let metrics = metricsRegistry.get(sessionId);
    if (!metrics) {
        metrics = {
            sessionId,
            framesReceivedTotal: 0,
            frameTimestamps: [],
            lastRelayTimestamp: null,
            lastSessionTimeMs: null,
            lastReceivedAtMs: null,
            connectedRelaySockets: 0,
        };
        metricsRegistry.set(sessionId, metrics);
    }
    return metrics;
}

export function recordFrame(
    sessionId: string,
    relayTimestamp: number,
    sessionTimeMs: number | null,
    receivedAtMs: number
): void {
    const metrics = getOrCreateMetrics(sessionId);

    metrics.framesReceivedTotal++;
    metrics.lastRelayTimestamp = relayTimestamp;
    metrics.lastSessionTimeMs = sessionTimeMs;
    metrics.lastReceivedAtMs = receivedAtMs;

    // Add to ring buffer for FPS calculation
    metrics.frameTimestamps.push(receivedAtMs);
    if (metrics.frameTimestamps.length > FPS_WINDOW_SIZE) {
        metrics.frameTimestamps.shift();
    }
}

export function incrementConnectedSockets(sessionId: string): void {
    const metrics = getOrCreateMetrics(sessionId);
    metrics.connectedRelaySockets++;
}

export function decrementConnectedSockets(sessionId: string): void {
    const metrics = getOrCreateMetrics(sessionId);
    metrics.connectedRelaySockets = Math.max(0, metrics.connectedRelaySockets - 1);
}

// =====================================================================
// Calculated Metrics
// =====================================================================

export function calculateFramesPerSecond(sessionId: string): number {
    const metrics = metricsRegistry.get(sessionId);
    if (!metrics || metrics.frameTimestamps.length < 2) {
        return 0;
    }

    const now = Date.now();
    const windowStart = now - FPS_WINDOW_MS;

    // Count frames in the last 5 seconds
    const recentFrames = metrics.frameTimestamps.filter(ts => ts >= windowStart);
    if (recentFrames.length < 2) {
        return 0;
    }

    // Calculate FPS
    const timeSpan = recentFrames[recentFrames.length - 1] - recentFrames[0];
    if (timeSpan <= 0) {
        return 0;
    }

    return (recentFrames.length - 1) / (timeSpan / 1000);
}

// =====================================================================
// Export All Metrics (for HTTP endpoint)
// =====================================================================

export interface RelayMetricsSnapshot {
    sessionId: string;
    framesReceivedTotal: number;
    framesPerSecond: number;
    lastRelayTimestamp: number | null;
    lastSessionTimeMs: number | null;
    lastReceivedAtMs: number | null;
    connectedRelaySockets: number;
    sessionCreatedAt: number | null;
}

export function getAllMetrics(): RelayMetricsSnapshot[] {
    const result: RelayMetricsSnapshot[] = [];

    for (const [sessionId, metrics] of metricsRegistry) {
        const session = sessionRegistry.get(sessionId);
        result.push({
            sessionId,
            framesReceivedTotal: metrics.framesReceivedTotal,
            framesPerSecond: Math.round(calculateFramesPerSecond(sessionId) * 10) / 10,
            lastRelayTimestamp: metrics.lastRelayTimestamp,
            lastSessionTimeMs: metrics.lastSessionTimeMs,
            lastReceivedAtMs: metrics.lastReceivedAtMs,
            connectedRelaySockets: metrics.connectedRelaySockets,
            sessionCreatedAt: session?.createdAt ?? null,
        });
    }

    return result;
}

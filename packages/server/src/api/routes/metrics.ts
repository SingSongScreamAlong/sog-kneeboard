// =====================================================================
// Prometheus Metrics (Week 12)
// Lightweight metrics for observability.
// =====================================================================

import { Router, type Request, type Response } from 'express';

// =====================================================================
// Metrics Storage
// =====================================================================

interface Metrics {
    wsConnectionsActive: number;
    telemetryFramesIngested: number;
    telemetryFramesEmitted: Record<string, number>;
    subscriptionDenied: Record<string, number>;
    policyDenied: Record<string, number>;
    replayReads: number;
    highlightsCreated: number;
    socialExports: number;
    httpRequestsTotal: Record<string, number>;
    httpRequestDurationMs: number[];
}

const metrics: Metrics = {
    wsConnectionsActive: 0,
    telemetryFramesIngested: 0,
    telemetryFramesEmitted: {},
    subscriptionDenied: {},
    policyDenied: {},
    replayReads: 0,
    highlightsCreated: 0,
    socialExports: 0,
    httpRequestsTotal: {},
    httpRequestDurationMs: [],
};

// =====================================================================
// Metric Recording Functions
// =====================================================================

export function incWsConnections(): void {
    metrics.wsConnectionsActive++;
}

export function decWsConnections(): void {
    metrics.wsConnectionsActive = Math.max(0, metrics.wsConnectionsActive - 1);
}

export function incFramesIngested(count = 1): void {
    metrics.telemetryFramesIngested += count;
}

export function incFramesEmitted(role: string, count = 1): void {
    metrics.telemetryFramesEmitted[role] = (metrics.telemetryFramesEmitted[role] || 0) + count;
}

export function incSubscriptionDenied(reason: string): void {
    metrics.subscriptionDenied[reason] = (metrics.subscriptionDenied[reason] || 0) + 1;
}

export function incPolicyDenied(reason: string): void {
    metrics.policyDenied[reason] = (metrics.policyDenied[reason] || 0) + 1;
}

export function incReplayReads(): void {
    metrics.replayReads++;
}

export function incHighlightsCreated(): void {
    metrics.highlightsCreated++;
}

export function incSocialExports(): void {
    metrics.socialExports++;
}

export function recordHttpRequest(method: string, path: string, durationMs: number): void {
    const key = `${method}_${path}`;
    metrics.httpRequestsTotal[key] = (metrics.httpRequestsTotal[key] || 0) + 1;
    metrics.httpRequestDurationMs.push(durationMs);

    // Keep only last 1000 durations for percentile calculation
    if (metrics.httpRequestDurationMs.length > 1000) {
        metrics.httpRequestDurationMs.shift();
    }
}

// =====================================================================
// Percentile Calculation
// =====================================================================

function percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}

// =====================================================================
// Prometheus Format Output
// =====================================================================

function formatMetrics(): string {
    const lines: string[] = [];

    // Gauge: active connections
    lines.push('# HELP ws_connections_active Current WebSocket connections');
    lines.push('# TYPE ws_connections_active gauge');
    lines.push(`ws_connections_active ${metrics.wsConnectionsActive}`);

    // Counter: frames ingested
    lines.push('# HELP telemetry_frames_ingested_total Total frames ingested');
    lines.push('# TYPE telemetry_frames_ingested_total counter');
    lines.push(`telemetry_frames_ingested_total ${metrics.telemetryFramesIngested}`);

    // Counter: frames emitted by role
    lines.push('# HELP telemetry_frames_emitted_total Frames emitted by role');
    lines.push('# TYPE telemetry_frames_emitted_total counter');
    for (const [role, count] of Object.entries(metrics.telemetryFramesEmitted)) {
        lines.push(`telemetry_frames_emitted_total{role="${role}"} ${count}`);
    }

    // Counter: subscription denied
    lines.push('# HELP subscription_denied_total Denied subscriptions');
    lines.push('# TYPE subscription_denied_total counter');
    for (const [reason, count] of Object.entries(metrics.subscriptionDenied)) {
        lines.push(`subscription_denied_total{reason="${reason}"} ${count}`);
    }

    // Counter: policy denied
    lines.push('# HELP policy_denied_total Denied policy checks');
    lines.push('# TYPE policy_denied_total counter');
    for (const [reason, count] of Object.entries(metrics.policyDenied)) {
        lines.push(`policy_denied_total{reason="${reason}"} ${count}`);
    }

    // Counter: replay reads
    lines.push('# HELP replay_reads_total Total replay reads');
    lines.push('# TYPE replay_reads_total counter');
    lines.push(`replay_reads_total ${metrics.replayReads}`);

    // Counter: highlights created
    lines.push('# HELP highlights_created_total Total highlights created');
    lines.push('# TYPE highlights_created_total counter');
    lines.push(`highlights_created_total ${metrics.highlightsCreated}`);

    // Counter: social exports
    lines.push('# HELP social_exports_total Total social exports');
    lines.push('# TYPE social_exports_total counter');
    lines.push(`social_exports_total ${metrics.socialExports}`);

    // Histogram: request duration
    const p50 = percentile(metrics.httpRequestDurationMs, 50);
    const p95 = percentile(metrics.httpRequestDurationMs, 95);
    const p99 = percentile(metrics.httpRequestDurationMs, 99);
    lines.push('# HELP http_request_duration_ms Request duration in milliseconds');
    lines.push('# TYPE http_request_duration_ms summary');
    lines.push(`http_request_duration_ms{quantile="0.5"} ${p50}`);
    lines.push(`http_request_duration_ms{quantile="0.95"} ${p95}`);
    lines.push(`http_request_duration_ms{quantile="0.99"} ${p99}`);

    return lines.join('\n');
}

// =====================================================================
// Router
// =====================================================================

export const metricsRouter = Router();

metricsRouter.get('/', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(formatMetrics());
});

// =====================================================================
// Export
// =====================================================================

export const metricsCollector = {
    incWsConnections,
    decWsConnections,
    incFramesIngested,
    incFramesEmitted,
    incSubscriptionDenied,
    incPolicyDenied,
    incReplayReads,
    incHighlightsCreated,
    incSocialExports,
    recordHttpRequest,
};

// =====================================================================
// Subscription Rate Clamping Tests (Week 2)
// =====================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
    clampRate,
    createSubscription,
    getSubscription,
    getSubscriptionsForSocket,
    removeSubscriptionsForSocket,
    canEscalate,
    cleanupExpiredBursts,
    shouldEmit,
    updateLastEmit,
} from '../gateway/subscriptions/subscription.registry.js';
import {
    BASELINE_RATES,
    BURST_MAX_RATES,
    BURST_CONFIG,
    type TelemetryRole,
} from '../gateway/subscriptions/subscription.types.js';

describe('clampRate', () => {
    it('clamps driver to 60 Hz baseline', () => {
        expect(clampRate(100, 'driver', false)).toBe(60);
        expect(clampRate(60, 'driver', false)).toBe(60);
        expect(clampRate(30, 'driver', false)).toBe(30);
    });

    it('clamps team to 20 Hz baseline, 30 Hz burst', () => {
        expect(clampRate(100, 'team', false)).toBe(20);
        expect(clampRate(100, 'team', true)).toBe(30);
        expect(clampRate(15, 'team', false)).toBe(15);
    });

    it('clamps race_control to 10 Hz baseline, 30 Hz burst', () => {
        expect(clampRate(60, 'race_control', false)).toBe(10);
        expect(clampRate(60, 'race_control', true)).toBe(30);
    });

    it('clamps broadcast to 5 Hz baseline, 20 Hz burst', () => {
        expect(clampRate(60, 'broadcast', false)).toBe(5);
        expect(clampRate(60, 'broadcast', true)).toBe(20);
    });

    it('handles invalid input by returning baseline', () => {
        expect(clampRate(0, 'team', false)).toBe(BASELINE_RATES.team);
        expect(clampRate(-10, 'team', false)).toBe(BASELINE_RATES.team);
        expect(clampRate(NaN, 'team', false)).toBe(BASELINE_RATES.team);
        expect(clampRate(Infinity, 'team', false)).toBe(BASELINE_RATES.team);
    });

    it('respects all role baseline rates', () => {
        const roles: TelemetryRole[] = ['driver', 'team', 'race_control', 'broadcast'];
        for (const role of roles) {
            expect(clampRate(1000, role, false)).toBe(BASELINE_RATES[role]);
        }
    });

    it('respects all role burst max rates', () => {
        const roles: TelemetryRole[] = ['driver', 'team', 'race_control', 'broadcast'];
        for (const role of roles) {
            expect(clampRate(1000, role, true)).toBe(BURST_MAX_RATES[role]);
        }
    });
});

describe('canEscalate', () => {
    it('allows team for incident_involvement', () => {
        const result = canEscalate('socket1', 'driver1', 'team', 'incident_involvement');
        expect(result.allowed).toBe(true);
    });

    it('denies broadcast for incident_involvement', () => {
        const result = canEscalate('socket1', 'driver1', 'broadcast', 'incident_involvement');
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('not eligible');
    });

    it('allows broadcast for director_focus', () => {
        const result = canEscalate('socket1', 'driver1', 'broadcast', 'director_focus');
        expect(result.allowed).toBe(true);
    });

    it('denies team for steward_focus', () => {
        const result = canEscalate('socket1', 'driver1', 'team', 'steward_focus');
        expect(result.allowed).toBe(false);
    });

    it('allows race_control for steward_focus', () => {
        const result = canEscalate('socket1', 'driver1', 'race_control', 'steward_focus');
        expect(result.allowed).toBe(true);
    });
});

describe('subscription lifecycle', () => {
    const socketId = 'test-socket-123';
    const sessionId = 'test-session-456';

    beforeEach(() => {
        // Clean up before each test
        removeSubscriptionsForSocket(socketId);
    });

    it('creates subscription with clamped rate', () => {
        const sub = createSubscription({
            socketId,
            sessionId,
            driverId: null,
            event: 'telemetry:frame',
            requestedRateHz: 100,
            role: 'team',
            surface: 'blackbox',
        });

        expect(sub.requestedRateHz).toBe(100);
        expect(sub.actualRateHz).toBe(20);  // Clamped to team baseline
        expect(sub.isBurst).toBe(false);
        expect(sub.expiresAtMs).toBeNull();
    });

    it('creates burst subscription with expiration', () => {
        const sub = createSubscription({
            socketId,
            sessionId,
            driverId: 'driver1',
            event: 'telemetry:frame',
            requestedRateHz: 60,
            role: 'team',
            surface: 'blackbox',
            isBurst: true,
            durationMs: 15_000,
        });

        expect(sub.actualRateHz).toBe(30);  // Burst max for team
        expect(sub.isBurst).toBe(true);
        expect(sub.expiresAtMs).not.toBeNull();
        expect(sub.expiresAtMs! - Date.now()).toBeLessThanOrEqual(15_000);
    });

    it('caps burst duration to max', () => {
        const sub = createSubscription({
            socketId,
            sessionId,
            driverId: 'driver1',
            event: 'telemetry:frame',
            requestedRateHz: 30,
            role: 'race_control',
            surface: 'controlbox',
            isBurst: true,
            durationMs: 60_000,  // Requested 60s
        });

        // Should be capped to 30s
        const duration = sub.expiresAtMs! - Date.now();
        expect(duration).toBeLessThanOrEqual(BURST_CONFIG.maxDurationMs);
    });

    it('retrieves subscription by ID', () => {
        const sub = createSubscription({
            socketId,
            sessionId,
            driverId: null,
            event: 'telemetry:timing',
            requestedRateHz: 2,
            role: 'broadcast',
            surface: 'racebox',
        });

        const retrieved = getSubscription(sub.id);
        expect(retrieved).toBeDefined();
        expect(retrieved!.id).toBe(sub.id);
    });

    it('retrieves subscriptions by socket', () => {
        createSubscription({
            socketId,
            sessionId,
            driverId: null,
            event: 'telemetry:frame',
            requestedRateHz: 10,
            role: 'team',
            surface: 'blackbox',
        });

        createSubscription({
            socketId,
            sessionId,
            driverId: 'driver1',
            event: 'telemetry:timing',
            requestedRateHz: 2,
            role: 'team',
            surface: 'blackbox',
        });

        const subs = getSubscriptionsForSocket(socketId);
        expect(subs.length).toBe(2);
    });

    it('cleans up subscriptions on disconnect', () => {
        createSubscription({
            socketId,
            sessionId,
            driverId: null,
            event: 'telemetry:frame',
            requestedRateHz: 10,
            role: 'team',
            surface: 'blackbox',
        });

        const removed = removeSubscriptionsForSocket(socketId);
        expect(removed).toBe(1);

        const subs = getSubscriptionsForSocket(socketId);
        expect(subs.length).toBe(0);
    });
});

describe('shouldEmit', () => {
    const socketId = 'emit-test-socket';
    const sessionId = 'emit-test-session';

    beforeEach(() => {
        removeSubscriptionsForSocket(socketId);
    });

    it('allows first emit immediately', () => {
        const sub = createSubscription({
            socketId,
            sessionId,
            driverId: null,
            event: 'telemetry:frame',
            requestedRateHz: 10,
            role: 'team',
            surface: 'blackbox',
        });

        expect(shouldEmit(sub)).toBe(true);
    });

    it('respects rate limit after emit', async () => {
        const sub = createSubscription({
            socketId,
            sessionId,
            driverId: null,
            event: 'telemetry:frame',
            requestedRateHz: 10,  // 100ms interval
            role: 'team',
            surface: 'blackbox',
        });

        updateLastEmit(sub.id);
        expect(shouldEmit(sub)).toBe(false);

        // Wait for interval to pass
        await new Promise(r => setTimeout(r, 110));
        expect(shouldEmit(sub)).toBe(true);
    });
});

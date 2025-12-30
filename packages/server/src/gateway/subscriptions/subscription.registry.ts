// =====================================================================
// Subscription Registry (Week 2)
// In-memory registry for active subscriptions and burst states.
// =====================================================================

import { randomUUID } from 'crypto';
import type {
    ActiveSubscription,
    BurstCooldown,
    FatFrameGrant,
    TelemetryRole,
    Surface,
    BurstTrigger,
} from './subscription.types.js';
import {
    BASELINE_RATES,
    BURST_MAX_RATES,
    BURST_CONFIG,
    TRIGGER_ALLOWED_ROLES,
} from './subscription.types.js';

// =====================================================================
// In-Memory Registries
// =====================================================================

const subscriptions = new Map<string, ActiveSubscription>();  // Key: subscription.id
const burstCooldowns = new Map<string, BurstCooldown>();      // Key: `${socketId}:${driverId}`
const fatFrameGrants = new Map<string, FatFrameGrant>();      // Key: `${socketId}:${driverId}`

// Indexes for fast lookup
const subscriptionsBySocket = new Map<string, Set<string>>();  // socketId → subscription IDs
const subscriptionsBySession = new Map<string, Set<string>>(); // sessionId → subscription IDs

// =====================================================================
// Subscription CRUD
// =====================================================================

export function createSubscription(params: {
    socketId: string;
    sessionId: string;
    driverId: string | null;
    event: 'telemetry:frame' | 'telemetry:timing';
    requestedRateHz: number;
    role: TelemetryRole;
    surface: Surface;
    isBurst?: boolean;
    durationMs?: number;
}): ActiveSubscription {
    const now = Date.now();
    const actualRateHz = clampRate(params.requestedRateHz, params.role, params.isBurst ?? false);

    const subscription: ActiveSubscription = {
        id: randomUUID(),
        socketId: params.socketId,
        sessionId: params.sessionId,
        driverId: params.driverId,
        event: params.event,
        requestedRateHz: params.requestedRateHz,
        actualRateHz,
        role: params.role,
        surface: params.surface,
        isBurst: params.isBurst ?? false,
        expiresAtMs: params.durationMs ? now + Math.min(params.durationMs, BURST_CONFIG.maxDurationMs) : null,
        createdAtMs: now,
        lastEmitMs: 0,
        frameCount: 0,
    };

    // Store subscription
    subscriptions.set(subscription.id, subscription);

    // Update indexes
    if (!subscriptionsBySocket.has(params.socketId)) {
        subscriptionsBySocket.set(params.socketId, new Set());
    }
    subscriptionsBySocket.get(params.socketId)!.add(subscription.id);

    if (!subscriptionsBySession.has(params.sessionId)) {
        subscriptionsBySession.set(params.sessionId, new Set());
    }
    subscriptionsBySession.get(params.sessionId)!.add(subscription.id);

    return subscription;
}

export function getSubscription(id: string): ActiveSubscription | undefined {
    return subscriptions.get(id);
}

export function getSubscriptionsForSocket(socketId: string): ActiveSubscription[] {
    const ids = subscriptionsBySocket.get(socketId);
    if (!ids) return [];
    return Array.from(ids).map(id => subscriptions.get(id)!).filter(Boolean);
}

export function getSubscriptionsForSession(sessionId: string): ActiveSubscription[] {
    const ids = subscriptionsBySession.get(sessionId);
    if (!ids) return [];
    return Array.from(ids).map(id => subscriptions.get(id)!).filter(Boolean);
}

export function removeSubscription(id: string): void {
    const sub = subscriptions.get(id);
    if (!sub) return;

    subscriptions.delete(id);
    subscriptionsBySocket.get(sub.socketId)?.delete(id);
    subscriptionsBySession.get(sub.sessionId)?.delete(id);
}

export function removeSubscriptionsForSocket(socketId: string): number {
    const ids = subscriptionsBySocket.get(socketId);
    if (!ids) return 0;

    const count = ids.size;
    for (const id of ids) {
        const sub = subscriptions.get(id);
        if (sub) {
            subscriptionsBySession.get(sub.sessionId)?.delete(id);
            subscriptions.delete(id);
        }
    }
    subscriptionsBySocket.delete(socketId);

    // Also clean up cooldowns and fat grants for this socket
    for (const [key, cooldown] of burstCooldowns) {
        if (cooldown.socketId === socketId) {
            burstCooldowns.delete(key);
        }
    }
    for (const [key, grant] of fatFrameGrants) {
        if (grant.socketId === socketId) {
            fatFrameGrants.delete(key);
        }
    }

    return count;
}

export function updateLastEmit(subscriptionId: string): void {
    const sub = subscriptions.get(subscriptionId);
    if (sub) {
        sub.lastEmitMs = Date.now();
        sub.frameCount++;
    }
}

// =====================================================================
// Rate Clamping
// =====================================================================

export function clampRate(requestedHz: number, role: TelemetryRole, isBurst: boolean): number {
    if (!Number.isFinite(requestedHz) || requestedHz <= 0) {
        return BASELINE_RATES[role];  // Default to baseline for invalid input
    }

    const maxRate = isBurst ? BURST_MAX_RATES[role] : BASELINE_RATES[role];
    return Math.min(requestedHz, maxRate);
}

export function getMinEmitIntervalMs(rateHz: number): number {
    if (rateHz <= 0) return Infinity;
    return 1000 / rateHz;
}

// =====================================================================
// Burst State Management
// =====================================================================

export function canEscalate(socketId: string, driverId: string, role: TelemetryRole, trigger: BurstTrigger): { allowed: boolean; reason?: string } {
    // Check if role is allowed for this trigger
    const allowedRoles = TRIGGER_ALLOWED_ROLES[trigger];
    if (!allowedRoles.includes(role)) {
        return { allowed: false, reason: `Role "${role}" not eligible for trigger "${trigger}"` };
    }

    // Check cooldown
    const cooldownKey = `${socketId}:${driverId}`;
    const cooldown = burstCooldowns.get(cooldownKey);
    if (cooldown && cooldown.cooldownUntilMs > Date.now()) {
        const remainingMs = cooldown.cooldownUntilMs - Date.now();
        return { allowed: false, reason: `Driver ${driverId} in cooldown for ${Math.ceil(remainingMs / 1000)}s` };
    }

    // Check concurrent burst limit
    const socketSubs = getSubscriptionsForSocket(socketId);
    const activeBursts = socketSubs.filter(s => s.isBurst && s.expiresAtMs && s.expiresAtMs > Date.now());
    if (activeBursts.length >= BURST_CONFIG.maxConcurrentBurstsPerSocket) {
        return { allowed: false, reason: `Max ${BURST_CONFIG.maxConcurrentBurstsPerSocket} concurrent bursts reached` };
    }

    return { allowed: true };
}

export function setBurstCooldown(socketId: string, driverId: string): void {
    const cooldownKey = `${socketId}:${driverId}`;
    burstCooldowns.set(cooldownKey, {
        socketId,
        driverId,
        cooldownUntilMs: Date.now() + BURST_CONFIG.cooldownMs,
    });
}

export function cleanupExpiredBursts(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, sub] of subscriptions) {
        if (sub.isBurst && sub.expiresAtMs && sub.expiresAtMs <= now) {
            // Decay burst to baseline - just remove the burst subscription
            // The baseline subscription should still exist
            removeSubscription(id);
            setBurstCooldown(sub.socketId, sub.driverId ?? 'all');
            cleaned++;
        }
    }

    // Cleanup expired cooldowns
    for (const [key, cooldown] of burstCooldowns) {
        if (cooldown.cooldownUntilMs <= now) {
            burstCooldowns.delete(key);
        }
    }

    return cleaned;
}

// =====================================================================
// Fat Frame Grants
// =====================================================================

const FAT_FRAME_MAX_RATE_HZ = 10;  // Bandwidth protection

export function canRequestFat(role: TelemetryRole, surface: Surface): { allowed: boolean; reason?: string } {
    // Only team can request fat frames
    if (role !== 'team') {
        return { allowed: false, reason: `Role "${role}" cannot receive fat frames` };
    }

    // Only on BlackBox surface
    if (surface !== 'blackbox') {
        return { allowed: false, reason: 'Fat frames only available on BlackBox surface' };
    }

    return { allowed: true };
}

export function grantFatFrames(socketId: string, sessionId: string, driverId: string): FatFrameGrant {
    const grantKey = `${socketId}:${driverId}`;
    const grant: FatFrameGrant = {
        socketId,
        sessionId,
        driverId,
        grantedAtMs: Date.now(),
        rateHz: FAT_FRAME_MAX_RATE_HZ,
    };
    fatFrameGrants.set(grantKey, grant);
    return grant;
}

export function hasFatFrameGrant(socketId: string, driverId: string): boolean {
    return fatFrameGrants.has(`${socketId}:${driverId}`);
}

export function revokeFatFrameGrant(socketId: string, driverId: string): void {
    fatFrameGrants.delete(`${socketId}:${driverId}`);
}

// =====================================================================
// Emission Check
// =====================================================================

export function shouldEmit(subscription: ActiveSubscription): boolean {
    const now = Date.now();

    // Check if burst expired (shouldn't happen if cleanup runs, but safety check)
    if (subscription.isBurst && subscription.expiresAtMs && subscription.expiresAtMs <= now) {
        return false;
    }

    // Check rate limit
    const minInterval = getMinEmitIntervalMs(subscription.actualRateHz);
    const elapsed = now - subscription.lastEmitMs;

    return elapsed >= minInterval;
}

// =====================================================================
// Introspection (DEV only)
// =====================================================================

export function getAllSubscriptions(): ActiveSubscription[] {
    return Array.from(subscriptions.values());
}

export function getAllBurstCooldowns(): BurstCooldown[] {
    return Array.from(burstCooldowns.values());
}

export function getAllFatFrameGrants(): FatFrameGrant[] {
    return Array.from(fatFrameGrants.values());
}

export function getStats(): {
    totalSubscriptions: number;
    activeBursts: number;
    cooldownsActive: number;
    fatGrantsActive: number;
} {
    const now = Date.now();
    const subs = Array.from(subscriptions.values());

    return {
        totalSubscriptions: subs.length,
        activeBursts: subs.filter(s => s.isBurst && s.expiresAtMs && s.expiresAtMs > now).length,
        cooldownsActive: Array.from(burstCooldowns.values()).filter(c => c.cooldownUntilMs > now).length,
        fatGrantsActive: fatFrameGrants.size,
    };
}

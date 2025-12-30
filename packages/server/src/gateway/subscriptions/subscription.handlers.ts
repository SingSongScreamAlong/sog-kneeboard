// =====================================================================
// Subscription Handlers (Week 2)
// Socket.IO event handlers for subscription management.
// =====================================================================

import type { Socket } from 'socket.io';
import type {
    SubscriptionRequestPayload,
    SubscriptionEscalatePayload,
    SubscriptionRequestFatPayload,
    SubscriptionGrantedPayload,
    SubscriptionDeniedPayload,
    FatGrantedPayload,
    FatDeniedPayload,
    TelemetryRole,
    Surface,
} from './subscription.types.js';
import {
    createSubscription,
    canEscalate,
    canRequestFat,
    grantFatFrames,
    hasFatFrameGrant,
    removeSubscriptionsForSocket,
} from './subscription.registry.js';
import { BURST_CONFIG } from './subscription.types.js';


// =====================================================================
// Handle subscription:request
// =====================================================================

export function handleSubscriptionRequest(
    socket: Socket,
    payload: unknown,
    role: TelemetryRole,
    surface: Surface
): void {
    // Validate payload
    if (!isValidSubscriptionRequest(payload)) {
        socket.emit('subscription:denied', {
            event: 'telemetry:frame',  // Default
            driverId: null,
            reason: 'Invalid payload format',
        } satisfies SubscriptionDeniedPayload);
        return;
    }

    const { sessionId, event, driverId, requestedRateHz } = payload;

    // Validate rate
    if (!Number.isFinite(requestedRateHz) || requestedRateHz <= 0) {
        socket.emit('subscription:denied', {
            event,
            driverId: driverId ?? null,
            reason: 'Invalid rate: must be positive number',
        } satisfies SubscriptionDeniedPayload);
        return;
    }

    // Create subscription (rate will be clamped)
    const subscription = createSubscription({
        socketId: socket.id,
        sessionId,
        driverId: driverId ?? null,
        event,
        requestedRateHz,
        role,
        surface,
    });

    // Join session room if not already
    const roomName = `session:${sessionId}`;
    socket.join(roomName);

    // Emit granted
    socket.emit('subscription:granted', {
        event,
        driverId: driverId ?? null,
        actualRateHz: subscription.actualRateHz,
        expiresAtMs: null,
    } satisfies SubscriptionGrantedPayload);

    console.log(`📡 Subscription created: ${socket.id} → ${event} @ ${subscription.actualRateHz}Hz (requested ${requestedRateHz}Hz)`);
}

function isValidSubscriptionRequest(payload: unknown): payload is SubscriptionRequestPayload {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return (
        typeof p.sessionId === 'string' &&
        (p.event === 'telemetry:frame' || p.event === 'telemetry:timing') &&
        typeof p.requestedRateHz === 'number'
    );
}

// =====================================================================
// Handle subscription:escalate
// =====================================================================

export function handleSubscriptionEscalate(
    socket: Socket,
    payload: unknown,
    role: TelemetryRole,
    surface: Surface
): void {
    // Validate payload
    if (!isValidEscalatePayload(payload)) {
        socket.emit('subscription:denied', {
            event: 'telemetry:frame',
            driverId: null,
            reason: 'Invalid escalate payload format',
        } satisfies SubscriptionDeniedPayload);
        return;
    }

    const { sessionId, driverId, trigger, requestedRateHz, durationMs } = payload;

    // Validate duration
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
        socket.emit('subscription:denied', {
            event: 'telemetry:frame',
            driverId,
            reason: 'Invalid duration: must be positive',
        } satisfies SubscriptionDeniedPayload);
        return;
    }

    // Check if escalation is allowed
    const check = canEscalate(socket.id, driverId, role, trigger);
    if (!check.allowed) {
        socket.emit('subscription:denied', {
            event: 'telemetry:frame',
            driverId,
            reason: check.reason || 'Escalation denied',
        } satisfies SubscriptionDeniedPayload);
        return;
    }

    // Create burst subscription
    const clampedDuration = Math.min(durationMs, BURST_CONFIG.maxDurationMs);
    const subscription = createSubscription({
        socketId: socket.id,
        sessionId,
        driverId,
        event: 'telemetry:frame',
        requestedRateHz,
        role,
        surface,
        isBurst: true,
        durationMs: clampedDuration,
    });

    // Emit granted
    socket.emit('subscription:granted', {
        event: 'telemetry:frame',
        driverId,
        actualRateHz: subscription.actualRateHz,
        expiresAtMs: subscription.expiresAtMs,
    } satisfies SubscriptionGrantedPayload);

    console.log(`🚀 Burst escalation: ${socket.id} → driver ${driverId} @ ${subscription.actualRateHz}Hz for ${clampedDuration}ms (trigger: ${trigger})`);
}

function isValidEscalatePayload(payload: unknown): payload is SubscriptionEscalatePayload {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return (
        typeof p.sessionId === 'string' &&
        typeof p.driverId === 'string' &&
        typeof p.trigger === 'string' &&
        typeof p.requestedRateHz === 'number' &&
        typeof p.durationMs === 'number'
    );
}

// =====================================================================
// Handle subscription:requestFat
// =====================================================================

export function handleRequestFat(
    socket: Socket,
    payload: unknown,
    role: TelemetryRole,
    surface: Surface
): void {
    // Validate payload
    if (!isValidRequestFatPayload(payload)) {
        socket.emit('subscription:fatDenied', {
            driverId: 'unknown',
            reason: 'Invalid requestFat payload format',
        } satisfies FatDeniedPayload);
        return;
    }

    const { sessionId, driverId } = payload;

    // Check if role can request fat frames
    const check = canRequestFat(role, surface);
    if (!check.allowed) {
        socket.emit('subscription:fatDenied', {
            driverId,
            reason: check.reason || 'Fat frame access denied',
        } satisfies FatDeniedPayload);
        return;
    }

    // Check if already granted
    if (hasFatFrameGrant(socket.id, driverId)) {
        socket.emit('subscription:fatDenied', {
            driverId,
            reason: 'Fat frames already granted for this driver',
        } satisfies FatDeniedPayload);
        return;
    }

    // Grant fat frames
    const grant = grantFatFrames(socket.id, sessionId, driverId);

    socket.emit('subscription:fatGranted', {
        driverId,
        actualRateHz: grant.rateHz,
    } satisfies FatGrantedPayload);

    console.log(`📦 Fat frame grant: ${socket.id} → driver ${driverId} @ ${grant.rateHz}Hz`);
}

function isValidRequestFatPayload(payload: unknown): payload is SubscriptionRequestFatPayload {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return typeof p.sessionId === 'string' && typeof p.driverId === 'string';
}

// =====================================================================
// Handle disconnect cleanup
// =====================================================================

export function handleSubscriptionDisconnect(socket: Socket): void {
    const removed = removeSubscriptionsForSocket(socket.id);
    if (removed > 0) {
        console.log(`🔌 Cleaned up ${removed} subscriptions for disconnected socket ${socket.id}`);
    }
}

// =====================================================================
// Get role/surface from socket data
// =====================================================================

export function getSocketRole(socket: Socket): TelemetryRole {
    // Default to broadcast (most restrictive) if not set
    return (socket.data.role as TelemetryRole) || 'broadcast';
}

export function getSocketSurface(socket: Socket): Surface {
    // Default to racebox (most restrictive) if not set
    return (socket.data.surface as Surface) || 'racebox';
}

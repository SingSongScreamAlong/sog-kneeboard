// =====================================================================
// Telemetry Emission Gate (Week 2)
// Controls which subscribers receive telemetry frames based on rate limits.
// =====================================================================

import type { Namespace } from 'socket.io';
import type { RelayTelemetryRaw } from '../relay/relay.types.js';
import type { ActiveSubscription } from './subscription.types.js';
import {
    getSubscriptionsForSession,
    updateLastEmit,
    shouldEmit,
    cleanupExpiredBursts,
    hasFatFrameGrant,
} from './subscription.registry.js';

// =====================================================================
// Thin Telemetry Frame (default for team/RC/broadcast)
// =====================================================================

export interface ThinTelemetryFrame {
    driverId: string | null;
    sessionId: string;
    position: number | null;
    lapDistPct: number | null;
    speed: number | null;
    gear: number | null;
    lap: number | null;
    lastLapTime: number | null;
    gapToLeader: number | null;
    gapAhead: number | null;
    inPit: boolean;
    incidentCount: number;
    sessionTimeMs: number | null;
    timestamp: number;
}

// =====================================================================
// Fat Telemetry Frame (driver-only, team on-request)
// =====================================================================

export interface FatTelemetryFrame extends ThinTelemetryFrame {
    rpm: number | null;
    throttle: number | null;
    brake: number | null;
    clutch: number | null;
    steeringAngle: number | null;
    fuelLevel: number | null;
    fuelUsePerHour: number | null;
    tireTemps: number[] | null;  // 12 values
    tirePressures: number[] | null;  // 4 values
    tireWear: number[] | null;  // 12 values
    worldPosition: { x: number; y: number; z: number } | null;
    velocity: { x: number; y: number; z: number } | null;
    rotation: { yaw: number; pitch: number; roll: number } | null;
    gForce: { lat: number; long: number; vert: number } | null;
    lapDelta: number | null;
    trackTemp: number | null;
    airTemp: number | null;
}

// =====================================================================
// Transform relay data to thin frame
// =====================================================================

export function toThinFrame(raw: RelayTelemetryRaw): ThinTelemetryFrame {
    return {
        driverId: null,  // Will be set by caller if available
        sessionId: raw.sessionId,
        position: raw.position,
        lapDistPct: raw.lapDist,  // Already 0-1 from relay
        speed: raw.speed,
        gear: raw.gear,
        lap: raw.lap,
        lastLapTime: null,
        gapToLeader: null,
        gapAhead: null,
        inPit: false,
        incidentCount: 0,
        sessionTimeMs: raw.sessionTimeMs,
        timestamp: raw.receivedAtMs,
    };
}

// =====================================================================
// Emit Telemetry to Subscribed Clients
// =====================================================================

let lastCleanupMs = 0;
const CLEANUP_INTERVAL_MS = 5000;

export function emitTelemetryToSubscribers(
    nsp: Namespace,
    sessionId: string,
    thinFrame: ThinTelemetryFrame,
    fatFrame?: FatTelemetryFrame
): number {
    const now = Date.now();

    // Periodic cleanup of expired bursts
    if (now - lastCleanupMs > CLEANUP_INTERVAL_MS) {
        cleanupExpiredBursts();
        lastCleanupMs = now;
    }

    // Get all subscriptions for this session
    const subscriptions = getSubscriptionsForSession(sessionId);
    if (subscriptions.length === 0) {
        return 0;
    }

    let emitCount = 0;

    // Group by socket for efficient emission
    const socketGroups = new Map<string, ActiveSubscription[]>();
    for (const sub of subscriptions) {
        if (!socketGroups.has(sub.socketId)) {
            socketGroups.set(sub.socketId, []);
        }
        socketGroups.get(sub.socketId)!.push(sub);
    }

    for (const [socketId, subs] of socketGroups) {
        // Find the best matching subscription (highest rate that's due)
        let bestSub: ActiveSubscription | null = null;

        for (const sub of subs) {
            if (sub.event !== 'telemetry:frame') continue;

            // Check if driver matches (null = all drivers)
            if (sub.driverId !== null && sub.driverId !== thinFrame.driverId) continue;

            // Check if due to emit
            if (!shouldEmit(sub)) continue;

            // Pick highest rate subscription
            if (!bestSub || sub.actualRateHz > bestSub.actualRateHz) {
                bestSub = sub;
            }
        }

        if (bestSub) {
            // Determine which frame to send
            let frameToSend: ThinTelemetryFrame | FatTelemetryFrame = thinFrame;

            // Check if socket has fat frame grant for this driver
            if (fatFrame && thinFrame.driverId && hasFatFrameGrant(socketId, thinFrame.driverId)) {
                // Fat frames only for team role
                if (bestSub.role === 'team' && bestSub.surface === 'blackbox') {
                    frameToSend = fatFrame;
                }
            }

            // Driver always gets fat frames (if available)
            if (fatFrame && bestSub.role === 'driver') {
                frameToSend = fatFrame;
            }

            // Emit to socket
            const socket = nsp.sockets.get(socketId);
            if (socket) {
                socket.emit('telemetry:frame', frameToSend);
                updateLastEmit(bestSub.id);
                emitCount++;
            }
        }
    }

    return emitCount;
}

// =====================================================================
// Emit Timing to All Subscribers
// Timing has fixed 2Hz rate for all roles
// =====================================================================

export function emitTimingToSubscribers(
    nsp: Namespace,
    sessionId: string,
    timingData: unknown
): number {
    const subscriptions = getSubscriptionsForSession(sessionId);
    let emitCount = 0;

    for (const sub of subscriptions) {
        if (sub.event !== 'telemetry:timing') continue;
        if (!shouldEmit(sub)) continue;

        const socket = nsp.sockets.get(sub.socketId);
        if (socket) {
            socket.emit('telemetry:timing', timingData);
            updateLastEmit(sub.id);
            emitCount++;
        }
    }

    return emitCount;
}

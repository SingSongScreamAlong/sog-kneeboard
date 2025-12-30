// =====================================================================
// Relay Handlers (Week 1 + Week 3 Integration)
// Process session_info and telemetry messages from relay agents.
// =====================================================================

import type { Namespace, Socket } from 'socket.io';
import type {
    RelayTelemetryRaw,
} from './relay.types.js';
import { validateRelaySessionInfo, validateRelayTelemetry, getMessageType } from './relay.validate.js';
import { validateRelayApiKey } from './relay.auth.js';
import {
    getSession,
    setSession,
    getOrCreateMetrics,
    recordFrame,
    incrementConnectedSockets,
    decrementConnectedSockets,
} from './relay.metrics.js';
// Week 3 imports
import {
    setDriverIdContext,
    extractDriverId,
    translateToThinFrame,
    translateToFatFrame,
} from '../translation/relay-to-canonical.js';
import {
    updateSessionFromSessionInfo,
    checkDedupe,
    updateDriverState,
} from '../sessions/session.registry.js';
import { emitCanonicalTelemetry } from './relay.emission.js';
// Week 5 + 6 imports
import { metricsRegistry } from '../../observability/metrics.registry.js';
import { persistThinFrame } from '../../persistence/persistence.manager.js';
// Note: persistFatFrame available but currently disabled - uncomment when needed

// =====================================================================
// Session Info Handler
// =====================================================================

export async function handleSessionInfo(
    socket: Socket,
    nsp: Namespace,
    payload: unknown
): Promise<void> {
    const result = validateRelaySessionInfo(payload);

    if (!result.valid || !result.data) {
        console.warn(`⚠️  Relay ${socket.id}: Invalid session_info - ${result.error}`);
        socket.emit('relay:error', { error: result.error, type: 'session_info' });
        return;
    }

    const msg = result.data;

    // Validate API key
    const isValidKey = await validateRelayApiKey(msg.api_key);
    if (!isValidKey) {
        console.warn(`❌ Relay ${socket.id}: Invalid API key`);
        socket.emit('relay:error', { error: 'Invalid API key', type: 'auth' });
        socket.disconnect(true);
        return;
    }

    const sessionId = msg.session_id;
    const roomName = `session:${sessionId}`;
    const now = Date.now();

    // Create or update session in registry
    let session = getSession(sessionId);
    const isNewSession = !session;

    if (isNewSession) {
        session = {
            sessionId,
            createdAt: now,
            lastUpdatedAt: now,
            relaySocketId: socket.id,
            apiKey: msg.api_key,
            userId: msg.user_id,
            teamId: msg.team_id,
            sessionData: msg.data,
        };
        setSession(session);
        console.log(`🆕 Relay ${socket.id}: Created session ${sessionId}`);
    } else {
        // session is guaranteed to exist here (isNewSession is false)
        session!.lastUpdatedAt = now;
        session!.relaySocketId = socket.id;
        session!.sessionData = { ...session!.sessionData, ...msg.data };
        setSession(session!);
        console.log(`🔄 Relay ${socket.id}: Updated session ${sessionId}`);
    }


    // Mark socket as authenticated relay
    socket.data.agentType = 'relay';
    socket.data.sessionId = sessionId;
    socket.data.apiKey = msg.api_key;

    // Join session room (server-side assignment, relay cannot choose)
    socket.join(roomName);
    incrementConnectedSockets(sessionId);

    console.log(`📡 Relay ${socket.id}: Joined room ${roomName}`);

    // Week 3: Update session registry with session info
    updateSessionFromSessionInfo(sessionId, msg.data);
    setDriverIdContext(msg.data);

    // Emit to room that session info was received
    nsp.to(roomName).emit('relay:session_info_received', {
        sessionId,
        trackName: msg.data.TrackName,
        driverName: msg.data.DriverName,
        sessionType: msg.data.SessionType,
        isNew: isNewSession,
        timestamp: now,
    });
}

// =====================================================================
// Telemetry Handler
// =====================================================================

export function handleTelemetry(
    socket: Socket,
    nsp: Namespace,
    payload: unknown
): void {
    const result = validateRelayTelemetry(payload);

    if (!result.valid || !result.data) {
        // Silent fail for malformed telemetry (too noisy to log every frame)
        return;
    }

    const msg = result.data;
    const sessionId = msg.session_id;
    const roomName = `session:${sessionId}`;
    const now = Date.now();

    // Ensure session exists (auto-create if missing in dev, but log warning)
    let session = getSession(sessionId);
    if (!session) {
        if (socket.data.sessionId === sessionId) {
            // Socket already authenticated for this session
            session = {
                sessionId,
                createdAt: now,
                lastUpdatedAt: now,
                relaySocketId: socket.id,
                apiKey: socket.data.apiKey || 'unknown',
                sessionData: {},
            };
            setSession(session);
            socket.join(roomName);
            console.warn(`⚠️  Relay ${socket.id}: Auto-created session ${sessionId} from telemetry`);
        } else {
            // Unknown session, reject
            return;
        }
    }

    // Extract sessionTimeMs for ordering
    const sessionTimeMs = typeof msg.data.SessionTime === 'number'
        ? Math.round(msg.data.SessionTime * 1000)
        : null;

    const orderingKnown = sessionTimeMs !== null;
    if (!orderingKnown) {
        // Log once per session (not every frame)
        const metrics = getOrCreateMetrics(sessionId);
        if (metrics.framesReceivedTotal === 0) {
            console.warn(`⚠️  Session ${sessionId}: No sessionTimeMs, ordering unknown`);
        }
    }

    // Week 3: Deduplication check
    if (sessionTimeMs !== null) {
        const driverId = extractDriverId(msg.data);
        const dedupeResult = checkDedupe(sessionId, driverId, sessionTimeMs);
        if (!dedupeResult.accept) {
            // Frame dropped (duplicate or out of order)
            return;
        }
    }

    // Record metrics
    recordFrame(sessionId, msg.timestamp, sessionTimeMs, now);

    // Week 3: Translate to canonical frames
    const thinFrame = translateToThinFrame(sessionId, msg);
    const fatFrame = translateToFatFrame(sessionId, msg);

    // Week 3: Update driver state in session registry
    updateDriverState(sessionId, thinFrame);

    // Week 5: Record metrics
    metricsRegistry.recordFrameIn();
    metricsRegistry.recordLatency(now, Date.now());

    // Week 6: Persist frames (non-blocking)
    persistThinFrame(thinFrame);
    // Only persist fat frames for driver-owned sessions (configurable)
    // persistFatFrame(fatFrame, 'driver_opt_in');

    // Build compact payload for DEV observers (Week 1 compatibility)
    const telemetryRaw: RelayTelemetryRaw = {
        sessionId,
        receivedAtMs: now,
        relayTimestamp: msg.timestamp,
        sessionTimeMs,
        orderingKnown,
        speed: typeof msg.data.Speed === 'number' ? msg.data.Speed : null,
        rpm: typeof msg.data.RPM === 'number' ? msg.data.RPM : null,
        gear: typeof msg.data.Gear === 'number' ? msg.data.Gear : null,
        lap: typeof msg.data.Lap === 'number' ? msg.data.Lap : null,
        lapDist: typeof msg.data.LapDist === 'number' ? msg.data.LapDist : null,
        position: typeof msg.data.PlayerCarPosition === 'number' ? msg.data.PlayerCarPosition : null,
        eventsCount: msg.events.length,
        events: msg.events,
    };

    // Emit raw for DEV observers (Week 1)
    nsp.to(roomName).emit('relay:telemetry_raw', telemetryRaw);

    // Week 3: Emit canonical frames via subscription gate
    const emitCount = emitCanonicalTelemetry(nsp, sessionId, thinFrame, fatFrame);

    // Week 5: Record output metrics
    if (emitCount > 0) {
        for (let i = 0; i < emitCount; i++) {
            metricsRegistry.recordFrameOut();
        }
    }
}

// =====================================================================
// Disconnect Handler
// =====================================================================

export function handleRelayDisconnect(socket: Socket): void {
    if (socket.data.agentType !== 'relay') {
        return;
    }

    const sessionId = socket.data.sessionId;
    if (sessionId) {
        decrementConnectedSockets(sessionId);
        console.log(`🔌 Relay ${socket.id} disconnected from session ${sessionId}`);
    }
}

// =====================================================================
// Unknown Message Handler
// =====================================================================

export function handleUnknownMessage(socket: Socket, payload: unknown): void {
    const msgType = getMessageType(payload);
    console.warn(`⚠️  Relay ${socket.id}: Unknown message type "${msgType}"`);
}

// =====================================================================
// Broadcast State (Week 8)
// Server-side broadcast state for RaceBox director control.
// =====================================================================

import type { Namespace, Socket } from 'socket.io';

// =====================================================================
// Types
// =====================================================================

export interface BroadcastState {
    sessionId: string;
    featuredDriverId: string | null;
    featuredBattle: { driverA: string; driverB: string } | null;
    activeCue: BroadcastCue | null;
    sceneName: string;
    delayMs: number;
    updatedAt: number;
}

export interface BroadcastCue {
    type: 'lower-third' | 'battle-box' | 'incident-banner' | 'timing-tower' | 'none';
    payload?: Record<string, unknown>;
    expiresAt: number | null;  // null = manual dismiss
}

export interface BroadcastCommand {
    action: 'setFeaturedDriver' | 'setFeaturedBattle' | 'triggerCue' | 'dismissCue' | 'setScene' | 'setDelay';
    payload: Record<string, unknown>;
}

// =====================================================================
// State Storage (in-memory per session)
// =====================================================================

const broadcastStates = new Map<string, BroadcastState>();

export function getBroadcastState(sessionId: string): BroadcastState {
    let state = broadcastStates.get(sessionId);
    if (!state) {
        state = {
            sessionId,
            featuredDriverId: null,
            featuredBattle: null,
            activeCue: null,
            sceneName: 'default',
            delayMs: 0,
            updatedAt: Date.now(),
        };
        broadcastStates.set(sessionId, state);
    }
    return state;
}

export function updateBroadcastState(
    sessionId: string,
    update: Partial<BroadcastState>
): BroadcastState {
    const state = getBroadcastState(sessionId);
    Object.assign(state, update, { updatedAt: Date.now() });
    return state;
}

export function clearExpiredCues(): void {
    const now = Date.now();
    for (const state of broadcastStates.values()) {
        if (state.activeCue && state.activeCue.expiresAt && state.activeCue.expiresAt < now) {
            state.activeCue = null;
            state.updatedAt = now;
        }
    }
}

// =====================================================================
// Command Handlers
// =====================================================================

export function handleBroadcastCommand(
    sessionId: string,
    command: BroadcastCommand
): BroadcastState {
    const state = getBroadcastState(sessionId);

    switch (command.action) {
        case 'setFeaturedDriver':
            state.featuredDriverId = command.payload.driverId as string || null;
            break;

        case 'setFeaturedBattle':
            if (command.payload.driverA && command.payload.driverB) {
                state.featuredBattle = {
                    driverA: command.payload.driverA as string,
                    driverB: command.payload.driverB as string,
                };
            } else {
                state.featuredBattle = null;
            }
            break;

        case 'triggerCue':
            state.activeCue = {
                type: command.payload.type as BroadcastCue['type'],
                payload: command.payload.data as Record<string, unknown>,
                expiresAt: command.payload.durationMs
                    ? Date.now() + (command.payload.durationMs as number)
                    : null,
            };
            break;

        case 'dismissCue':
            state.activeCue = null;
            break;

        case 'setScene':
            state.sceneName = command.payload.sceneName as string || 'default';
            break;

        case 'setDelay':
            const delay = command.payload.delayMs as number;
            if ([0, 10000, 30000, 60000, 120000].includes(delay)) {
                state.delayMs = delay;
            }
            break;
    }

    state.updatedAt = Date.now();
    return state;
}

// =====================================================================
// WebSocket Event Handlers
// =====================================================================

let raceboxNamespace: Namespace | null = null;
let cueCleanupInterval: NodeJS.Timeout | null = null;

export function initializeBroadcastHandlers(nsp: Namespace): void {
    raceboxNamespace = nsp;

    // Start cue expiration cleanup
    cueCleanupInterval = setInterval(() => {
        clearExpiredCues();
    }, 1000);

    console.log('📺 Broadcast state handlers initialized');
}

export function stopBroadcastHandlers(): void {
    if (cueCleanupInterval) {
        clearInterval(cueCleanupInterval);
        cueCleanupInterval = null;
    }
}

/**
 * Handle broadcast:command from director
 */
export function handleDirectorCommand(
    socket: Socket,
    sessionId: string,
    command: BroadcastCommand
): void {
    // Check capability (should be done in handler setup, but double-check)
    const auth = socket.handshake.auth as { capabilities?: string[] };
    if (!auth.capabilities?.includes('racebox:director:control')) {
        socket.emit('broadcast:error', { error: 'Unauthorized' });
        return;
    }

    const state = handleBroadcastCommand(sessionId, command);

    // Broadcast new state to all overlays in session room
    const roomName = `broadcast:${sessionId}`;
    raceboxNamespace?.to(roomName).emit('broadcast:state', state);

    // Acknowledge to director
    socket.emit('broadcast:state', state);

    console.log(`📺 Broadcast command: ${command.action} for ${sessionId}`);
}

/**
 * Send current state to a newly connected overlay
 */
export function sendBroadcastStateToSocket(socket: Socket, sessionId: string): void {
    const state = getBroadcastState(sessionId);
    socket.emit('broadcast:state', state);
}

// =====================================================================
// Delay Buffer for Broadcast Surface
// =====================================================================

interface DelayedFrame {
    frame: unknown;
    emitAt: number;
}

const delayBuffers = new Map<string, DelayedFrame[]>();
const MAX_BUFFER_SIZE = 1000;

/**
 * Buffer a frame for delayed emission to broadcast surface.
 * Returns true if frame should be emitted now (delay = 0 or already old enough).
 */
export function bufferForDelay(
    sessionId: string,
    frame: unknown,
    delayMs: number
): { emit: boolean; frames: unknown[] } {
    if (delayMs <= 0) {
        return { emit: true, frames: [frame] };
    }

    const now = Date.now();
    const buffer = delayBuffers.get(sessionId) || [];

    // Add new frame
    buffer.push({ frame, emitAt: now + delayMs });

    // Trim buffer if too large
    if (buffer.length > MAX_BUFFER_SIZE) {
        buffer.splice(0, buffer.length - MAX_BUFFER_SIZE);
    }

    delayBuffers.set(sessionId, buffer);

    // Collect frames that are ready to emit
    const readyFrames: unknown[] = [];
    let i = 0;
    while (i < buffer.length && buffer[i].emitAt <= now) {
        readyFrames.push(buffer[i].frame);
        i++;
    }

    // Remove emitted frames
    if (i > 0) {
        buffer.splice(0, i);
    }

    return { emit: readyFrames.length > 0, frames: readyFrames };
}

export function clearDelayBuffer(sessionId: string): void {
    delayBuffers.delete(sessionId);
}

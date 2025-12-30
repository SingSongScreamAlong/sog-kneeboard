// =====================================================================
// WebSocket Guards (Week 11)
// Server-side enforcement for websocket events.
// =====================================================================

import type { Socket } from 'socket.io';
import type { UserClaims } from '@controlbox/common';
import { policy } from '../auth/policy.js';
import { pool } from '../db/pool.js';

// =====================================================================
// Types
// =====================================================================

export interface AuthenticatedSocket extends Socket {
    claims?: UserClaims;
    apiKey?: { orgId: string; scopes: string[] };
}

// =====================================================================
// Auth Middleware
// =====================================================================

/**
 * Middleware to attach claims to socket.
 */
export function attachClaims(socket: AuthenticatedSocket, claims: UserClaims | null): void {
    if (claims) {
        socket.claims = claims;
    }
}

// =====================================================================
// Event Guards
// =====================================================================

/**
 * Guard for room:join events.
 */
export async function guardRoomJoin(
    socket: AuthenticatedSocket,
    roomName: string
): Promise<{ allowed: boolean; reason?: string }> {
    // Extract session ID from room name (e.g., "session:abc123")
    if (!roomName.startsWith('session:')) {
        return { allowed: true }; // Non-session rooms allowed
    }

    const sessionId = roomName.slice(8);

    // Look up session's orgId
    const result = await pool.query(
        `SELECT org_id FROM sessions WHERE id = $1`,
        [sessionId]
    );

    if (result.rows.length === 0) {
        return { allowed: false, reason: 'Session not found' };
    }

    const sessionOrgId = result.rows[0].org_id;

    // Check policy
    const policyResult = policy.canJoinSession(socket.claims || null, sessionOrgId);
    return policyResult;
}

/**
 * Guard for subscription:request events.
 */
export function guardSubscriptionRequest(
    socket: AuthenticatedSocket,
    sessionId: string,
    requestedRate: number
): { allowed: boolean; rate: number; reason?: string } {
    const claims = socket.claims;

    // Public viewers get minimum rate
    if (!claims) {
        return { allowed: true, rate: 5 };
    }

    // Check surface access
    const surfaceCheck = policy.canAccessSurface(claims, 'blackbox');
    if (!surfaceCheck.allowed) {
        return { allowed: false, rate: 0, reason: surfaceCheck.reason };
    }

    // Clamp rate to role's maximum
    const clampedRate = policy.clampRate(claims.role, requestedRate);

    return { allowed: true, rate: clampedRate };
}

/**
 * Guard for subscription:escalate (burst) events.
 */
export function guardBurstEscalation(
    socket: AuthenticatedSocket,
    sessionId: string
): { allowed: boolean; reason?: string } {
    const claims = socket.claims;

    if (!claims) {
        return { allowed: false, reason: 'Authentication required for burst' };
    }

    // Team and driver can request bursts
    const allowedRoles = ['admin', 'race_control', 'team', 'driver'];
    if (!allowedRoles.includes(claims.role)) {
        return { allowed: false, reason: 'Role not authorized for burst escalation' };
    }

    return { allowed: true };
}

/**
 * Guard for subscription:requestFat events.
 */
export async function guardFatFrameRequest(
    socket: AuthenticatedSocket,
    sessionId: string,
    targetDriverId: string
): Promise<{ allowed: boolean; reason?: string }> {
    const claims = socket.claims;

    if (!claims) {
        return { allowed: false, reason: 'Authentication required for fat frames' };
    }

    // Look up session's orgId
    const result = await pool.query(
        `SELECT org_id FROM sessions WHERE id = $1`,
        [sessionId]
    );

    if (result.rows.length === 0) {
        return { allowed: false, reason: 'Session not found' };
    }

    const sessionOrgId = result.rows[0].org_id;

    return policy.canRequestFatFrames(claims, targetDriverId, sessionOrgId);
}

/**
 * Guard for broadcast:command events.
 */
export function guardBroadcastCommand(
    socket: AuthenticatedSocket
): { allowed: boolean; reason?: string } {
    return policy.canBroadcastCommand(socket.claims || null);
}

// =====================================================================
// Emit Denied Response
// =====================================================================

export function emitDenied(
    socket: AuthenticatedSocket,
    event: string,
    reason: string
): void {
    const eventMap: Record<string, string> = {
        'room:join': 'room:denied',
        'subscription:request': 'subscription:denied',
        'subscription:escalate': 'subscription:denied',
        'subscription:requestFat': 'subscription:denied',
        'broadcast:command': 'auth:denied',
    };

    const responseEvent = eventMap[event] || 'auth:denied';
    socket.emit(responseEvent, { reason });
}

// =====================================================================
// API Key Validation for Relay
// =====================================================================

/**
 * Validate API key and attach to socket.
 */
export async function validateApiKey(
    socket: AuthenticatedSocket,
    keyPrefix: string,
    keyPlain: string
): Promise<{ valid: boolean; orgId?: string; scopes?: string[] }> {
    const result = await pool.query(
        `SELECT id, org_id, key_hash, scopes, revoked_at, expires_at 
         FROM api_keys WHERE key_prefix = $1`,
        [keyPrefix]
    );

    if (result.rows.length === 0) {
        return { valid: false };
    }

    const apiKey = result.rows[0];

    // Check if revoked
    if (apiKey.revoked_at) {
        return { valid: false };
    }

    // Check if expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
        return { valid: false };
    }

    // Verify key hash (would use bcrypt.compare in production)
    // For now, simple check - production should use proper hashing
    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(keyPlain, apiKey.key_hash);
    if (!isValid) {
        return { valid: false };
    }

    // Update last used
    await pool.query(
        `UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`,
        [apiKey.id]
    );

    socket.apiKey = {
        orgId: apiKey.org_id,
        scopes: apiKey.scopes,
    };

    return {
        valid: true,
        orgId: apiKey.org_id,
        scopes: apiKey.scopes,
    };
}

/**
 * Check if socket's API key has required scope.
 */
export function guardApiKeyScope(
    socket: AuthenticatedSocket,
    requiredScope: string
): { allowed: boolean; reason?: string } {
    if (!socket.apiKey) {
        return { allowed: false, reason: 'API key required' };
    }

    if (!socket.apiKey.scopes.includes(requiredScope)) {
        return { allowed: false, reason: `Missing scope: ${requiredScope}` };
    }

    return { allowed: true };
}

// =====================================================================
// Export
// =====================================================================

export const wsGuards = {
    attachClaims,
    guardRoomJoin,
    guardSubscriptionRequest,
    guardBurstEscalation,
    guardFatFrameRequest,
    guardBroadcastCommand,
    emitDenied,
    validateApiKey,
    guardApiKeyScope,
};

// =====================================================================
// Policy Engine (Week 11)
// Single authoritative module for access control decisions.
// ALL authorization decisions flow through this module.
// =====================================================================

import type { Surface, Role, Capability, UserClaims } from '@controlbox/common';

// =====================================================================
// Types
// =====================================================================

export interface PolicyContext {
    claims: UserClaims | null;
    orgId?: string;
    sessionId?: string;
    targetUserId?: string;
}

export interface PolicyResult {
    allowed: boolean;
    reason?: string;
}

// =====================================================================
// Surface Access
// =====================================================================

/**
 * Check if user can access a surface (BlackBox, ControlBox, RaceBox).
 */
export function canAccessSurface(claims: UserClaims | null, surface: Surface): PolicyResult {
    if (!claims) {
        // Public surfaces allowed without auth
        if (surface === 'racebox') {
            return { allowed: true }; // Public timing allowed
        }
        return { allowed: false, reason: 'Authentication required' };
    }

    if (!claims.surfaces.includes(surface)) {
        return { allowed: false, reason: `No access to ${surface} surface` };
    }

    return { allowed: true };
}

// =====================================================================
// Capability Checks
// =====================================================================

/**
 * Check if user has a specific capability.
 */
export function canUseCapability(claims: UserClaims | null, capability: Capability): PolicyResult {
    if (!claims) {
        return { allowed: false, reason: 'Authentication required' };
    }

    if (!claims.capabilities.includes(capability)) {
        return { allowed: false, reason: `Missing capability: ${capability}` };
    }

    return { allowed: true };
}

// =====================================================================
// Session Access
// =====================================================================

/**
 * Check if user can join/view a session.
 */
export function canJoinSession(
    claims: UserClaims | null,
    sessionOrgId: string
): PolicyResult {
    // Public viewers can watch public sessions
    if (!claims) {
        return { allowed: true }; // Public sessions allow anonymous viewing
    }

    // Admin can access any session
    if (claims.role === 'admin') {
        return { allowed: true };
    }

    // Must be member of session's org
    if (claims.orgId !== sessionOrgId) {
        return { allowed: false, reason: 'Not a member of this organization' };
    }

    return { allowed: true };
}

// =====================================================================
// Fat Frame Access
// =====================================================================

/**
 * Check if user can request fat frames for a driver.
 */
export function canRequestFatFrames(
    claims: UserClaims | null,
    targetDriverId: string,
    sessionOrgId: string
): PolicyResult {
    if (!claims) {
        return { allowed: false, reason: 'Authentication required for fat frames' };
    }

    // Must have capability
    const capCheck = canUseCapability(claims, 'blackbox:telemetry:fat');
    if (!capCheck.allowed) return capCheck;

    // Must be in same org
    const sessionCheck = canJoinSession(claims, sessionOrgId);
    if (!sessionCheck.allowed) return sessionCheck;

    // Drivers can only see their own fat frames (unless team/admin)
    if (claims.role === 'driver' && claims.userId !== targetDriverId) {
        return { allowed: false, reason: 'Drivers can only access their own fat frames' };
    }

    return { allowed: true };
}

// =====================================================================
// Broadcast Commands
// =====================================================================

/**
 * Check if user can send broadcast director commands.
 */
export function canBroadcastCommand(claims: UserClaims | null): PolicyResult {
    return canUseCapability(claims, 'racebox:director:control');
}

// =====================================================================
// Social Export
// =====================================================================

/**
 * Check if user can export social cards.
 */
export function canExportSocial(claims: UserClaims | null): PolicyResult {
    return canUseCapability(claims, 'racebox:social:export');
}

// =====================================================================
// Replay Access
// =====================================================================

/**
 * Check if user can access replay data for a session.
 */
export function canAccessReplay(
    claims: UserClaims | null,
    sessionOrgId: string
): PolicyResult {
    if (!claims) {
        return { allowed: false, reason: 'Authentication required for replay' };
    }

    const capCheck = canUseCapability(claims, 'blackbox:replay:view');
    if (!capCheck.allowed) return capCheck;

    return canJoinSession(claims, sessionOrgId);
}

// =====================================================================
// Highlights Management
// =====================================================================

/**
 * Check if user can create/edit highlights.
 */
export function canManageHighlights(claims: UserClaims | null): PolicyResult {
    if (!claims) {
        return { allowed: false, reason: 'Authentication required' };
    }

    // Director, steward, team, or admin can create highlights
    const allowedRoles: Role[] = ['admin', 'race_control', 'team', 'broadcast'];
    if (!allowedRoles.includes(claims.role)) {
        return { allowed: false, reason: 'Insufficient role for highlight management' };
    }

    return { allowed: true };
}

// =====================================================================
// Incident/Penalty Management
// =====================================================================

/**
 * Check if user can manage incidents.
 */
export function canManageIncidents(claims: UserClaims | null): PolicyResult {
    return canUseCapability(claims, 'controlbox:incidents:manage');
}

/**
 * Check if user can apply penalties.
 */
export function canApplyPenalties(claims: UserClaims | null): PolicyResult {
    return canUseCapability(claims, 'controlbox:penalties:apply');
}

// =====================================================================
// Redaction
// =====================================================================

/**
 * Fields to redact based on role.
 */
const REDACTION_RULES: Record<Role, string[]> = {
    admin: [],
    race_control: [],
    team: ['setupHints'],
    driver: ['setupHints', 'strategyNotes'],
    broadcast: ['fuel', 'tireWear', 'setupHints', 'strategyNotes', 'radioText'],
    guest: ['fuel', 'tireWear', 'setupHints', 'strategyNotes', 'radioText', 'gaps'],
};

/**
 * Redact sensitive fields from payload based on role.
 */
export function redactForRole<T extends Record<string, unknown>>(
    role: Role,
    payload: T
): T {
    const fieldsToRedact = REDACTION_RULES[role] || REDACTION_RULES.guest;

    if (fieldsToRedact.length === 0) {
        return payload;
    }

    const redacted = { ...payload };
    for (const field of fieldsToRedact) {
        if (field in redacted) {
            delete redacted[field];
        }
    }

    return redacted;
}

// =====================================================================
// API Key Scope Checks
// =====================================================================

export type ApiKeyScope =
    | 'relay:telemetry:write'
    | 'relay:timing:write'
    | 'watcher:observations:write'
    | 'api:read'
    | 'api:write';

/**
 * Check if API key has required scope.
 */
export function apiKeyHasScope(
    keyScopes: ApiKeyScope[],
    requiredScope: ApiKeyScope
): PolicyResult {
    if (!keyScopes.includes(requiredScope)) {
        return { allowed: false, reason: `API key missing scope: ${requiredScope}` };
    }
    return { allowed: true };
}

// =====================================================================
// Subscription Rate Limits by Role
// =====================================================================

const RATE_LIMITS: Record<Role, number> = {
    admin: 60,
    race_control: 20,
    team: 20,
    driver: 60,
    broadcast: 5,
    guest: 5,
};

/**
 * Get maximum subscription rate for role.
 */
export function getMaxRateForRole(role: Role): number {
    return RATE_LIMITS[role] || 5;
}

/**
 * Clamp requested rate to role's maximum.
 */
export function clampRate(role: Role, requestedRate: number): number {
    const max = getMaxRateForRole(role);
    return Math.min(requestedRate, max);
}

// =====================================================================
// Export Policy Module
// =====================================================================

export const policy = {
    canAccessSurface,
    canUseCapability,
    canJoinSession,
    canRequestFatFrames,
    canBroadcastCommand,
    canExportSocial,
    canAccessReplay,
    canManageHighlights,
    canManageIncidents,
    canApplyPenalties,
    redactForRole,
    apiKeyHasScope,
    getMaxRateForRole,
    clampRate,
};

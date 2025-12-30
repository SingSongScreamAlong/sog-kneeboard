// =====================================================================
// Quota Enforcement (Week 13)
// Runtime enforcement of plan limits with explicit denials.
// =====================================================================

import { pool } from '../db/pool.js';
import { getPlan, type PlanId, type PlanFeatures } from './plan-definitions.js';
import { metricsCollector } from '../api/routes/metrics.js';

// =====================================================================
// Types
// =====================================================================

export interface QuotaCheckResult {
    allowed: boolean;
    resource: string;
    used: number;
    limit: number | null;
    remaining: number | null;
    reason?: string;
}

export interface QuotaExceededError {
    code: 'quota:exceeded';
    resource: string;
    limit: number;
    used: number;
    planId: PlanId;
    upgradeHint: string;
}

// =====================================================================
// Quota Checks
// =====================================================================

/**
 * Check if org can create a new session.
 */
export async function checkSessionCreation(orgId: string, planId: PlanId): Promise<QuotaCheckResult> {
    const plan = getPlan(planId);
    const limit = plan.features.maxSessionsPerMonth;

    // Unlimited
    if (limit === null) {
        return { allowed: true, resource: 'sessions', used: 0, limit: null, remaining: null };
    }

    const result = await pool.query(
        `SELECT COUNT(*) as count FROM sessions 
         WHERE org_id = $1 AND created_at >= date_trunc('month', NOW())`,
        [orgId]
    );

    const used = parseInt(result.rows[0].count, 10);

    if (used >= limit) {
        return {
            allowed: false,
            resource: 'sessions',
            used,
            limit,
            remaining: 0,
            reason: `Monthly session limit reached (${limit})`,
        };
    }

    return { allowed: true, resource: 'sessions', used, limit, remaining: limit - used };
}

/**
 * Check concurrent sessions limit.
 */
export async function checkConcurrentSessions(orgId: string, planId: PlanId): Promise<QuotaCheckResult> {
    const plan = getPlan(planId);
    const limit = plan.features.maxConcurrentSessions;

    const result = await pool.query(
        `SELECT COUNT(*) as count FROM sessions 
         WHERE org_id = $1 AND status = 'active'`,
        [orgId]
    );

    const used = parseInt(result.rows[0].count, 10);

    if (used >= limit) {
        return {
            allowed: false,
            resource: 'concurrent_sessions',
            used,
            limit,
            remaining: 0,
            reason: `Concurrent session limit reached (${limit})`,
        };
    }

    return { allowed: true, resource: 'concurrent_sessions', used, limit, remaining: limit - used };
}

/**
 * Check replay storage quota.
 */
export async function checkReplayStorage(orgId: string, planId: PlanId): Promise<QuotaCheckResult> {
    const plan = getPlan(planId);
    const limitGB = plan.features.replayStorageGB;

    const result = await pool.query(
        `SELECT COALESCE(SUM(storage_bytes), 0) / (1024 * 1024 * 1024.0) as used_gb
         FROM sessions WHERE org_id = $1`,
        [orgId]
    );

    const usedGB = parseFloat(result.rows[0].used_gb || 0);

    if (usedGB >= limitGB) {
        return {
            allowed: false,
            resource: 'replay_storage_gb',
            used: usedGB,
            limit: limitGB,
            remaining: 0,
            reason: `Replay storage limit reached (${limitGB} GB)`,
        };
    }

    return { allowed: true, resource: 'replay_storage_gb', used: usedGB, limit: limitGB, remaining: limitGB - usedGB };
}

/**
 * Check seat allocation.
 */
export async function checkSeatAllocation(orgId: string, planId: PlanId): Promise<QuotaCheckResult> {
    const plan = getPlan(planId);
    const limit = plan.features.seatLimit;

    // Unlimited
    if (limit === null) {
        return { allowed: true, resource: 'seats', used: 0, limit: null, remaining: null };
    }

    const result = await pool.query(
        `SELECT COUNT(*) as count FROM memberships 
         WHERE org_id = $1 AND status = 'active'`,
        [orgId]
    );

    const used = parseInt(result.rows[0].count, 10);

    if (used >= limit) {
        return {
            allowed: false,
            resource: 'seats',
            used,
            limit,
            remaining: 0,
            reason: `Seat limit reached (${limit})`,
        };
    }

    return { allowed: true, resource: 'seats', used, limit, remaining: limit - used };
}

/**
 * Check overlay clients.
 */
const overlayClientCounts = new Map<string, number>();

export function checkOverlayClients(sessionId: string, planId: PlanId): QuotaCheckResult {
    const plan = getPlan(planId);
    const limit = plan.features.maxOverlayClients;
    const used = overlayClientCounts.get(sessionId) || 0;

    if (used >= limit) {
        metricsCollector.incSubscriptionDenied('overlay_limit');
        return {
            allowed: false,
            resource: 'overlay_clients',
            used,
            limit,
            remaining: 0,
            reason: `Overlay client limit reached (${limit})`,
        };
    }

    return { allowed: true, resource: 'overlay_clients', used, limit, remaining: limit - used };
}

export function registerOverlayClient(sessionId: string): void {
    const current = overlayClientCounts.get(sessionId) || 0;
    overlayClientCounts.set(sessionId, current + 1);
}

export function unregisterOverlayClient(sessionId: string): void {
    const current = overlayClientCounts.get(sessionId) || 0;
    overlayClientCounts.set(sessionId, Math.max(0, current - 1));
}

/**
 * Check API rate limit.
 */
const apiRateCounts = new Map<string, { count: number; windowStart: number }>();

export function checkApiRateLimit(orgId: string, planId: PlanId): QuotaCheckResult {
    const plan = getPlan(planId);
    const limit = plan.features.maxApiCallsPerHour;

    // Unlimited
    if (limit === null) {
        return { allowed: true, resource: 'api_calls', used: 0, limit: null, remaining: null };
    }

    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    let window = apiRateCounts.get(orgId);

    if (!window || now - window.windowStart > windowMs) {
        window = { count: 0, windowStart: now };
        apiRateCounts.set(orgId, window);
    }

    if (window.count >= limit) {
        return {
            allowed: false,
            resource: 'api_calls',
            used: window.count,
            limit,
            remaining: 0,
            reason: `API rate limit exceeded (${limit}/hr)`,
        };
    }

    window.count++;
    return { allowed: true, resource: 'api_calls', used: window.count, limit, remaining: limit - window.count };
}

/**
 * Check if feature is enabled for plan.
 */
export function checkFeatureEnabled(planId: PlanId, feature: keyof PlanFeatures['features']): QuotaCheckResult {
    const plan = getPlan(planId);
    const enabled = plan.features.features[feature];

    if (!enabled) {
        return {
            allowed: false,
            resource: `feature:${feature}`,
            used: 0,
            limit: 0,
            remaining: 0,
            reason: `Feature '${feature}' not available on ${plan.name} plan`,
        };
    }

    return { allowed: true, resource: `feature:${feature}`, used: 0, limit: 1, remaining: 1 };
}

/**
 * Check public spectator limit.
 */
const publicSpectatorCounts = new Map<string, number>();

export function checkPublicSpectators(sessionId: string, planId: PlanId): QuotaCheckResult {
    const plan = getPlan(planId);
    const limit = plan.features.maxPublicSpectators;
    const used = publicSpectatorCounts.get(sessionId) || 0;

    if (limit === 0) {
        return {
            allowed: false,
            resource: 'public_spectators',
            used: 0,
            limit: 0,
            remaining: 0,
            reason: 'Public spectators not available on this plan',
        };
    }

    if (used >= limit) {
        return {
            allowed: false,
            resource: 'public_spectators',
            used,
            limit,
            remaining: 0,
            reason: `Public spectator limit reached (${limit})`,
        };
    }

    return { allowed: true, resource: 'public_spectators', used, limit, remaining: limit - used };
}

// =====================================================================
// Error Factory
// =====================================================================

export function createQuotaError(result: QuotaCheckResult, planId: PlanId): QuotaExceededError {
    return {
        code: 'quota:exceeded',
        resource: result.resource,
        limit: result.limit || 0,
        used: result.used,
        planId,
        upgradeHint: getUpgradeHint(result.resource, planId),
    };
}

function getUpgradeHint(resource: string, currentPlan: PlanId): string {
    const hints: Record<string, string> = {
        sessions: 'Upgrade to Team or League for more sessions',
        concurrent_sessions: 'Upgrade to League for more concurrent sessions',
        seats: 'Upgrade to League for more team seats',
        replay_storage_gb: 'Upgrade to League for 50 GB storage',
        overlay_clients: 'Upgrade to League or Broadcast for more overlays',
        api_calls: 'Upgrade to Enterprise for unlimited API calls',
        public_spectators: 'Upgrade to Broadcast or League for public spectators',
    };

    if (currentPlan === 'enterprise') {
        return 'Contact support to increase limits';
    }

    return hints[resource] || 'Upgrade your plan for increased limits';
}

// =====================================================================
// Export
// =====================================================================

export const quotaEnforcement = {
    checkSessionCreation,
    checkConcurrentSessions,
    checkReplayStorage,
    checkSeatAllocation,
    checkOverlayClients,
    registerOverlayClient,
    unregisterOverlayClient,
    checkApiRateLimit,
    checkFeatureEnabled,
    checkPublicSpectators,
    createQuotaError,
};

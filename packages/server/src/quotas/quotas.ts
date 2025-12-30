// =====================================================================
// Cost Guardrails (Week 12)
// Enforce quotas and limits to prevent runaway costs.
// =====================================================================

import { pool } from '../db/pool.js';
import { getConfig } from '../config/env.js';

// =====================================================================
// Types
// =====================================================================

export interface QuotaStatus {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    reason?: string;
}

export interface PlanQuotas {
    maxReplayStorageGB: number;
    maxSessionsPerMonth: number;
    maxConcurrentOverlays: number;
    maxApiCallsPerHour: number;
}

// =====================================================================
// Default Quotas by Plan
// =====================================================================

const PLAN_QUOTAS: Record<string, PlanQuotas> = {
    'Free': {
        maxReplayStorageGB: 1,
        maxSessionsPerMonth: 10,
        maxConcurrentOverlays: 5,
        maxApiCallsPerHour: 100,
    },
    'Team': {
        maxReplayStorageGB: 10,
        maxSessionsPerMonth: 50,
        maxConcurrentOverlays: 20,
        maxApiCallsPerHour: 1000,
    },
    'League': {
        maxReplayStorageGB: 50,
        maxSessionsPerMonth: 200,
        maxConcurrentOverlays: 50,
        maxApiCallsPerHour: 5000,
    },
    'Enterprise': {
        maxReplayStorageGB: 500,
        maxSessionsPerMonth: -1, // unlimited
        maxConcurrentOverlays: 200,
        maxApiCallsPerHour: -1, // unlimited
    },
};

// =====================================================================
// In-Memory Rate Tracking
// =====================================================================

interface RateWindow {
    count: number;
    windowStart: number;
}

const orgApiCalls = new Map<string, RateWindow>();
const sessionOverlayClients = new Map<string, Set<string>>();

// =====================================================================
// Quota Checks
// =====================================================================

/**
 * Check if org can create more sessions this month.
 */
export async function checkSessionQuota(orgId: string): Promise<QuotaStatus> {
    const config = getConfig();

    const result = await pool.query(
        `SELECT p.name as plan_name, COUNT(s.id) as session_count
         FROM licenses l
         JOIN plans p ON p.id = l.plan_id
         LEFT JOIN sessions s ON s.org_id = l.org_id
            AND s.created_at >= date_trunc('month', NOW())
         WHERE l.org_id = $1 AND l.status IN ('active', 'trial')
         GROUP BY p.name`,
        [orgId]
    );

    if (result.rows.length === 0) {
        return { allowed: false, used: 0, limit: 0, remaining: 0, reason: 'No active license' };
    }

    const { plan_name, session_count } = result.rows[0];
    const quotas = PLAN_QUOTAS[plan_name] || PLAN_QUOTAS['Free'];
    const used = parseInt(session_count, 10);
    const limit = quotas.maxSessionsPerMonth;

    if (limit === -1) {
        return { allowed: true, used, limit: -1, remaining: -1 };
    }

    const maxFromEnv = config.MAX_SESSIONS_PER_ORG;
    const effectiveLimit = Math.min(limit, maxFromEnv);

    return {
        allowed: used < effectiveLimit,
        used,
        limit: effectiveLimit,
        remaining: Math.max(0, effectiveLimit - used),
        reason: used >= effectiveLimit ? 'Session quota exceeded' : undefined,
    };
}

/**
 * Check if org can add more overlay clients to a session.
 */
export function checkOverlayClientQuota(
    sessionId: string,
    clientId: string,
    planName: string
): QuotaStatus {
    const config = getConfig();
    const quotas = PLAN_QUOTAS[planName] || PLAN_QUOTAS['Free'];

    let clients = sessionOverlayClients.get(sessionId);
    if (!clients) {
        clients = new Set();
        sessionOverlayClients.set(sessionId, clients);
    }

    // If client already connected, allow
    if (clients.has(clientId)) {
        return { allowed: true, used: clients.size, limit: quotas.maxConcurrentOverlays, remaining: 0 };
    }

    const maxFromEnv = config.MAX_OVERLAY_CLIENTS_PER_SESSION;
    const effectiveLimit = Math.min(quotas.maxConcurrentOverlays, maxFromEnv);

    if (clients.size >= effectiveLimit) {
        return {
            allowed: false,
            used: clients.size,
            limit: effectiveLimit,
            remaining: 0,
            reason: 'Max overlay clients reached',
        };
    }

    return {
        allowed: true,
        used: clients.size,
        limit: effectiveLimit,
        remaining: effectiveLimit - clients.size,
    };
}

/**
 * Register overlay client connection.
 */
export function registerOverlayClient(sessionId: string, clientId: string): void {
    let clients = sessionOverlayClients.get(sessionId);
    if (!clients) {
        clients = new Set();
        sessionOverlayClients.set(sessionId, clients);
    }
    clients.add(clientId);
}

/**
 * Unregister overlay client.
 */
export function unregisterOverlayClient(sessionId: string, clientId: string): void {
    const clients = sessionOverlayClients.get(sessionId);
    if (clients) {
        clients.delete(clientId);
    }
}

/**
 * Check API rate limit for org.
 */
export function checkApiRateLimit(orgId: string, planName: string): QuotaStatus {
    const quotas = PLAN_QUOTAS[planName] || PLAN_QUOTAS['Free'];
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour

    let window = orgApiCalls.get(orgId);

    if (!window || now - window.windowStart > windowMs) {
        window = { count: 0, windowStart: now };
        orgApiCalls.set(orgId, window);
    }

    const limit = quotas.maxApiCallsPerHour;

    if (limit === -1) {
        window.count++;
        return { allowed: true, used: window.count, limit: -1, remaining: -1 };
    }

    if (window.count >= limit) {
        return {
            allowed: false,
            used: window.count,
            limit,
            remaining: 0,
            reason: 'API rate limit exceeded',
        };
    }

    window.count++;
    return {
        allowed: true,
        used: window.count,
        limit,
        remaining: limit - window.count,
    };
}

/**
 * Check replay storage quota.
 */
export async function checkReplayStorageQuota(orgId: string): Promise<QuotaStatus> {
    const config = getConfig();

    const result = await pool.query(
        `SELECT p.name as plan_name
         FROM licenses l
         JOIN plans p ON p.id = l.plan_id
         WHERE l.org_id = $1 AND l.status IN ('active', 'trial')`,
        [orgId]
    );

    if (result.rows.length === 0) {
        return { allowed: false, used: 0, limit: 0, remaining: 0, reason: 'No active license' };
    }

    const planName = result.rows[0].plan_name;
    const quotas = PLAN_QUOTAS[planName] || PLAN_QUOTAS['Free'];

    // Estimate storage (simplified - would use actual disk usage in production)
    const storageResult = await pool.query(
        `SELECT COUNT(*) * 0.001 as estimated_gb
         FROM telemetry_frames tf
         JOIN sessions s ON s.id = tf.session_id
         WHERE s.org_id = $1`,
        [orgId]
    );

    const usedGB = parseFloat(storageResult.rows[0]?.estimated_gb || 0);
    const maxFromEnv = config.MAX_REPLAY_STORAGE_GB;
    const effectiveLimit = Math.min(quotas.maxReplayStorageGB, maxFromEnv);

    return {
        allowed: usedGB < effectiveLimit,
        used: usedGB,
        limit: effectiveLimit,
        remaining: Math.max(0, effectiveLimit - usedGB),
        reason: usedGB >= effectiveLimit ? 'Replay storage quota exceeded' : undefined,
    };
}

// =====================================================================
// Kill Switch
// =====================================================================

/**
 * Check if telemetry ingestion is enabled.
 */
export function isIngestionEnabled(): boolean {
    return getConfig().TELEMETRY_INGEST_ENABLED;
}

// =====================================================================
// Export
// =====================================================================

export const quotas = {
    checkSessionQuota,
    checkOverlayClientQuota,
    registerOverlayClient,
    unregisterOverlayClient,
    checkApiRateLimit,
    checkReplayStorageQuota,
    isIngestionEnabled,
    PLAN_QUOTAS,
};

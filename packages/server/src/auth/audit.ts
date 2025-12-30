// =====================================================================
// Audit Logging (Week 11)
// Lightweight audit trail for sensitive actions.
// =====================================================================

import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool.js';

// =====================================================================
// Types
// =====================================================================

export type AuditAction =
    // Auth
    | 'auth:login'
    | 'auth:logout'
    | 'auth:switch_org'
    // Steward
    | 'incident:create'
    | 'incident:update'
    | 'incident:classify'
    | 'penalty:apply'
    | 'penalty:appeal'
    // Broadcast
    | 'broadcast:command'
    | 'broadcast:set_delay'
    // Highlights
    | 'highlight:create'
    | 'highlight:update'
    | 'highlight:delete'
    // Social
    | 'social:export'
    // API Keys
    | 'apikey:create'
    | 'apikey:revoke'
    | 'apikey:rotate'
    // Membership
    | 'member:invite'
    | 'member:remove'
    | 'member:role_change'
    // License
    | 'license:upgrade'
    | 'license:downgrade'
    | 'license:cancel';

export interface AuditEntry {
    orgId?: string;
    userId?: string;
    action: AuditAction;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

// =====================================================================
// Audit Logger
// =====================================================================

/**
 * Log an audit entry.
 */
export async function audit(entry: AuditEntry): Promise<void> {
    try {
        await pool.query(
            `INSERT INTO audit_logs (org_id, user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                entry.orgId || null,
                entry.userId || null,
                entry.action,
                entry.entityType || null,
                entry.entityId || null,
                entry.metadata ? JSON.stringify(entry.metadata) : null,
                entry.ipAddress || null,
                entry.userAgent || null,
            ]
        );
    } catch (err) {
        // Don't throw on audit failure - log and continue
        console.error('Audit log error:', err);
    }
}

/**
 * Audit helper that extracts context from request.
 */
export function auditFromRequest(
    req: Request,
    action: AuditAction,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    return audit({
        orgId: req.headers['x-org-id'] as string,
        userId: req.headers['x-user-id'] as string,
        action,
        entityType,
        entityId,
        metadata,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    });
}

// =====================================================================
// Audit Middleware
// =====================================================================

/**
 * Actions that should be audited automatically.
 */
const AUTO_AUDIT_ROUTES: Record<string, { action: AuditAction; entityType?: string }> = {
    'POST /api/auth/login': { action: 'auth:login' },
    'POST /api/auth/logout': { action: 'auth:logout' },
    'POST /api/auth/switch-org': { action: 'auth:switch_org', entityType: 'organization' },
    'POST /api/highlights': { action: 'highlight:create', entityType: 'highlight' },
    'PATCH /api/highlights/:id': { action: 'highlight:update', entityType: 'highlight' },
    'DELETE /api/highlights/:id': { action: 'highlight:delete', entityType: 'highlight' },
    'POST /api/orgs/:orgId/apikeys': { action: 'apikey:create', entityType: 'apikey' },
    'DELETE /api/orgs/:orgId/apikeys/:keyId': { action: 'apikey:revoke', entityType: 'apikey' },
    'POST /api/orgs/:orgId/apikeys/:keyId/rotate': { action: 'apikey:rotate', entityType: 'apikey' },
};

/**
 * Middleware to automatically audit certain routes.
 */
export function auditMiddleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Store original end to hook into response
        const originalEnd = res.end;
        const startTime = Date.now();

        res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
            // Only audit successful responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const routeKey = `${req.method} ${req.route?.path || req.path}`;
                const auditConfig = AUTO_AUDIT_ROUTES[routeKey];

                if (auditConfig) {
                    // Extract entity ID from params
                    const entityId = req.params.id || req.params.keyId || req.params.orgId;

                    audit({
                        orgId: req.headers['x-org-id'] as string,
                        userId: req.headers['x-user-id'] as string,
                        action: auditConfig.action,
                        entityType: auditConfig.entityType,
                        entityId,
                        metadata: {
                            durationMs: Date.now() - startTime,
                            statusCode: res.statusCode,
                        },
                        ipAddress: req.ip,
                        userAgent: req.headers['user-agent'],
                    }).catch(console.error);
                }
            }

            return originalEnd.call(this, chunk, encoding, callback);
        };

        next();
    };
}

// =====================================================================
// Query Audit Log
// =====================================================================

export interface AuditLogQuery {
    orgId?: string;
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
}

/**
 * Query audit logs with filters.
 */
export async function queryAuditLogs(query: AuditLogQuery): Promise<{
    logs: AuditEntry[];
    total: number;
}> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.orgId) {
        conditions.push(`org_id = $${paramIndex++}`);
        params.push(query.orgId);
    }
    if (query.userId) {
        conditions.push(`user_id = $${paramIndex++}`);
        params.push(query.userId);
    }
    if (query.action) {
        conditions.push(`action = $${paramIndex++}`);
        params.push(query.action);
    }
    if (query.entityType) {
        conditions.push(`entity_type = $${paramIndex++}`);
        params.push(query.entityType);
    }
    if (query.entityId) {
        conditions.push(`entity_id = $${paramIndex++}`);
        params.push(query.entityId);
    }
    if (query.fromDate) {
        conditions.push(`created_at >= $${paramIndex++}`);
        params.push(query.fromDate);
    }
    if (query.toDate) {
        conditions.push(`created_at <= $${paramIndex++}`);
        params.push(query.toDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = query.limit || 100;
    const offset = query.offset || 0;

    const [logsResult, countResult] = await Promise.all([
        pool.query(
            `SELECT * FROM audit_logs ${whereClause} 
             ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
            [...params, limit, offset]
        ),
        pool.query(
            `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
            params
        ),
    ]);

    return {
        logs: logsResult.rows,
        total: parseInt(countResult.rows[0].total, 10),
    };
}

// =====================================================================
// Export
// =====================================================================

export const auditLogger = {
    audit,
    auditFromRequest,
    auditMiddleware,
    queryAuditLogs,
};

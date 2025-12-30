// =====================================================================
// Admin Routes (Week 13)
// Admin-only endpoints for plan and usage management.
// =====================================================================

import { Router, type Request, type Response } from 'express';
import { pool } from '../../db/pool.js';
import { getPlan, getPublicPlans, PLANS, type PlanId } from '../../plans/plan-definitions.js';
import { quotaEnforcement } from '../../plans/quota-enforcement.js';
import { planTransitions } from '../../plans/plan-transitions.js';
import { queryAuditLogs } from '../../auth/audit.js';

export const adminRouter = Router();

// =====================================================================
// GET /api/admin/orgs/:orgId
// =====================================================================

adminRouter.get('/orgs/:orgId', async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const userRole = req.headers['x-user-role'] as string;

    if (userRole !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    try {
        // Get org details
        const orgResult = await pool.query(
            `SELECT o.*, l.status as license_status, p.id as plan_id, p.name as plan_name
             FROM organizations o
             LEFT JOIN licenses l ON l.org_id = o.id
             LEFT JOIN plans p ON p.id = l.plan_id
             WHERE o.id = $1`,
            [orgId]
        );

        if (orgResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Organization not found' });
        }

        const org = orgResult.rows[0];
        const planId = (org.plan_id || 'free') as PlanId;
        const plan = getPlan(planId);

        // Get current usage
        const [sessions, storage, seats, apiCalls] = await Promise.all([
            quotaEnforcement.checkSessionCreation(orgId, planId),
            quotaEnforcement.checkReplayStorage(orgId, planId),
            quotaEnforcement.checkSeatAllocation(orgId, planId),
            pool.query(
                `SELECT COUNT(*) as count FROM audit_logs 
                 WHERE org_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
                [orgId]
            ),
        ]);

        return res.json({
            success: true,
            data: {
                org: {
                    id: org.id,
                    name: org.name,
                    slug: org.slug,
                    createdAt: org.created_at,
                },
                license: {
                    planId,
                    planName: plan.name,
                    status: org.license_status || 'none',
                },
                usage: {
                    sessions: { used: sessions.used, limit: sessions.limit },
                    storage: { used: storage.used, limit: storage.limit },
                    seats: { used: seats.used, limit: seats.limit },
                    apiCalls: { used: parseInt(apiCalls.rows[0].count, 10), limit: plan.features.maxApiCallsPerHour },
                },
                features: plan.features.features,
                limits: {
                    telemetryRetentionDays: plan.features.telemetryRetentionDays,
                    maxConcurrentSessions: plan.features.maxConcurrentSessions,
                    maxOverlayClients: plan.features.maxOverlayClients,
                },
            },
        });

    } catch (err) {
        console.error('Admin org fetch error:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch organization' });
    }
});

// =====================================================================
// GET /api/admin/orgs/:orgId/usage
// =====================================================================

adminRouter.get('/orgs/:orgId/usage', async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const userRole = req.headers['x-user-role'] as string;

    if (userRole !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    try {
        // Get plan
        const licenseResult = await pool.query(
            `SELECT p.id as plan_id FROM licenses l
             JOIN plans p ON p.id = l.plan_id
             WHERE l.org_id = $1 AND l.status IN ('active', 'trial')`,
            [orgId]
        );
        const planId = (licenseResult.rows[0]?.plan_id || 'free') as PlanId;

        // Get usage over time
        const usageResult = await pool.query(
            `SELECT 
                date_trunc('day', created_at) as day,
                COUNT(*) as sessions_created
             FROM sessions
             WHERE org_id = $1 AND created_at > NOW() - INTERVAL '30 days'
             GROUP BY date_trunc('day', created_at)
             ORDER BY day`,
            [orgId]
        );

        const storageResult = await pool.query(
            `SELECT 
                date_trunc('day', s.created_at) as day,
                SUM(s.storage_bytes) / (1024 * 1024 * 1024.0) as storage_gb
             FROM sessions s
             WHERE s.org_id = $1 AND s.created_at > NOW() - INTERVAL '30 days'
             GROUP BY date_trunc('day', s.created_at)
             ORDER BY day`,
            [orgId]
        );

        return res.json({
            success: true,
            data: {
                planId,
                dailySessions: usageResult.rows,
                dailyStorage: storageResult.rows,
            },
        });

    } catch (err) {
        console.error('Admin usage fetch error:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch usage' });
    }
});

// =====================================================================
// GET /api/admin/orgs/:orgId/audit
// =====================================================================

adminRouter.get('/orgs/:orgId/audit', async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { limit = '50', offset = '0' } = req.query;
    const userRole = req.headers['x-user-role'] as string;

    if (userRole !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    try {
        const { logs, total } = await queryAuditLogs({
            orgId,
            limit: parseInt(limit as string, 10),
            offset: parseInt(offset as string, 10),
        });

        return res.json({
            success: true,
            data: { logs, total },
        });

    } catch (err) {
        console.error('Admin audit fetch error:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
});

// =====================================================================
// POST /api/admin/orgs/:orgId/plan/preview
// =====================================================================

adminRouter.post('/orgs/:orgId/plan/preview', async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { newPlanId } = req.body;
    const userRole = req.headers['x-user-role'] as string;

    if (userRole !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (!newPlanId || !PLANS[newPlanId as PlanId]) {
        return res.status(400).json({ success: false, error: 'Invalid plan ID' });
    }

    try {
        const preview = await planTransitions.previewPlanChange(orgId, newPlanId as PlanId);
        return res.json({ success: true, data: preview });
    } catch (err) {
        console.error('Plan preview error:', err);
        return res.status(500).json({ success: false, error: 'Failed to preview plan change' });
    }
});

// =====================================================================
// POST /api/admin/orgs/:orgId/plan/apply
// =====================================================================

adminRouter.post('/orgs/:orgId/plan/apply', async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { newPlanId, confirmed } = req.body;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    if (userRole !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (!newPlanId || !PLANS[newPlanId as PlanId]) {
        return res.status(400).json({ success: false, error: 'Invalid plan ID' });
    }

    try {
        const result = await planTransitions.applyPlanChange(
            orgId,
            newPlanId as PlanId,
            userId,
            confirmed
        );

        if (!result.success) {
            return res.status(400).json({ success: false, errors: result.errors });
        }

        return res.json({ success: true, data: result });

    } catch (err) {
        console.error('Plan apply error:', err);
        return res.status(500).json({ success: false, error: 'Failed to apply plan change' });
    }
});

// =====================================================================
// GET /api/admin/plans
// =====================================================================

adminRouter.get('/plans', async (req: Request, res: Response) => {
    const userRole = req.headers['x-user-role'] as string;

    if (userRole !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    return res.json({
        success: true,
        data: {
            plans: Object.values(PLANS).map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                isPublic: p.isPublic,
                features: p.features,
            })),
            publicPlans: getPublicPlans().map(p => p.id),
        },
    });
});

// =====================================================================
// POST /api/admin/orgs/:orgId/contact-sales
// =====================================================================

adminRouter.post('/orgs/:orgId/contact-sales', async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { message } = req.body;
    const userId = req.headers['x-user-id'] as string;

    // Mark org as interested in enterprise
    await pool.query(
        `UPDATE organizations 
         SET settings = settings || '{"contactSales": true, "contactSalesDate": "${new Date().toISOString()}"}'::jsonb
         WHERE id = $1`,
        [orgId]
    );

    // Log for sales follow-up
    console.log(`[SALES LEAD] Org ${orgId} requested contact. User: ${userId}. Message: ${message}`);

    return res.json({
        success: true,
        data: { message: 'Sales team will contact you shortly' },
    });
});

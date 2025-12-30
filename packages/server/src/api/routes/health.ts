// =====================================================================
// Health Check Routes (Week 5 Enhanced)
// =====================================================================

import { Router, type Request, type Response } from 'express';
import type { HealthCheckResponse } from '@controlbox/common';
import { pool } from '../../db/pool.js';
import { metricsRegistry } from '../../observability/metrics.registry.js';

export const healthRouter = Router();

/**
 * GET /api/health
 * Basic health check - always returns status + uptime
 */
healthRouter.get('/', async (_req: Request, res: Response) => {
    const uptimeMs = Date.now() - metricsRegistry.getMetrics().startedAt;

    // Check database
    let dbStatus: 'ok' | 'error' = 'error';
    try {
        await pool.query('SELECT 1');
        dbStatus = 'ok';
    } catch {
        dbStatus = 'error';
    }

    const isHealthy = dbStatus === 'ok';

    const response: HealthCheckResponse = {
        status: isHealthy ? 'healthy' : 'degraded',
        version: '0.1.0-alpha',
        uptime: uptimeMs / 1000,  // seconds
        checks: {
            database: dbStatus,
            redis: 'ok',  // TODO: Check Redis when implemented
            ai: 'disabled',
        },
        timestamp: new Date().toISOString(),
    };

    res.status(isHealthy ? 200 : 503).json({
        success: true,
        data: response,
    });
});

/**
 * GET /api/health/ready
 * Readiness check - returns 200 ONLY if all systems are ready
 */
healthRouter.get('/ready', async (_req: Request, res: Response) => {
    const readiness = metricsRegistry.isReady();

    // Also check database
    let dbReady = false;
    try {
        await pool.query('SELECT 1');
        dbReady = true;
    } catch {
        dbReady = false;
    }

    if (!dbReady) {
        res.status(503).json({
            ready: false,
            reason: 'database_not_ready',
        });
        return;
    }

    if (!readiness.ready) {
        res.status(503).json({
            ready: false,
            reason: readiness.reason,
        });
        return;
    }

    res.json({
        ready: true,
        checks: {
            database: true,
            websocket: true,
            subscriptionRegistry: true,
            timingGenerator: true,
        },
    });
});

/**
 * GET /api/health/live
 * Liveness check - minimal check that process is running
 */
healthRouter.get('/live', (_req: Request, res: Response) => {
    res.json({ alive: true, timestamp: Date.now() });
});

/**
 * GET /api/metrics/realtime
 * Realtime telemetry flow metrics (safe for production)
 */
healthRouter.get('/metrics', (_req: Request, res: Response) => {
    const metrics = metricsRegistry.getMetrics();
    res.json({
        timestamp: new Date().toISOString(),
        ...metrics,
    });
});


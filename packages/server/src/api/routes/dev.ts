// =====================================================================
// Dev Routes (DEV ONLY - blocked in production)
// Exposes internal metrics and debug endpoints for development.
// =====================================================================

import { Router, type Request, type Response } from 'express';
import { getAllMetrics, getAllSessions } from '../../gateway/relay/relay.metrics.js';
import {
    getAllSubscriptions,
    getAllBurstCooldowns,
    getAllFatFrameGrants,
    getStats,
} from '../../gateway/subscriptions/subscription.registry.js';

export const devRouter = Router();

// Block all dev routes in production
devRouter.use((_req: Request, res: Response, next) => {
    if (process.env.NODE_ENV === 'production') {
        res.status(403).json({
            error: 'Dev endpoints not available in production',
        });
        return;
    }
    next();
});

/**
 * GET /api/dev/relay-metrics
 * Returns in-memory relay metrics for all sessions
 */
devRouter.get('/relay-metrics', (_req: Request, res: Response) => {
    const metrics = getAllMetrics();
    res.json({
        timestamp: new Date().toISOString(),
        sessionCount: metrics.length,
        sessions: metrics,
    });
});

/**
 * GET /api/dev/relay-sessions
 * Returns all active relay sessions
 */
devRouter.get('/relay-sessions', (_req: Request, res: Response) => {
    const sessions = getAllSessions();
    res.json({
        timestamp: new Date().toISOString(),
        sessionCount: sessions.length,
        sessions: sessions.map(s => ({
            sessionId: s.sessionId,
            createdAt: s.createdAt,
            lastUpdatedAt: s.lastUpdatedAt,
            trackName: s.sessionData.TrackName,
            driverName: s.sessionData.DriverName,
            sessionType: s.sessionData.SessionType,
        })),
    });
});

/**
 * GET /api/dev/subscriptions
 * Returns all active subscriptions
 */
devRouter.get('/subscriptions', (_req: Request, res: Response) => {
    const subscriptions = getAllSubscriptions();
    const stats = getStats();
    res.json({
        timestamp: new Date().toISOString(),
        stats,
        subscriptions: subscriptions.map(s => ({
            id: s.id,
            socketId: s.socketId,
            sessionId: s.sessionId,
            driverId: s.driverId,
            event: s.event,
            requestedRateHz: s.requestedRateHz,
            actualRateHz: s.actualRateHz,
            role: s.role,
            surface: s.surface,
            isBurst: s.isBurst,
            expiresAtMs: s.expiresAtMs,
            frameCount: s.frameCount,
        })),
    });
});

/**
 * GET /api/dev/bursts
 * Returns all burst cooldowns and fat frame grants
 */
devRouter.get('/bursts', (_req: Request, res: Response) => {
    const cooldowns = getAllBurstCooldowns();
    const fatGrants = getAllFatFrameGrants();
    res.json({
        timestamp: new Date().toISOString(),
        cooldowns: cooldowns.map(c => ({
            socketId: c.socketId,
            driverId: c.driverId,
            cooldownUntilMs: c.cooldownUntilMs,
            remainingMs: Math.max(0, c.cooldownUntilMs - Date.now()),
        })),
        fatGrants: fatGrants.map(g => ({
            socketId: g.socketId,
            sessionId: g.sessionId,
            driverId: g.driverId,
            grantedAtMs: g.grantedAtMs,
            rateHz: g.rateHz,
        })),
    });
});


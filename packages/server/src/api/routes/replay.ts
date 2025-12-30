// =====================================================================
// Replay API Routes (Week 6)
// Role-aware telemetry replay with time-bounded queries.
// =====================================================================

import { Router, Request, Response } from 'express';
import { pool } from '../../db/pool.js';
import type { TelemetryRole, Surface } from '../../gateway/subscriptions/subscription.types.js';

export const replayRouter = Router();

// =====================================================================
// Types
// =====================================================================

interface ReplayQueryParams {
    fromMs?: string;
    toMs?: string;
    driverId?: string;
    surface?: string;
    role?: string;
    speed?: string;  // 1, 2, 5 for playback speed
}

interface ReplayMetadata {
    sessionId: string;
    startTimeMs: number;
    endTimeMs: number;
    durationMs: number;
    driversCount: number;
    totalFrames: number;
    allowedRoles: TelemetryRole[];
}

// =====================================================================
// GET /api/replay/sessions/:id
// Returns session replay metadata
// =====================================================================

replayRouter.get('/sessions/:id', async (req: Request, res: Response) => {
    const sessionId = req.params.id;

    try {
        // Get session boundaries
        const result = await pool.query(`
SELECT
session_id,
    MIN(session_time_ms) as start_ms,
    MAX(session_time_ms) as end_ms,
    COUNT(DISTINCT driver_id) as drivers,
    COUNT(*) as total_frames
            FROM telemetry_thin
            WHERE session_id = $1
            GROUP BY session_id
    `, [sessionId]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Session not found or no replay data' });
            return;
        }

        const row = result.rows[0];
        const metadata: ReplayMetadata = {
            sessionId: row.session_id,
            startTimeMs: parseInt(row.start_ms),
            endTimeMs: parseInt(row.end_ms),
            durationMs: parseInt(row.end_ms) - parseInt(row.start_ms),
            driversCount: parseInt(row.drivers),
            totalFrames: parseInt(row.total_frames),
            allowedRoles: ['driver', 'team', 'race_control', 'broadcast'],
        };

        res.json({ success: true, data: metadata });

    } catch (error) {
        console.error('Replay metadata error:', error);
        res.status(500).json({ error: 'Failed to fetch replay metadata' });
    }
});

// =====================================================================
// GET /api/replay/sessions/:id/telemetry
// Returns telemetry frames for replay (role-aware redaction)
// =====================================================================

replayRouter.get('/sessions/:id/telemetry', async (req: Request, res: Response) => {
    const sessionId = req.params.id;
    const { fromMs, toMs, driverId, surface, role } = req.query as ReplayQueryParams;

    // Validate required params
    if (!fromMs || !toMs) {
        res.status(400).json({ error: 'fromMs and toMs are required' });
        return;
    }

    const fromMsNum = parseInt(fromMs);
    const toMsNum = parseInt(toMs);

    // Limit query window to 60 seconds max
    if (toMsNum - fromMsNum > 60000) {
        res.status(400).json({ error: 'Query window cannot exceed 60 seconds' });
        return;
    }

    const requestedRole = (role || 'broadcast') as TelemetryRole;
    const requestedSurface = (surface || 'controlbox') as Surface;

    try {
        // Determine which table to query based on role
        const useFatFrames = requestedRole === 'driver' || requestedRole === 'team';

        let query: string;
        const params: unknown[] = [sessionId, fromMsNum, toMsNum];

        if (useFatFrames && driverId) {
            // Driver/Team can get fat frames for specific driver
            params.push(driverId);
            query = `
SELECT
t.session_id,
    t.timestamp,
    t.driver_id,
    t.driver_name,
    t.lap,
    t.lap_dist_pct,
    t.track_position,
    t.speed,
    t.gear,
    t.last_lap_time,
    t.best_lap_time,
    t.gap_to_leader,
    t.gap_ahead,
    t.in_pit,
    t.session_time_ms,
    f.throttle,
    f.brake,
    f.steering,
    f.rpm,
    f.fuel_level,
    f.tire_temps
                FROM telemetry_thin t
                LEFT JOIN telemetry_fat f 
                    ON t.session_id = f.session_id 
                    AND t.timestamp = f.timestamp 
                    AND t.driver_id = f.driver_id
                WHERE t.session_id = $1
                    AND t.session_time_ms >= $2
                    AND t.session_time_ms <= $3
                    AND t.driver_id = $4
                ORDER BY t.session_time_ms ASC
                LIMIT 1000
    `;
        } else {
            // Thin frames only (broadcast, race control)
            query = `
SELECT
session_id,
    timestamp,
    driver_id,
    driver_name,
    lap,
    lap_dist_pct,
    track_position,
    speed,
    gear,
    last_lap_time,
    best_lap_time,
    gap_to_leader,
    gap_ahead,
    in_pit,
    session_time_ms
                FROM telemetry_thin
                WHERE session_id = $1
                    AND session_time_ms >= $2
                    AND session_time_ms <= $3
                ${driverId ? 'AND driver_id = $4' : ''}
                ORDER BY session_time_ms ASC
                LIMIT 1000
    `;
            if (driverId) params.push(driverId);
        }

        const result = await pool.query(query, params);

        // Apply role-based redaction
        const frames = result.rows.map(row => redactForRole(row, requestedRole, requestedSurface));

        res.json({
            success: true,
            data: {
                sessionId,
                fromMs: fromMsNum,
                toMs: toMsNum,
                role: requestedRole,
                surface: requestedSurface,
                frameCount: frames.length,
                frames,
            },
        });

    } catch (error) {
        console.error('Replay telemetry error:', error);
        res.status(500).json({ error: 'Failed to fetch replay telemetry' });
    }
});

// =====================================================================
// GET /api/replay/sessions/:id/timing
// Returns timing snapshots for replay
// =====================================================================

replayRouter.get('/sessions/:id/timing', async (req: Request, res: Response) => {
    const sessionId = req.params.id;
    const { fromMs, toMs } = req.query as ReplayQueryParams;

    if (!fromMs || !toMs) {
        res.status(400).json({ error: 'fromMs and toMs are required' });
        return;
    }

    const fromMsNum = parseInt(fromMs);
    const toMsNum = parseInt(toMs);

    if (toMsNum - fromMsNum > 300000) {  // 5 minute max for timing
        res.status(400).json({ error: 'Query window cannot exceed 5 minutes' });
        return;
    }

    try {
        const result = await pool.query(`
SELECT
session_id,
    timestamp,
    session_time_ms,
    entries,
    session_state,
    leader_id,
    fastest_lap_time
            FROM session_timing_snapshots
            WHERE session_id = $1
                AND session_time_ms >= $2
                AND session_time_ms <= $3
            ORDER BY session_time_ms ASC
            LIMIT 600
    `, [sessionId, fromMsNum, toMsNum]);

        res.json({
            success: true,
            data: {
                sessionId,
                fromMs: fromMsNum,
                toMs: toMsNum,
                snapshotCount: result.rows.length,
                snapshots: result.rows,
            },
        });

    } catch (error) {
        console.error('Replay timing error:', error);
        res.status(500).json({ error: 'Failed to fetch replay timing' });
    }
});

// =====================================================================
// GET /api/replay/incidents/:id
// Returns incident-centered replay window
// =====================================================================

replayRouter.get('/incidents/:id', async (req: Request, res: Response) => {
    const incidentId = req.params.id;
    const { role } = req.query as { role?: string };
    const requestedRole = (role || 'race_control') as TelemetryRole;

    try {
        // Get incident details
        const incidentResult = await pool.query(`
SELECT
id,
    session_id,
    incident_time_ms,
    involved_drivers,
    window_start_ms,
    window_end_ms,
    trigger_type,
    severity,
    status
            FROM incidents
            WHERE id = $1
    `, [incidentId]);

        if (incidentResult.rows.length === 0) {
            res.status(404).json({ error: 'Incident not found' });
            return;
        }

        const incident = incidentResult.rows[0];
        const sessionId = incident.session_id;
        const windowStart = incident.window_start_ms;
        const windowEnd = incident.window_end_ms || (incident.incident_time_ms + 10000);
        const involvedDrivers = incident.involved_drivers || [];

        // Determine if fat frames are allowed
        const canSeeFatFrames = requestedRole === 'race_control' || requestedRole === 'driver';

        // Get telemetry for involved drivers
        let telemetryQuery: string;
        const params: unknown[] = [sessionId, windowStart, windowEnd, involvedDrivers];

        if (canSeeFatFrames) {
            telemetryQuery = `
SELECT
t.*,
    f.throttle,
    f.brake,
    f.steering,
    f.rpm
                FROM telemetry_thin t
                LEFT JOIN telemetry_fat f 
                    ON t.session_id = f.session_id 
                    AND t.timestamp = f.timestamp 
                    AND t.driver_id = f.driver_id
                WHERE t.session_id = $1
                    AND t.session_time_ms >= $2
                    AND t.session_time_ms <= $3
                    AND t.driver_id = ANY($4)
                ORDER BY t.session_time_ms ASC
    `;
        } else {
            telemetryQuery = `
SELECT *
    FROM telemetry_thin
                WHERE session_id = $1
                    AND session_time_ms >= $2
                    AND session_time_ms <= $3
                    AND driver_id = ANY($4)
                ORDER BY session_time_ms ASC
    `;
        }

        const telemetryResult = await pool.query(telemetryQuery, params);

        // Get steward actions if any
        const actionsResult = await pool.query(`
SELECT * FROM steward_actions
            WHERE incident_id = $1
            ORDER BY applied_at ASC
    `, [incidentId]);

        res.json({
            success: true,
            data: {
                incident: {
                    id: incident.id,
                    sessionId,
                    incidentTimeMs: incident.incident_time_ms,
                    involvedDrivers,
                    triggerType: incident.trigger_type,
                    severity: incident.severity,
                    status: incident.status,
                },
                window: {
                    startMs: windowStart,
                    endMs: windowEnd,
                    durationMs: windowEnd - windowStart,
                },
                telemetry: telemetryResult.rows,
                stewardActions: actionsResult.rows,
            },
        });

    } catch (error) {
        console.error('Incident replay error:', error);
        res.status(500).json({ error: 'Failed to fetch incident replay' });
    }
});

// =====================================================================
// Helper: Role-based redaction
// Same rules as live telemetry
// =====================================================================

function redactForRole(row: Record<string, unknown>, role: TelemetryRole, _surface: Surface): Record<string, unknown> {
    // Broadcast: no inputs, no tire data
    if (role === 'broadcast') {
        delete row.throttle;
        delete row.brake;
        delete row.steering;
        delete row.rpm;
        delete row.fuel_level;
        delete row.tire_temps;
    }

    // Race control: can see everything
    // Driver/Team: can see their own data (already filtered by query)

    return row;
}

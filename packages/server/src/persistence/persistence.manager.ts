// =====================================================================
// Persistence Manager (Week 6)
// Non-blocking telemetry persistence with ring buffer and batch writes.
// =====================================================================

import { pool } from '../db/pool.js';
import { ThinCanonicalFrame, FatCanonicalFrame } from '../gateway/translation/relay-to-canonical.js';
import { metricsRegistry } from '../observability/metrics.registry.js';
import type { TimingSnapshot } from '../gateway/sessions/session.registry.js';

// =====================================================================
// Configuration
// =====================================================================

const CONFIG = {
    // Ring buffer size per session
    THIN_BUFFER_SIZE: 1000,
    FAT_BUFFER_SIZE: 200,
    TIMING_BUFFER_SIZE: 100,

    // Flush intervals
    FLUSH_INTERVAL_MS: 500,      // Flush every 500ms
    MAX_BATCH_SIZE: 500,         // Max frames per batch insert

    // Backpressure thresholds
    BUFFER_HIGH_WATER: 0.8,      // 80% - start dropping fat frames
    BUFFER_CRITICAL: 0.95,       // 95% - drop everything except incidents

    // Enabled flags
    PERSISTENCE_ENABLED: process.env.PERSISTENCE_ENABLED !== 'false',
};

// =====================================================================
// Types
// =====================================================================

interface PersistenceBuffer<T> {
    items: T[];
    maxSize: number;
    dropped: number;
}

interface SessionPersistenceState {
    sessionId: string;
    thinBuffer: PersistenceBuffer<ThinFrameRow>;
    fatBuffer: PersistenceBuffer<FatFrameRow>;
    timingBuffer: PersistenceBuffer<TimingRow>;
    lastFlushMs: number;
    totalThinPersisted: number;
    totalFatPersisted: number;
    totalDropped: number;
}

interface ThinFrameRow {
    session_id: string;
    timestamp: Date;
    driver_id: string;
    driver_name: string | null;
    car_number: string | null;
    lap: number;
    lap_dist_pct: number;
    track_position: number | null;
    class_position: number | null;
    speed: number;
    gear: number;
    last_lap_time: number | null;
    best_lap_time: number | null;
    current_lap_time: number | null;
    gap_to_leader: number | null;
    gap_ahead: number | null;
    in_pit: boolean;
    incident_count: number;
    is_connected: boolean;
    session_time_ms: number;
}

interface FatFrameRow extends ThinFrameRow {
    throttle: number;
    brake: number;
    clutch: number;
    steering: number;
    rpm: number;
    fuel_level: number;
    fuel_use_per_hour: number;
    tire_temps: number[];
    tire_pressures: number[];
    tire_wear: number[];
    track_temp: number;
    air_temp: number;
    lap_delta: number;
    reason: string;
}

interface TimingRow {
    session_id: string;
    timestamp: Date;
    session_time_ms: number;
    entries: unknown;
    session_state: string | null;
    session_time_elapsed: number;
    laps_remaining: number;
    leader_id: string | null;
    fastest_lap_driver: string | null;
    fastest_lap_time: number | null;
    fastest_lap_number: number;
}

// =====================================================================
// State
// =====================================================================

const sessionStates = new Map<string, SessionPersistenceState>();
let flushIntervalId: NodeJS.Timeout | null = null;
let isDbAvailable = true;
let lastDbCheckMs = 0;

// =====================================================================
// Public API
// =====================================================================

export function startPersistence(): void {
    if (!CONFIG.PERSISTENCE_ENABLED) {
        console.log('📦 Persistence DISABLED (PERSISTENCE_ENABLED=false)');
        return;
    }

    if (flushIntervalId) {
        return;
    }

    flushIntervalId = setInterval(flushAll, CONFIG.FLUSH_INTERVAL_MS);
    console.log('📦 Persistence started (flush every 500ms)');
}

export function stopPersistence(): void {
    if (flushIntervalId) {
        clearInterval(flushIntervalId);
        flushIntervalId = null;
    }

    // Final flush
    flushAll().catch(console.error);
    console.log('📦 Persistence stopped');
}

/**
 * Buffer a thin frame for persistence.
 * Non-blocking - returns immediately.
 */
export function persistThinFrame(frame: ThinCanonicalFrame): void {
    if (!CONFIG.PERSISTENCE_ENABLED || !isDbAvailable) return;

    const state = getOrCreateSessionState(frame.sessionId);
    const buffer = state.thinBuffer;

    // Check backpressure
    const fillRatio = buffer.items.length / buffer.maxSize;
    if (fillRatio >= CONFIG.BUFFER_CRITICAL) {
        buffer.dropped++;
        recordDrop('thin_backpressure');
        return;
    }

    // Convert to row
    const row = thinFrameToRow(frame);
    buffer.items.push(row);
}

/**
 * Buffer a fat frame for persistence.
 * Only stored for opted-in drivers or incident windows.
 */
export function persistFatFrame(
    frame: FatCanonicalFrame,
    reason: 'driver_opt_in' | 'incident_window' | 'steward_request' = 'driver_opt_in'
): void {
    if (!CONFIG.PERSISTENCE_ENABLED || !isDbAvailable) return;

    const state = getOrCreateSessionState(frame.sessionId);
    const buffer = state.fatBuffer;

    // Check backpressure - fat frames drop first
    const fillRatio = buffer.items.length / buffer.maxSize;
    if (fillRatio >= CONFIG.BUFFER_HIGH_WATER) {
        buffer.dropped++;
        recordDrop('fat_backpressure');
        return;
    }

    const row = fatFrameToRow(frame, reason);
    buffer.items.push(row);
}

/**
 * Buffer a timing snapshot for persistence.
 */
export function persistTimingSnapshot(snapshot: TimingSnapshot): void {
    if (!CONFIG.PERSISTENCE_ENABLED || !isDbAvailable) return;

    const state = getOrCreateSessionState(snapshot.sessionId);
    const buffer = state.timingBuffer;

    // Check backpressure
    if (buffer.items.length >= buffer.maxSize) {
        buffer.dropped++;
        recordDrop('timing_backpressure');
        return;
    }

    const row = timingToRow(snapshot);
    buffer.items.push(row);
}

/**
 * Get persistence stats for a session.
 */
export function getSessionPersistenceStats(sessionId: string) {
    const state = sessionStates.get(sessionId);
    if (!state) return null;

    return {
        thinBuffered: state.thinBuffer.items.length,
        fatBuffered: state.fatBuffer.items.length,
        timingBuffered: state.timingBuffer.items.length,
        totalThinPersisted: state.totalThinPersisted,
        totalFatPersisted: state.totalFatPersisted,
        totalDropped: state.totalDropped,
    };
}

// =====================================================================
// Internal: Flush Logic
// =====================================================================

async function flushAll(): Promise<void> {
    // Check DB availability every 10s if previously unavailable
    if (!isDbAvailable && Date.now() - lastDbCheckMs > 10000) {
        await checkDbAvailability();
    }

    if (!isDbAvailable) return;

    const promises: Promise<void>[] = [];

    for (const [sessionId, state] of sessionStates) {
        if (hasDataToFlush(state)) {
            promises.push(flushSession(sessionId, state));
        }
    }

    await Promise.allSettled(promises);
}

async function flushSession(sessionId: string, state: SessionPersistenceState): Promise<void> {
    const startMs = Date.now();

    try {
        // Flush thin frames
        const thinToFlush = state.thinBuffer.items.splice(0, CONFIG.MAX_BATCH_SIZE);
        if (thinToFlush.length > 0) {
            await insertThinFrames(thinToFlush);
            state.totalThinPersisted += thinToFlush.length;
        }

        // Flush fat frames
        const fatToFlush = state.fatBuffer.items.splice(0, CONFIG.MAX_BATCH_SIZE);
        if (fatToFlush.length > 0) {
            await insertFatFrames(fatToFlush);
            state.totalFatPersisted += fatToFlush.length;
        }

        // Flush timing
        const timingToFlush = state.timingBuffer.items.splice(0, CONFIG.MAX_BATCH_SIZE);
        if (timingToFlush.length > 0) {
            await insertTimingSnapshots(timingToFlush);
        }

        state.lastFlushMs = Date.now();

        // Record metrics
        const durationMs = Date.now() - startMs;
        recordFlushMetrics(sessionId, thinToFlush.length, fatToFlush.length, durationMs);

    } catch (error) {
        console.error(`❌ Flush failed for session ${sessionId}: `, error);
        isDbAvailable = false;
        lastDbCheckMs = Date.now();
        // Don't re-add items - drop on overload policy
    }
}

function hasDataToFlush(state: SessionPersistenceState): boolean {
    return (
        state.thinBuffer.items.length > 0 ||
        state.fatBuffer.items.length > 0 ||
        state.timingBuffer.items.length > 0
    );
}

// =====================================================================
// Internal: Database Operations
// =====================================================================

async function insertThinFrames(rows: ThinFrameRow[]): Promise<void> {
    if (rows.length === 0) return;

    const values: unknown[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;

    for (const row of rows) {
        placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        values.push(
            row.session_id,
            row.timestamp,
            row.driver_id,
            row.driver_name,
            row.car_number,
            row.lap,
            row.lap_dist_pct,
            row.track_position,
            row.class_position,
            row.speed,
            row.gear,
            row.last_lap_time,
            row.best_lap_time,
            row.current_lap_time,
            row.gap_to_leader,
            row.gap_ahead,
            row.in_pit,
            row.incident_count,
            row.is_connected,
            row.session_time_ms
        );
    }

    const query = `
        INSERT INTO telemetry_thin(
    session_id, timestamp, driver_id, driver_name, car_number,
    lap, lap_dist_pct, track_position, class_position,
    speed, gear, last_lap_time, best_lap_time, current_lap_time,
    gap_to_leader, gap_ahead, in_pit, incident_count, is_connected, session_time_ms
) VALUES ${placeholders.join(', ')}
        ON CONFLICT(session_id, timestamp, driver_id) DO NOTHING
    `;

    await pool.query(query, values);
}

async function insertFatFrames(rows: FatFrameRow[]): Promise<void> {
    if (rows.length === 0) return;

    const values: unknown[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;

    for (const row of rows) {
        placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        values.push(
            row.session_id,
            row.timestamp,
            row.driver_id,
            row.throttle,
            row.brake,
            row.clutch,
            row.steering,
            row.rpm,
            row.fuel_level,
            row.fuel_use_per_hour,
            row.tire_temps,
            row.tire_pressures,
            row.tire_wear,
            row.track_temp,
            row.air_temp,
            row.reason
        );
    }

    const query = `
        INSERT INTO telemetry_fat(
        session_id, timestamp, driver_id,
        throttle, brake, clutch, steering, rpm,
        fuel_level, fuel_use_per_hour,
        tire_temps, tire_pressures, tire_wear,
        track_temp, air_temp, reason
    ) VALUES ${placeholders.join(', ')}
        ON CONFLICT(session_id, timestamp, driver_id) DO NOTHING
    `;

    await pool.query(query, values);
}

async function insertTimingSnapshots(rows: TimingRow[]): Promise<void> {
    if (rows.length === 0) return;

    const values: unknown[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;

    for (const row of rows) {
        placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        values.push(
            row.session_id,
            row.timestamp,
            row.session_time_ms,
            JSON.stringify(row.entries),
            row.session_state,
            row.session_time_elapsed,
            row.laps_remaining,
            row.leader_id,
            row.fastest_lap_driver,
            row.fastest_lap_time,
            row.fastest_lap_number
        );
    }

    const query = `
        INSERT INTO session_timing_snapshots(
        session_id, timestamp, session_time_ms, entries,
        session_state, session_time_elapsed, laps_remaining, leader_id,
        fastest_lap_driver, fastest_lap_time, fastest_lap_number
    ) VALUES ${placeholders.join(', ')}
        ON CONFLICT(session_id, timestamp) DO NOTHING
    `;

    await pool.query(query, values);
}

async function checkDbAvailability(): Promise<void> {
    try {
        await pool.query('SELECT 1');
        isDbAvailable = true;
        console.log('📦 Database reconnected - persistence resumed');
    } catch {
        isDbAvailable = false;
    }
    lastDbCheckMs = Date.now();
}

// =====================================================================
// Internal: Converters
// =====================================================================

function thinFrameToRow(frame: ThinCanonicalFrame): ThinFrameRow {
    return {
        session_id: frame.sessionId,
        timestamp: new Date(frame.timestamp),
        driver_id: frame.driver.driverId,
        driver_name: frame.driver.driverName,
        car_number: frame.driver.carNumber || null,
        lap: frame.driver.lapNumber,
        lap_dist_pct: frame.driver.lapDistPct,
        track_position: frame.driver.trackPosition,
        class_position: frame.driver.classPosition,
        speed: frame.driver.speed,
        gear: frame.driver.gear,
        last_lap_time: frame.driver.lastLapTime,
        best_lap_time: frame.driver.bestLapTime,
        current_lap_time: frame.driver.currentLapTime,
        gap_to_leader: frame.driver.deltaToLeader,
        gap_ahead: frame.driver.deltaToCarAhead,
        in_pit: frame.driver.inPits,
        incident_count: frame.driver.incidentCount,
        is_connected: frame.driver.isConnected,
        session_time_ms: frame.sessionTimeMs,
    };
}

function fatFrameToRow(frame: FatCanonicalFrame, reason: string): FatFrameRow {
    const tireTemps = [
        frame.driver.tireTemps.lf.l, frame.driver.tireTemps.lf.m, frame.driver.tireTemps.lf.r,
        frame.driver.tireTemps.rf.l, frame.driver.tireTemps.rf.m, frame.driver.tireTemps.rf.r,
        frame.driver.tireTemps.lr.l, frame.driver.tireTemps.lr.m, frame.driver.tireTemps.lr.r,
        frame.driver.tireTemps.rr.l, frame.driver.tireTemps.rr.m, frame.driver.tireTemps.rr.r,
    ];

    const tirePressures = [
        frame.driver.tirePressures.lf,
        frame.driver.tirePressures.rf,
        frame.driver.tirePressures.lr,
        frame.driver.tirePressures.rr,
    ];

    const tireWear = [
        frame.driver.tireWear.lf.l, frame.driver.tireWear.lf.m, frame.driver.tireWear.lf.r,
        frame.driver.tireWear.rf.l, frame.driver.tireWear.rf.m, frame.driver.tireWear.rf.r,
        frame.driver.tireWear.lr.l, frame.driver.tireWear.lr.m, frame.driver.tireWear.lr.r,
        frame.driver.tireWear.rr.l, frame.driver.tireWear.rr.m, frame.driver.tireWear.rr.r,
    ];

    return {
        ...thinFrameToRow(frame),
        throttle: frame.driver.throttle,
        brake: frame.driver.brake,
        clutch: frame.driver.clutch,
        steering: frame.driver.steering,
        rpm: frame.driver.rpm,
        fuel_level: frame.driver.fuelLevel,
        fuel_use_per_hour: frame.driver.fuelUsePerHour,
        tire_temps: tireTemps,
        tire_pressures: tirePressures,
        tire_wear: tireWear,
        track_temp: frame.driver.trackTemp,
        air_temp: frame.driver.airTemp,
        lap_delta: frame.driver.lapDelta,
        reason,
    };
}

function timingToRow(snapshot: TimingSnapshot): TimingRow {
    return {
        session_id: snapshot.sessionId,
        timestamp: new Date(snapshot.timestamp),
        session_time_ms: snapshot.sessionTimeMs,
        entries: snapshot.entries,
        session_state: null,
        session_time_elapsed: snapshot.sessionTimeMs / 1000,
        laps_remaining: -1,
        leader_id: snapshot.entries[0]?.driverId || null,
        fastest_lap_driver: null,
        fastest_lap_time: null,
        fastest_lap_number: 0,
    };
}

// =====================================================================
// Internal: Helpers
// =====================================================================

function getOrCreateSessionState(sessionId: string): SessionPersistenceState {
    let state = sessionStates.get(sessionId);
    if (!state) {
        state = {
            sessionId,
            thinBuffer: { items: [], maxSize: CONFIG.THIN_BUFFER_SIZE, dropped: 0 },
            fatBuffer: { items: [], maxSize: CONFIG.FAT_BUFFER_SIZE, dropped: 0 },
            timingBuffer: { items: [], maxSize: CONFIG.TIMING_BUFFER_SIZE, dropped: 0 },
            lastFlushMs: 0,
            totalThinPersisted: 0,
            totalFatPersisted: 0,
            totalDropped: 0,
        };
        sessionStates.set(sessionId, state);
    }
    return state;
}

function recordDrop(reason: string): void {
    metricsRegistry.recordDrop(`persist_${reason} `);
}

function recordFlushMetrics(sessionId: string, thin: number, fat: number, durationMs: number): void {
    // Log if slow
    if (durationMs > 100) {
        console.warn(`⚠️  Slow flush for ${sessionId}: ${durationMs} ms(thin = ${thin}, fat = ${fat})`);
    }
}

// =====================================================================
// Cleanup
// =====================================================================

export function cleanupSession(sessionId: string): void {
    sessionStates.delete(sessionId);
}

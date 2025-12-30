// =====================================================================
// Session Registry (Week 3)
// In-memory session state for deduplication and timing generation.
// =====================================================================

import type { ThinCanonicalFrame, FatCanonicalFrame } from '../translation/relay-to-canonical.js';
import type { RelaySessionData } from '../relay/relay.types.js';

// =====================================================================
// Types
// =====================================================================

export interface SessionRegistryEntry {
    sessionId: string;
    createdAtMs: number;
    lastUpdateMs: number;

    // Track info
    trackName: string;
    trackLength: number;  // meters
    sessionType: string;

    // Driver state (keyed by driverId)
    driverStates: Map<string, DriverState>;

    // Current timing snapshot (for 2Hz broadcast)
    timingSnapshot: TimingSnapshot | null;
    lastTimingEmitMs: number;
}

export interface DriverState {
    driverId: string;
    driverName: string;
    lastSeenSessionTimeMs: number;
    lastFrameMs: number;

    // Position tracking
    lapNumber: number;
    lapDistPct: number;
    trackPosition: number;

    // Timing
    lastLapTime: number;
    bestLapTime: number;

    // Dedup window (rolling 250ms of seen sessionTimeMs)
    recentSessionTimeMs: number[];
}

export interface TimingSnapshot {
    sessionId: string;
    sessionTimeMs: number;
    timestamp: number;
    entries: TimingSnapshotEntry[];
}

export interface TimingSnapshotEntry {
    driverId: string;
    driverName: string;
    position: number;
    lapNumber: number;
    lapDistPct: number;
    lastLapTime: number;
    bestLapTime: number;
    gapToLeader: number;
    gapAhead: number;
    inPit: boolean;
    isConnected: boolean;
}

// =====================================================================
// Registry
// =====================================================================

const sessions = new Map<string, SessionRegistryEntry>();

// Constants
const LATE_FRAME_WINDOW_MS = 250;
const DEDUP_TOLERANCE_MS = 50;

// =====================================================================
// Session CRUD
// =====================================================================

export function getOrCreateSession(sessionId: string): SessionRegistryEntry {
    let entry = sessions.get(sessionId);
    if (!entry) {
        const now = Date.now();
        entry = {
            sessionId,
            createdAtMs: now,
            lastUpdateMs: now,
            trackName: '',
            trackLength: 0,
            sessionType: '',
            driverStates: new Map(),
            timingSnapshot: null,
            lastTimingEmitMs: 0,
        };
        sessions.set(sessionId, entry);
    }
    return entry;
}

export function updateSessionFromSessionInfo(sessionId: string, data: RelaySessionData): void {
    const entry = getOrCreateSession(sessionId);
    entry.trackName = data.TrackName ?? entry.trackName;
    entry.trackLength = data.TrackLength ?? entry.trackLength;
    entry.sessionType = data.SessionType ?? entry.sessionType;
    entry.lastUpdateMs = Date.now();
}

export function getSession(sessionId: string): SessionRegistryEntry | undefined {
    return sessions.get(sessionId);
}

export function getAllSessionIds(): string[] {
    return Array.from(sessions.keys());
}

// =====================================================================
// Deduplication & Ordering
// =====================================================================

export interface DedupeResult {
    accept: boolean;
    reason?: 'duplicate' | 'out_of_order' | 'late';
}

export function checkDedupe(
    sessionId: string,
    driverId: string,
    sessionTimeMs: number
): DedupeResult {
    const entry = getOrCreateSession(sessionId);
    let driverState = entry.driverStates.get(driverId);

    if (!driverState) {
        // First frame for this driver
        driverState = createDriverState(driverId);
        entry.driverStates.set(driverId, driverState);
        recordSessionTime(driverState, sessionTimeMs);
        return { accept: true };
    }

    const lastSeen = driverState.lastSeenSessionTimeMs;
    const diff = sessionTimeMs - lastSeen;

    // Already seen this exact timestamp?
    if (driverState.recentSessionTimeMs.includes(sessionTimeMs)) {
        return { accept: false, reason: 'duplicate' };
    }

    // Too old (more than DEDUP_TOLERANCE_MS before last seen)?
    if (diff < -DEDUP_TOLERANCE_MS) {
        // But allow if within late window for reordering
        if (diff >= -LATE_FRAME_WINDOW_MS) {
            // Accept as late but valid
            recordSessionTime(driverState, sessionTimeMs);
            return { accept: true };
        }
        return { accept: false, reason: 'out_of_order' };
    }

    // Normal case: newer frame
    recordSessionTime(driverState, sessionTimeMs);
    return { accept: true };
}

function createDriverState(driverId: string): DriverState {
    return {
        driverId,
        driverName: '',
        lastSeenSessionTimeMs: 0,
        lastFrameMs: 0,
        lapNumber: 0,
        lapDistPct: 0,
        trackPosition: 0,
        lastLapTime: 0,
        bestLapTime: 0,
        recentSessionTimeMs: [],
    };
}

function recordSessionTime(state: DriverState, sessionTimeMs: number): void {
    state.recentSessionTimeMs.push(sessionTimeMs);

    // Keep only frames within late window
    const cutoff = sessionTimeMs - LATE_FRAME_WINDOW_MS;
    state.recentSessionTimeMs = state.recentSessionTimeMs.filter(t => t >= cutoff);

    // Update last seen if this is the newest
    if (sessionTimeMs > state.lastSeenSessionTimeMs) {
        state.lastSeenSessionTimeMs = sessionTimeMs;
    }
    state.lastFrameMs = Date.now();
}

// =====================================================================
// Driver State Update
// =====================================================================

export function updateDriverState(
    sessionId: string,
    frame: ThinCanonicalFrame | FatCanonicalFrame
): void {
    const entry = getOrCreateSession(sessionId);
    const driver = frame.driver;

    let state = entry.driverStates.get(driver.driverId);
    if (!state) {
        state = createDriverState(driver.driverId);
        entry.driverStates.set(driver.driverId, state);
    }

    state.driverName = driver.driverName;
    state.lapNumber = driver.lapNumber;
    state.lapDistPct = driver.lapDistPct;
    state.trackPosition = driver.trackPosition;
    state.lastLapTime = driver.lastLapTime;

    if (driver.bestLapTime > 0 && (state.bestLapTime === 0 || driver.bestLapTime < state.bestLapTime)) {
        state.bestLapTime = driver.bestLapTime;
    }

    entry.lastUpdateMs = Date.now();
}

// =====================================================================
// Timing Snapshot Generation
// =====================================================================

export function generateTimingSnapshot(sessionId: string, sessionTimeMs: number): TimingSnapshot | null {
    const entry = sessions.get(sessionId);
    if (!entry || entry.driverStates.size === 0) {
        return null;
    }

    const entries: TimingSnapshotEntry[] = [];
    const now = Date.now();

    for (const state of entry.driverStates.values()) {
        entries.push({
            driverId: state.driverId,
            driverName: state.driverName,
            position: state.trackPosition,
            lapNumber: state.lapNumber,
            lapDistPct: state.lapDistPct,
            lastLapTime: state.lastLapTime,
            bestLapTime: state.bestLapTime,
            gapToLeader: 0,  // Computed below
            gapAhead: 0,
            inPit: false,
            isConnected: now - state.lastFrameMs < 5000,
        });
    }

    // Sort by position
    entries.sort((a, b) => a.position - b.position);

    // Compute gaps
    if (entries.length > 0) {
        const leader = entries[0];
        for (let i = 0; i < entries.length; i++) {
            if (i > 0) {
                // Simple gap estimation based on lap/dist difference
                const prev = entries[i - 1];
                entries[i].gapAhead = estimateGap(prev, entries[i]);
                entries[i].gapToLeader = estimateGap(leader, entries[i]);
            }
        }
    }

    const snapshot: TimingSnapshot = {
        sessionId,
        sessionTimeMs,
        timestamp: now,
        entries,
    };

    entry.timingSnapshot = snapshot;
    return snapshot;
}

function estimateGap(ahead: TimingSnapshotEntry, behind: TimingSnapshotEntry): number {
    // Simple lap-based gap estimation
    const lapDiff = ahead.lapNumber - behind.lapNumber;
    if (lapDiff > 0) {
        return lapDiff * 60;  // Assume ~60s per lap as rough estimate
    }

    // Same lap: use lap distance difference (very rough)
    const distDiff = ahead.lapDistPct - behind.lapDistPct;
    return Math.abs(distDiff) * 60;  // Scale to ~seconds
}

// =====================================================================
// Timing Emit Check
// =====================================================================

const TIMING_INTERVAL_MS = 500;  // 2Hz

export function shouldEmitTiming(sessionId: string): boolean {
    const entry = sessions.get(sessionId);
    if (!entry) return false;

    const now = Date.now();
    return now - entry.lastTimingEmitMs >= TIMING_INTERVAL_MS;
}

export function markTimingEmitted(sessionId: string): void {
    const entry = sessions.get(sessionId);
    if (entry) {
        entry.lastTimingEmitMs = Date.now();
    }
}

// =====================================================================
// Cleanup
// =====================================================================

export function removeSession(sessionId: string): void {
    sessions.delete(sessionId);
}

export function getAllSessions(): SessionRegistryEntry[] {
    return Array.from(sessions.values());
}

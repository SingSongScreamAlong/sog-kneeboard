// =====================================================================
// Timing Generator (Week 3)
// Generates and emits telemetry:timing at 2Hz per session.
// =====================================================================

import type { Namespace } from 'socket.io';
import type { SessionTiming, TimingEntry } from '@controlbox/common';
import {
    getAllSessionIds,
    getSession,
    shouldEmitTiming,
    markTimingEmitted,
    generateTimingSnapshot,
    type TimingSnapshot,
} from '../sessions/session.registry.js';
// Week 6: Persistence
import { persistTimingSnapshot } from '../../persistence/persistence.manager.js';

// =====================================================================
// Timing Loop
// =====================================================================

let timingIntervalId: NodeJS.Timeout | null = null;
let activeNamespace: Namespace | null = null;

const TIMING_LOOP_INTERVAL_MS = 100;  // Check more frequently than 2Hz for precision

export function startTimingGenerator(nsp: Namespace): void {
    if (timingIntervalId) {
        console.warn('⚠️  Timing generator already running');
        return;
    }

    activeNamespace = nsp;

    timingIntervalId = setInterval(() => {
        const sessionIds = getAllSessionIds();
        for (const sessionId of sessionIds) {
            if (shouldEmitTiming(sessionId)) {
                emitTimingForSession(sessionId);
            }
        }
    }, TIMING_LOOP_INTERVAL_MS);

    console.log('⏱️  Timing generator started (2Hz per session)');
}

export function stopTimingGenerator(): void {
    if (timingIntervalId) {
        clearInterval(timingIntervalId);
        timingIntervalId = null;
        activeNamespace = null;
        console.log('⏱️  Timing generator stopped');
    }
}

// =====================================================================
// Emit Timing
// =====================================================================

function emitTimingForSession(sessionId: string): void {
    if (!activeNamespace) return;

    const session = getSession(sessionId);
    if (!session) return;

    const snapshot = generateTimingSnapshot(sessionId, Date.now());
    if (!snapshot || snapshot.entries.length === 0) return;

    // Convert to canonical SessionTiming format
    const timing = snapshotToSessionTiming(snapshot, session.sessionType);

    // Emit to session room
    const roomName = `session:${sessionId}`;
    activeNamespace.to(roomName).emit('telemetry:timing', timing);

    // Week 6: Persist timing snapshot (non-blocking)
    persistTimingSnapshot(snapshot);

    markTimingEmitted(sessionId);
}

function snapshotToSessionTiming(snapshot: TimingSnapshot, sessionType: string): SessionTiming {
    const entries: TimingEntry[] = snapshot.entries.map((e, index) => ({
        driverId: e.driverId,
        driverName: e.driverName,
        carNumber: '',
        carName: '',
        position: e.position || index + 1,
        classPosition: e.position || index + 1,
        positionsGained: 0,
        currentLap: e.lapNumber,
        lapsCompleted: e.lapNumber > 0 ? e.lapNumber - 1 : 0,
        lastLapTime: e.lastLapTime,
        bestLapTime: e.bestLapTime,
        gapToLeader: e.gapToLeader,
        gapAhead: e.gapAhead,
        gapBehind: 0,
        sectorTimes: [],
        bestSectors: [],
        inPit: e.inPit,
        onOutLap: false,
        pitStops: 0,
        incidentCount: 0,
        hasRecentIncident: false,
        isConnected: e.isConnected,
        lastUpdate: snapshot.timestamp,
    }));

    // Find fastest lap
    let fastestLap = { driverId: '', time: Infinity, lap: 0 };
    for (const e of entries) {
        if (e.bestLapTime > 0 && e.bestLapTime < fastestLap.time) {
            fastestLap = { driverId: e.driverId, time: e.bestLapTime, lap: e.lapsCompleted };
        }
    }
    if (fastestLap.time === Infinity) {
        fastestLap = { driverId: '', time: 0, lap: 0 };
    }

    return {
        sessionId: snapshot.sessionId,
        entries,
        sessionState: sessionType || 'racing',
        sessionTimeElapsed: snapshot.sessionTimeMs / 1000,
        sessionTimeRemaining: -1,
        lapsRemaining: -1,
        leaderId: entries[0]?.driverId ?? '',
        fastestLap,
        timestamp: snapshot.timestamp,
    };
}

// =====================================================================
// Manual Emit (for testing)
// =====================================================================

export function emitTimingNow(sessionId: string): SessionTiming | null {
    const session = getSession(sessionId);
    if (!session) return null;

    const snapshot = generateTimingSnapshot(sessionId, Date.now());
    if (!snapshot) return null;

    return snapshotToSessionTiming(snapshot, session.sessionType);
}

// =====================================================================
// Relay Emission (Week 3)
// Bridges relay handlers with subscription emission gate for canonical frames.
// =====================================================================

import type { Namespace } from 'socket.io';
import type { ThinCanonicalFrame, FatCanonicalFrame } from '../translation/relay-to-canonical.js';
import {
    emitTelemetryToSubscribers,
    type ThinTelemetryFrame,
    type FatTelemetryFrame,
} from '../subscriptions/emission.gate.js';

/**
 * Emit canonical telemetry frames via the subscription gate.
 * Converts from translation types to emission gate types.
 */
export function emitCanonicalTelemetry(
    nsp: Namespace,
    sessionId: string,
    thinFrame: ThinCanonicalFrame,
    fatFrame: FatCanonicalFrame
): number {
    // Convert to emission gate format
    const thinEmit: ThinTelemetryFrame = {
        driverId: thinFrame.driver.driverId,
        sessionId: thinFrame.sessionId,
        position: thinFrame.driver.trackPosition,
        lapDistPct: thinFrame.driver.lapDistPct,
        speed: thinFrame.driver.speed,
        gear: thinFrame.driver.gear,
        lap: thinFrame.driver.lapNumber,
        lastLapTime: thinFrame.driver.lastLapTime,
        gapToLeader: thinFrame.driver.deltaToLeader,
        gapAhead: thinFrame.driver.deltaToCarAhead,
        inPit: thinFrame.driver.inPits,
        incidentCount: thinFrame.driver.incidentCount,
        sessionTimeMs: thinFrame.sessionTimeMs,
        timestamp: thinFrame.timestamp,
    };

    const fatEmit: FatTelemetryFrame = {
        ...thinEmit,
        rpm: fatFrame.driver.rpm,
        throttle: fatFrame.driver.throttle,
        brake: fatFrame.driver.brake,
        clutch: fatFrame.driver.clutch,
        steeringAngle: fatFrame.driver.steering,
        fuelLevel: fatFrame.driver.fuelLevel,
        fuelUsePerHour: fatFrame.driver.fuelUsePerHour,
        tireTemps: flattenTireTemps(fatFrame.driver.tireTemps),
        tirePressures: [
            fatFrame.driver.tirePressures.lf,
            fatFrame.driver.tirePressures.rf,
            fatFrame.driver.tirePressures.lr,
            fatFrame.driver.tirePressures.rr,
        ],
        tireWear: flattenTireWear(fatFrame.driver.tireWear),
        worldPosition: fatFrame.driver.worldPosition,
        velocity: fatFrame.driver.velocity,
        rotation: fatFrame.driver.rotation,
        gForce: null,  // Not available from translation
        lapDelta: fatFrame.driver.lapDelta,
        trackTemp: fatFrame.driver.trackTemp,
        airTemp: fatFrame.driver.airTemp,
    };

    return emitTelemetryToSubscribers(nsp, sessionId, thinEmit, fatEmit);
}

function flattenTireTemps(temps: FatCanonicalFrame['driver']['tireTemps']): number[] {
    return [
        temps.lf.l, temps.lf.m, temps.lf.r,
        temps.rf.l, temps.rf.m, temps.rf.r,
        temps.lr.l, temps.lr.m, temps.lr.r,
        temps.rr.l, temps.rr.m, temps.rr.r,
    ];
}

function flattenTireWear(wear: FatCanonicalFrame['driver']['tireWear']): number[] {
    return [
        wear.lf.l, wear.lf.m, wear.lf.r,
        wear.rf.l, wear.rf.m, wear.rf.r,
        wear.lr.l, wear.lr.m, wear.lr.r,
        wear.rr.l, wear.rr.m, wear.rr.r,
    ];
}

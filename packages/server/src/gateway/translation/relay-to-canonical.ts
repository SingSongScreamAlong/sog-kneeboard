// =====================================================================
// Relay to Canonical Translation (Week 3)
// Converts BlackBox relay telemetry to @controlbox/common canonical types.
// =====================================================================

import type { RelayTelemetry, RelayTelemetryData, RelaySessionData } from '../relay/relay.types.js';

// =====================================================================
// Unit Normalization Constants
// =====================================================================

/**
 * UNIT NORMALIZATION ASSUMPTIONS:
 * 
 * Relay (iRacing SDK):
 * - Speed: iRacing native unit (m/s)
 * - Throttle/Brake/Clutch: 0.0-1.0
 * - SteeringWheelAngle: radians
 * - SessionTime: seconds (float)
 * - LapCurrentLapTime: seconds
 * - Temperatures: Celsius
 * - FuelLevel: liters (for most cars)
 * - LapDist: meters
 * - LapDistPct: 0.0-1.0 (but relay may send raw, needs verification)
 * 
 * Canonical (@controlbox/common):
 * - speed: m/s
 * - throttle/brake: 0.0-1.0
 * - steering: radians
 * - sessionTimeMs: milliseconds (integer)
 * - lastLapTime: seconds
 * - trackTemp/airTemp: Celsius
 * - lapDistPct: 0.0-1.0
 */

// =====================================================================
// Driver ID Extraction Strategy
// =====================================================================

interface DriverIdContext {
    sessionDriverId?: number;   // From session_info.data.DriverID
    sessionDriverName?: string; // From session_info.data.DriverName
    playerCarIdx?: number;      // Usually 0 for player
}

let driverIdContext: DriverIdContext = {};

export function setDriverIdContext(sessionData: RelaySessionData): void {
    driverIdContext = {
        sessionDriverId: sessionData.DriverID,
        sessionDriverName: sessionData.DriverName,
        playerCarIdx: 0,  // iRacing player is always index 0 in personal telemetry
    };
}

export function extractDriverId(_data?: RelayTelemetryData): string {
    // Strategy:
    // 1. Prefer DriverID from session_info if set
    // 2. Else use playerCarIdx (default 0)
    // 3. Else generate fallback with warning

    if (driverIdContext.sessionDriverId !== undefined) {
        return String(driverIdContext.sessionDriverId);
    }

    // Fallback to player index 0
    if (driverIdContext.playerCarIdx !== undefined) {
        return `player_${driverIdContext.playerCarIdx}`;
    }

    // Last resort - generate unique but log warning
    console.warn('⚠️  No driver ID available, using fallback identifier');
    return `unknown_${Date.now()}`;
}

export function extractDriverName(): string {
    return driverIdContext.sessionDriverName ?? 'Unknown Driver';
}

// =====================================================================
// Thin Frame Translation
// =====================================================================

export interface ThinCanonicalFrame {
    sessionId: string;
    sessionTimeMs: number;
    timestamp: number;
    driver: ThinDriverTelemetry;
}

export interface ThinDriverTelemetry {
    driverId: string;
    driverName: string;
    carIdx: number;
    carNumber: string;

    // Position
    lapNumber: number;
    lapDistPct: number;
    trackPosition: number;
    classPosition: number;

    // Motion (subset)
    speed: number;
    gear: number;

    // Timing
    lastLapTime: number;
    bestLapTime: number;
    currentLapTime: number;
    deltaToLeader: number;
    deltaToCarAhead: number;

    // Status
    inPits: boolean;
    incidentCount: number;
    isConnected: boolean;
}

export function translateToThinFrame(
    sessionId: string,
    relay: RelayTelemetry
): ThinCanonicalFrame {
    const data = relay.data;
    const sessionTimeMs = normalizeSessionTimeMs(data.SessionTime);

    return {
        sessionId,
        sessionTimeMs,
        timestamp: Date.now(),
        driver: {
            driverId: extractDriverId(data),
            driverName: extractDriverName(),
            carIdx: 0,  // Player is always 0 in personal telemetry
            carNumber: '',  // Not available in relay telemetry

            // Position
            lapNumber: safeNumber(data.Lap, 0),
            lapDistPct: normalizeLapDistPct(data.LapDist),
            trackPosition: safeNumber(data.PlayerCarPosition, 0),
            classPosition: safeNumber(data.PlayerCarPosition, 0),  // Class same as overall for now

            // Motion
            speed: normalizeSpeed(data.Speed),
            gear: safeNumber(data.Gear, 0),

            // Timing
            lastLapTime: safeNumber(data.LapLastLapTime, 0),
            bestLapTime: safeNumber(data.LapBestLapTime, 0),
            currentLapTime: safeNumber(data.LapCurrentLapTime, 0),
            deltaToLeader: 0,  // Not available in personal telemetry
            deltaToCarAhead: 0,

            // Status
            inPits: false,  // Would need pit detection
            incidentCount: 0,
            isConnected: true,
        },
    };
}

// =====================================================================
// Fat Frame Translation (includes inputs, tires, fuel, world position)
// =====================================================================

export interface FatCanonicalFrame extends ThinCanonicalFrame {
    driver: FatDriverTelemetry;
}

export interface FatDriverTelemetry extends ThinDriverTelemetry {
    // Inputs
    throttle: number;
    brake: number;
    clutch: number;
    steering: number;
    rpm: number;

    // Fuel
    fuelLevel: number;
    fuelUsePerHour: number;

    // Tires
    tireTemps: TireTemps;
    tirePressures: TirePressures;
    tireWear: TireWear;

    // World position (if available)
    worldPosition: { x: number; y: number; z: number } | null;
    velocity: { x: number; y: number; z: number } | null;
    rotation: { yaw: number; pitch: number; roll: number } | null;

    // Track conditions
    trackTemp: number;
    airTemp: number;
    lapDelta: number;
}

interface TireTemps {
    lf: { l: number; m: number; r: number };
    rf: { l: number; m: number; r: number };
    lr: { l: number; m: number; r: number };
    rr: { l: number; m: number; r: number };
}

interface TirePressures {
    lf: number;
    rf: number;
    lr: number;
    rr: number;
}

interface TireWear {
    lf: { l: number; m: number; r: number };
    rf: { l: number; m: number; r: number };
    lr: { l: number; m: number; r: number };
    rr: { l: number; m: number; r: number };
}

export function translateToFatFrame(
    sessionId: string,
    relay: RelayTelemetry
): FatCanonicalFrame {
    const thin = translateToThinFrame(sessionId, relay);
    const data = relay.data;

    const fatDriver: FatDriverTelemetry = {
        ...thin.driver,

        // Inputs
        throttle: safeNumber(data.Throttle, 0),
        brake: safeNumber(data.Brake, 0),
        clutch: safeNumber(data.Clutch, 0),
        steering: safeNumber(data.SteeringWheelAngle, 0),
        rpm: safeNumber(data.RPM, 0),

        // Fuel
        fuelLevel: safeNumber(data.FuelLevel, 0),
        fuelUsePerHour: safeNumber(data.FuelUsePerHour, 0),

        // Tires
        tireTemps: extractTireTemps(data),
        tirePressures: extractTirePressures(data),
        tireWear: extractTireWear(data),

        // World position (not available in current relay)
        worldPosition: null,
        velocity: null,
        rotation: null,

        // Track conditions
        trackTemp: safeNumber(data.TrackTemp, 20),
        airTemp: safeNumber(data.AirTemp, 20),
        lapDelta: safeNumber(data.LapDeltaToBestLap, 0),
    };

    return {
        ...thin,
        driver: fatDriver,
    };
}

// =====================================================================
// Helper Functions
// =====================================================================

function safeNumber(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return fallback;
}

function normalizeSessionTimeMs(sessionTimeSec: unknown): number {
    const sec = safeNumber(sessionTimeSec, 0);
    return Math.round(sec * 1000);
}

function normalizeSpeed(speedMps: unknown): number {
    // iRacing reports speed in m/s, canonical uses m/s
    return safeNumber(speedMps, 0);
}

function normalizeLapDistPct(lapDist: unknown): number {
    // iRacing LapDist is in meters, not percentage
    // LapDistPct would be 0-1 but relay may send LapDist (meters)
    // For now, assume if > 1 it's meters and we need track length to normalize
    const dist = safeNumber(lapDist, 0);
    if (dist > 1) {
        // Likely meters - would need track length to normalize
        // Return as-is for now, timing generator will handle
        return dist;
    }
    return dist;
}

function extractTireTemps(data: RelayTelemetryData): TireTemps {
    return {
        lf: {
            l: safeNumber(data.LFtempCL, 0),
            m: safeNumber(data.LFtempCM, 0),
            r: safeNumber(data.LFtempCR, 0),
        },
        rf: {
            l: safeNumber(data.RFtempCL, 0),
            m: safeNumber(data.RFtempCM, 0),
            r: safeNumber(data.RFtempCR, 0),
        },
        lr: {
            l: safeNumber(data.LRtempCL, 0),
            m: safeNumber(data.LRtempCM, 0),
            r: safeNumber(data.LRtempCR, 0),
        },
        rr: {
            l: safeNumber(data.RRtempCL, 0),
            m: safeNumber(data.RRtempCM, 0),
            r: safeNumber(data.RRtempCR, 0),
        },
    };
}

function extractTirePressures(data: RelayTelemetryData): TirePressures {
    return {
        lf: safeNumber(data.LFpressure, 0),
        rf: safeNumber(data.RFpressure, 0),
        lr: safeNumber(data.LRpressure, 0),
        rr: safeNumber(data.RRpressure, 0),
    };
}

function extractTireWear(data: RelayTelemetryData): TireWear {
    return {
        lf: {
            l: safeNumber(data.LFwearL, 1),
            m: safeNumber(data.LFwearM, 1),
            r: safeNumber(data.LFwearR, 1),
        },
        rf: {
            l: safeNumber(data.RFwearL, 1),
            m: safeNumber(data.RFwearM, 1),
            r: safeNumber(data.RFwearR, 1),
        },
        lr: {
            l: safeNumber(data.LRwearL, 1),
            m: safeNumber(data.LRwearM, 1),
            r: safeNumber(data.LRwearR, 1),
        },
        rr: {
            l: safeNumber(data.RRwearL, 1),
            m: safeNumber(data.RRwearM, 1),
            r: safeNumber(data.RRwearR, 1),
        },
    };
}

// =====================================================================
// Driver Types
// Types for driver tiles and telemetry
// =====================================================================

/**
 * Tire compound types
 */
export type TireCompound = 'soft' | 'medium' | 'hard' | 'inter' | 'wet' | 'unknown';

/**
 * Pit status for driver
 */
export type PitStatus = 'on_track' | 'pit_entry' | 'in_pit' | 'pit_exit';

/**
 * Driver tile data displayed in driver stack
 */
export interface Driver {
    id: string;
    name: string;
    carNumber: string;
    position: number;
    gapAhead: number | null;   // seconds, null if leading
    gapBehind: number | null;  // seconds, null if last
    gapToLeader: number;       // seconds
    tireCompound: TireCompound;
    tireLaps: number;          // laps on current tires
    pitStatus: PitStatus;
    pitCount: number;
    isInBattle: boolean;       // within 1s of another car
    lastLapTime: number | null; // milliseconds
    bestLapTime: number | null; // milliseconds
    irating?: number;
    teamName?: string;
}

/**
 * Driver telemetry packet (from relay)
 */
export interface DriverTelemetry {
    driverId: string;
    lapDistPct: number;      // 0-1 track position
    speed: number;           // m/s
    throttle: number;        // 0-1
    brake: number;           // 0-1
    gear: number;
    rpm: number;
    steeringAngle: number;   // radians
    timestamp: number;       // epoch ms
}

/**
 * Battle detection between drivers
 */
export interface Battle {
    driverA: Driver;
    driverB: Driver;
    gap: number;            // seconds
    positionFought: number; // position being contested
    duration: number;       // how long they've been close (ms)
    intensity: 'low' | 'medium' | 'high';
}

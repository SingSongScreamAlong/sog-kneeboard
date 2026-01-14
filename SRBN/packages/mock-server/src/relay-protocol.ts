// =====================================================================
// Relay Protocol Types
// Message formats from the Relay Agent (adapted from ControlBox protocol)
// =====================================================================

/**
 * Base interface for all relay messages
 */
export interface RelayMessage {
    type: string;
    sessionId: string;
    timestamp: number;
}

/**
 * Session metadata sent at session start
 */
export interface SessionMetadataMessage extends RelayMessage {
    type: 'session_metadata';
    trackName: string;
    trackConfig?: string;
    category: 'road' | 'oval' | 'dirt_road' | 'dirt_oval' | 'sports_car' | 'formula' | 'rallycross' | 'unknown';
    multiClass: boolean;
    cautionsEnabled: boolean;
    driverSwap: boolean;
    maxDrivers: number;
    weather: {
        ambientTemp: number;
        trackTemp: number;
        precipitation: number;
        trackState: 'dry' | 'damp' | 'wet';
    };
}

/**
 * Race state/flag change event
 */
export interface RaceEventMessage extends RelayMessage {
    type: 'race_event';
    flagState: 'green' | 'yellow' | 'localYellow' | 'caution' | 'red' | 'restart' | 'checkered' | 'white';
    lap: number;
    timeRemaining: number;
    sessionPhase: 'pre_race' | 'formation' | 'racing' | 'caution' | 'restart' | 'finished';
}

/**
 * Telemetry snapshot from relay
 */
export interface TelemetrySnapshotMessage extends RelayMessage {
    type: 'telemetry';
    cars: CarTelemetry[];
}

export interface CarTelemetry {
    carId: number;
    driverId?: string;
    driverName?: string;
    carNumber?: string;
    speed: number;
    gear: number;
    pos: { s: number }; // Track position 0-1
    throttle: number;
    brake: number;
    steering: number;
    rpm?: number;
    inPit: boolean;
    lap: number;
    classPosition?: number;
    position?: number;
}

/**
 * Incident detected
 */
export interface IncidentMessage extends RelayMessage {
    type: 'incident';
    cars: number[];
    carNames?: string[];
    driverNames?: string[];
    lap: number;
    corner: number;
    cornerName?: string;
    trackPosition: number;
    severity: 'low' | 'med' | 'high';
}

/**
 * Driver join/leave notification
 */
export interface DriverUpdateMessage extends RelayMessage {
    type: 'driver_update';
    action: 'join' | 'leave' | 'swap';
    driverId: string;
    driverName: string;
    carNumber: string;
    carName: string;
    teamName?: string;
    irating?: number;
    safetyRating?: number;
}

// Type guard functions
export function isSessionMetadata(msg: RelayMessage): msg is SessionMetadataMessage {
    return msg.type === 'session_metadata';
}

export function isRaceEvent(msg: RelayMessage): msg is RaceEventMessage {
    return msg.type === 'race_event';
}

export function isTelemetry(msg: RelayMessage): msg is TelemetrySnapshotMessage {
    return msg.type === 'telemetry';
}

export function isIncident(msg: RelayMessage): msg is IncidentMessage {
    return msg.type === 'incident';
}

export function isDriverUpdate(msg: RelayMessage): msg is DriverUpdateMessage {
    return msg.type === 'driver_update';
}

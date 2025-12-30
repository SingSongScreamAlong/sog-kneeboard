// =====================================================================
// Relay Gateway Types (Week 1 - Compatibility Mode)
// These types mirror the BlackBox relay agent message formats exactly.
// DO NOT rename or restructure until Week 5+.
// =====================================================================

/**
 * Relay session_info message from BlackBox relay agent
 * Evidence: empty-apogee/relay_agent/telemetry_collector.py#L543-L551
 */
export interface RelaySessionInfo {
    type: 'session_info';
    session_id: string;
    timestamp: number;
    data: RelaySessionData;
    api_key: string;
    user_id?: string;
    team_id?: string;
}

export interface RelaySessionData {
    SessionType?: string;
    SessionLaps?: number;
    SessionTime?: number;
    TrackName?: string;
    TrackLength?: number;
    TrackID?: number;
    DriverName?: string;
    DriverID?: number;
    TeamName?: string;
    CarName?: string;
    CarID?: number;
}

/**
 * Relay telemetry message from BlackBox relay agent
 * Evidence: empty-apogee/relay_agent/telemetry_collector.py#L580-L586
 */
export interface RelayTelemetry {
    type: 'telemetry';
    session_id: string;
    timestamp: number;
    data: RelayTelemetryData;
    events: RelayEventType[];
}

export type RelayEventType = 'lap_completed' | 'pit_entry' | 'pit_exit' | 'sector_change';

/**
 * Relay telemetry data payload
 * Evidence: empty-apogee/relay_agent/telemetry_collector.py#L148-L170
 */
export interface RelayTelemetryData {
    // Core telemetry
    Speed?: number;
    RPM?: number;
    Gear?: number;
    Throttle?: number;
    Brake?: number;
    Clutch?: number;
    SteeringWheelAngle?: number;
    FuelLevel?: number;
    FuelUsePerHour?: number;
    LapCurrentLapTime?: number;
    LapDist?: number;
    TrackTemp?: number;
    AirTemp?: number;
    SessionTime?: number;
    SessionLapsRemaining?: number;
    SessionTimeRemaining?: number;

    // Position and timing
    PlayerCarPosition?: number;
    Lap?: number;
    LapLastLapTime?: number;
    LapBestLapTime?: number;
    LapLastLapNum?: number;
    LapBestLapNum?: number;
    LapDeltaToBestLap?: number;
    LapDeltaToBestLap_DD?: number;
    CarIdxLapDistPct?: number[];

    // Tire temps (Left Front)
    LFtempCL?: number;
    LFtempCM?: number;
    LFtempCR?: number;
    // Tire temps (Right Front)
    RFtempCL?: number;
    RFtempCM?: number;
    RFtempCR?: number;
    // Tire temps (Left Rear)
    LRtempCL?: number;
    LRtempCM?: number;
    LRtempCR?: number;
    // Tire temps (Right Rear)
    RRtempCL?: number;
    RRtempCM?: number;
    RRtempCR?: number;

    // Tire pressures
    LFpressure?: number;
    RFpressure?: number;
    LRpressure?: number;
    RRpressure?: number;

    // Tire wear
    LFwearL?: number;
    LFwearM?: number;
    LFwearR?: number;
    RFwearL?: number;
    RFwearM?: number;
    RFwearR?: number;
    LRwearL?: number;
    LRwearM?: number;
    LRwearR?: number;
    RRwearL?: number;
    RRwearM?: number;
    RRwearR?: number;

    // Metadata added by collector
    Timestamp?: number;
    SessionId?: string;
    SessionType?: string;

    // Allow additional fields
    [key: string]: unknown;
}

/**
 * Compact payload emitted to dashboard observers
 */
export interface RelayTelemetryRaw {
    sessionId: string;
    receivedAtMs: number;
    relayTimestamp: number;
    sessionTimeMs: number | null;
    orderingKnown: boolean;
    speed: number | null;
    rpm: number | null;
    gear: number | null;
    lap: number | null;
    lapDist: number | null;
    position: number | null;
    eventsCount: number;
    events: RelayEventType[];
}

/**
 * Session registry entry (in-memory)
 */
export interface RelaySession {
    sessionId: string;
    createdAt: number;
    lastUpdatedAt: number;
    relaySocketId: string;
    apiKey: string;
    userId?: string;
    teamId?: string;
    sessionData: RelaySessionData;
}

/**
 * Per-session metrics
 */
export interface RelaySessionMetrics {
    sessionId: string;
    framesReceivedTotal: number;
    frameTimestamps: number[]; // Ring buffer for FPS calculation
    lastRelayTimestamp: number | null;
    lastSessionTimeMs: number | null;
    lastReceivedAtMs: number | null;
    connectedRelaySockets: number;
}

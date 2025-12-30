// =====================================================================
// Telemetry Timeline Types
// Types for the timeline scrubber and telemetry visualization
// =====================================================================

// Timeline marker for significant events
export interface TimelineMarker {
    id: string;
    sessionId: string;
    timestamp: number;          // Session time in ms
    lapNumber: number;
    type: TimelineMarkerType;
    label: string;
    description?: string;
    severity?: 'info' | 'warning' | 'critical';
    relatedIncidentId?: string;
    relatedDriverIds?: string[];
    metadata?: Record<string, unknown>;
}

export type TimelineMarkerType =
    | 'incident'
    | 'contact'
    | 'off_track'
    | 'flag_change'
    | 'caution_start'
    | 'caution_end'
    | 'pit_entry'
    | 'pit_exit'
    | 'position_change'
    | 'fastest_lap'
    | 'stage_end'
    | 'custom';

// Telemetry data point for a single frame (timeline-specific)
export interface TimelineTelemetryFrame {
    timestamp: number;
    lapNumber: number;
    lapDistance: number;        // % around track (0-100)

    // Vehicle dynamics
    speed: number;              // km/h
    rpm: number;
    gear: number;
    throttle: number;           // 0-100
    brake: number;              // 0-100
    steering: number;           // -100 to 100
    clutch: number;             // 0-100

    // Position
    positionX: number;
    positionY: number;
    positionZ: number;

    // G-forces
    lateralG: number;
    longitudinalG: number;
    verticalG: number;

    // Status
    isOnTrack: boolean;
    isInPit: boolean;
    isPitting: boolean;

    // Tire data (optional)
    tireWear?: number[];        // [FL, FR, RL, RR]
    tireTemp?: number[];        // [FL, FR, RL, RR]

    // Fuel (optional)
    fuelLevel?: number;
    fuelUsage?: number;
}

// Driver telemetry for a segment (timeline-specific)
export interface TimelineDriverTelemetry {
    driverId: string;
    driverName: string;
    carNumber: string;
    frames: TimelineTelemetryFrame[];

    // Aggregated stats for the segment
    maxSpeed: number;
    avgSpeed: number;
    maxThrottle: number;
    maxBrake: number;
    maxLateralG: number;
    maxLongitudinalG: number;
}

// Comparison data for side-by-side view
export interface TimelineDriverComparison {
    driver1: TimelineDriverTelemetry;
    driver2: TimelineDriverTelemetry;

    // Computed deltas
    speedDelta: number[];       // Speed difference at each frame
    lineDeviation: number[];    // Distance between positions

    // Timestamps where they overlap
    overlapStart: number;
    overlapEnd: number;
}

// Impact analysis data
export interface ImpactAnalysis {
    incidentId: string;
    timestamp: number;

    // Impact forces
    estimatedForce: number;     // Estimated impact force (kN)
    peakG: number;              // Peak G-force during impact
    impactDuration: number;     // Duration of impact in ms

    // Involved drivers
    drivers: {
        driverId: string;
        driverName: string;
        impactAngle: number;    // Angle of impact
        speedAtImpact: number;
        gForce: number;
        wasAtFault?: boolean;
    }[];

    // Contact analysis
    contactType: 'front' | 'rear' | 'side' | 'corner';
    impactLocation: { x: number; y: number };
}

// Corner analysis
export interface CornerAnalysis {
    cornerNumber: number;
    cornerName?: string;

    // Entry point
    entrySpeed: number;
    entryLine: { x: number; y: number };
    brakePoint: number;         // Lap distance %

    // Apex
    apexSpeed: number;
    apexLine: { x: number; y: number };

    // Exit
    exitSpeed: number;
    exitLine: { x: number; y: number };
    throttlePoint: number;      // Lap distance %

    // Comparison (if comparing)
    deltaToReference?: number;
}

// Racing line data
export interface RacingLine {
    driverId: string;
    lapNumber: number;
    points: { x: number; y: number; speed: number }[];

    // Optimal line comparison
    deviationFromOptimal?: number[];
    timeGain?: number;
    timeLoss?: number;
}

// Timeline view configuration
export interface TimelineViewConfig {
    startTime: number;
    endTime: number;
    currentTime: number;
    zoomLevel: number;          // 1 = full session, higher = more zoom
    showMarkers: TimelineMarkerType[];
    selectedDrivers: string[];
    showTelemetry: boolean;
    overlayChannels: TelemetryChannel[];
}

export type TelemetryChannel =
    | 'speed'
    | 'throttle'
    | 'brake'
    | 'steering'
    | 'gear'
    | 'rpm'
    | 'lateralG'
    | 'longitudinalG';

// Workspace layout types
export interface WorkspaceLayout {
    id: string;
    name: string;
    description?: string;
    isDefault?: boolean;
    panels: WorkspacePanel[];
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkspacePanel {
    id: string;
    type: PanelType;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isMinimized?: boolean;
    isLocked?: boolean;
    config?: Record<string, unknown>;
}

export type PanelType =
    | 'live_timing'
    | 'race_control'
    | 'incidents'
    | 'penalties'
    | 'messaging'
    | 'flag_history'
    | 'telemetry_timeline'
    | 'driver_comparison'
    | 'track_map'
    | 'standings'
    | 'session_info'
    | 'driver_cameras';

// Stage racing types
export interface StageConfiguration {
    id: string;
    sessionId: string;
    stages: Stage[];
    playoffPointsEnabled: boolean;
    created: Date;
}

export interface Stage {
    stageNumber: number;
    name: string;
    endLap: number;
    points: number[];           // Points for positions 1-10
    playoffPoints: number[];    // Playoff points for top positions
    isComplete: boolean;
    winnerId?: string;
    winnerName?: string;
}

export interface StageResult {
    stageNumber: number;
    results: {
        position: number;
        driverId: string;
        driverName: string;
        points: number;
        playoffPoints: number;
    }[];
}

// Default stage points configurations
export const NASCAR_STAGE_POINTS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
export const NASCAR_PLAYOFF_POINTS = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Only winner gets playoff point

export const DEFAULT_STAGE_CONFIG: Omit<StageConfiguration, 'id' | 'sessionId' | 'created'> = {
    stages: [
        { stageNumber: 1, name: 'Stage 1', endLap: 80, points: NASCAR_STAGE_POINTS, playoffPoints: NASCAR_PLAYOFF_POINTS, isComplete: false },
        { stageNumber: 2, name: 'Stage 2', endLap: 160, points: NASCAR_STAGE_POINTS, playoffPoints: NASCAR_PLAYOFF_POINTS, isComplete: false },
        { stageNumber: 3, name: 'Final Stage', endLap: 267, points: [], playoffPoints: [], isComplete: false },
    ],
    playoffPointsEnabled: true,
};

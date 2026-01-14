// =====================================================================
// Event Types
// Types for event queue and telemetry events
// =====================================================================

/**
 * Event type categories
 */
export type EventType =
    | 'pit_window_open'
    | 'pit_window_close'
    | 'tire_cliff'
    | 'fuel_marginal'
    | 'battle_forming'
    | 'battle_intensifying'
    | 'incident'
    | 'safety_car'
    | 'restart_imminent'
    | 'final_laps'
    | 'lead_change'
    | 'fastest_lap';

/**
 * Event priority for queue ordering
 */
export type EventPriority = 'info' | 'attention' | 'important' | 'critical';

/**
 * Event queue item
 */
export interface RaceEvent {
    id: string;
    type: EventType;
    priority: EventPriority;
    title: string;
    description?: string;
    driverIds?: string[];
    lapNumber?: number;
    timestamp: number;       // epoch ms
    expiresAt?: number;      // epoch ms, auto-dismiss
    acknowledged: boolean;
}

/**
 * Incident data for markers
 */
export interface Incident {
    id: string;
    type: 'spin' | 'contact' | 'off_track' | 'mechanical';
    driverIds: string[];
    lapNumber: number;
    trackPosition: number;   // 0-1 around track
    timestamp: number;
    severity: 'minor' | 'moderate' | 'major';
    underInvestigation: boolean;
}

/**
 * Track position for map display
 */
export interface TrackPosition {
    driverId: string;
    position: number;        // race position
    lapDistPct: number;      // 0-1 around track
    isInPit: boolean;
    isInBattle: boolean;
}

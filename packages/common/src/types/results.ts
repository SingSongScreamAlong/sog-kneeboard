// =====================================================================
// Results Type Definitions
// iRacing results file parsing and standings
// =====================================================================

/**
 * iRacing session results file structure (simplified)
 */
export interface IRacingResultsFile {
    session_id: number;
    subsession_id: number;
    session_name: string;
    start_time: string;
    end_time: string;
    track: {
        track_id: number;
        track_name: string;
        config_name: string;
    };
    series_name: string;
    session_results: IRacingSessionResult[];
}

export interface IRacingSessionResult {
    simsession_number: number;
    simsession_name: string;
    simsession_type: number; // 2=practice, 3=qualify, 4=warmup, 5=race
    simsession_subtype: number;
    results: IRacingDriverResult[];
}

export interface IRacingDriverResult {
    position: number;
    class_position: number;
    cust_id: number;
    display_name: string;
    car_number: string;
    car_id: number;
    car_name: string;
    car_class_id: number;
    car_class_name: string;
    team_id?: number;
    team_name?: string;
    laps_complete: number;
    laps_lead: number;
    incidents: number;
    finish_position: number;
    finish_position_in_class: number;
    interval: number; // microseconds
    gap: number; // microseconds to leader
    best_lap_time: number; // seconds
    best_lap_num: number;
    average_lap: number;
    oldi_rating: number;
    newi_rating: number;
    old_sub_level: number;
    new_sub_level: number;
    reason_out: string;
    reason_out_id: number;
    starting_position: number;
    starting_position_in_class: number;
}

// ========================
// Processed Results
// ========================

/**
 * Processed driver result with penalties applied
 */
export interface ProcessedDriverResult {
    position: number;
    originalPosition: number;
    classPosition: number;
    driverId: string;
    driverName: string;
    carNumber: string;
    carClass: string;
    teamName?: string;

    // Race stats
    lapsCompleted: number;
    lapsLed: number;
    gap: string; // Formatted gap
    bestLapTime: number;
    bestLapNumber: number;
    averageLapTime: number;

    // Points
    racePoints: number;
    stagePoints: number[];
    bonusPoints: number;
    penaltyPoints: number;
    totalPoints: number;

    // Penalties
    timePenalties: number; // seconds
    positionPenalties: number;
    appliedPenalties: AppliedPenalty[];

    // Incidents
    incidentCount: number;
    incidentPoints: number;

    // Rating changes
    iRatingBefore: number;
    iRatingAfter: number;
    iRatingChange: number;
    safetyRatingBefore: number;
    safetyRatingAfter: number;
    safetyRatingChange: number;

    // Status
    finishStatus: 'running' | 'retired' | 'disqualified' | 'not_classified';
    retirementReason?: string;
}

export interface AppliedPenalty {
    penaltyId: string;
    type: string;
    value: string;
    reason: string;
    appliedAt: Date;
}

// ========================
// Standings
// ========================

/**
 * Championship standings entry
 */
export interface StandingsEntry {
    position: number;
    previousPosition?: number;
    positionChange: number;
    driverId: string;
    driverName: string;
    teamName?: string;
    carClass?: string;

    // Points
    totalPoints: number;
    racePoints: number;
    stagePoints: number;
    bonusPoints: number;
    penaltyPoints: number;
    droppedPoints: number;

    // Stats
    races: number;
    wins: number;
    podiums: number;
    poles: number;
    lapsLed: number;
    dnfs: number;
    incidents: number;

    // Best results
    bestFinish: number;
    averageFinish: number;
    averageStart: number;
}

/**
 * Points configuration
 */
export interface PointsConfiguration {
    id: string;
    name: string;
    racePoints: number[];  // Points by position [1st, 2nd, 3rd, ...]
    poleBonus: number;
    lapLedBonus: number;
    mostLapsLedBonus: number;
    fastestLapBonus: number;
    stagePoints?: number[]; // Stage points by position

    // Options
    countDrops: number;    // Number of worst results to drop
    minRacesForDrops: number;
}

export const DEFAULT_POINTS_CONFIGURATION: PointsConfiguration = {
    id: 'nascar-cup',
    name: 'NASCAR Cup Style',
    racePoints: [40, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    poleBonus: 0,
    lapLedBonus: 0,
    mostLapsLedBonus: 1,
    fastestLapBonus: 0,
    stagePoints: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    countDrops: 0,
    minRacesForDrops: 0,
};

export const F1_POINTS_CONFIGURATION: PointsConfiguration = {
    id: 'f1-standard',
    name: 'F1 Standard',
    racePoints: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    poleBonus: 0,
    lapLedBonus: 0,
    mostLapsLedBonus: 0,
    fastestLapBonus: 1, // Only if in top 10
    countDrops: 0,
    minRacesForDrops: 0,
};

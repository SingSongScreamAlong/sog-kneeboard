// =====================================================================
// Driver & Team Management Type Definitions
// Roster management, classes, and team assignments
// =====================================================================

/**
 * Driver record
 */
export interface Driver {
    id: string;
    externalId?: string;      // iRacing customer ID

    // Identity
    name: string;
    shortName?: string;       // Abbreviated name for displays
    nationality?: string;     // Country code
    avatarUrl?: string;

    // Racing
    carNumber: string;
    carNumberDisplay?: string; // Formatted (e.g., "01" vs "1")
    carClass?: string;
    carName?: string;
    teamId?: string;

    // Stats
    iRating?: number;
    safetyRating?: number;
    licenseClass?: string;    // A, B, C, D, R

    // Status
    isActive: boolean;
    isRegistered: boolean;    // Registered for the event
    isCheckedIn: boolean;     // Checked in for the session

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Team record
 */
export interface Team {
    id: string;

    // Identity
    name: string;
    shortName?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;

    // Members
    driverIds: string[];
    managerIds?: string[];

    // Status
    isActive: boolean;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Car class definition
 */
export interface CarClass {
    id: string;
    name: string;
    shortName: string;        // e.g., "GT3", "LMP2"
    color: string;            // Display color
    priority: number;         // Class order in results
    cars: string[];           // Car names in this class
    isActive: boolean;
}

/**
 * Driver session participation
 */
export interface DriverParticipation {
    id: string;
    sessionId: string;
    driverId: string;

    // Grid
    gridPosition?: number;
    qualifyingTime?: number;
    qualifyingPosition?: number;

    // Result
    finishPosition?: number;
    classPosition?: number;
    lapsCompleted: number;
    totalTime?: number;
    bestLapTime?: number;
    bestLapNumber?: number;

    // Status
    status: 'racing' | 'pits' | 'retired' | 'disqualified' | 'disconnected';
    retirementReason?: string;

    // Incidents
    incidentCount: number;
    penaltyCount: number;
    warningCount: number;

    // Points
    racePoints?: number;
    stagePoints?: number[];
    bonusPoints?: number;
    penaltyPoints?: number;
    totalPoints?: number;

    // Metadata
    joinedAt: Date;
    leftAt?: Date;
}

/**
 * Driver history record
 */
export interface DriverHistory {
    driverId: string;
    totalSessions: number;
    totalWins: number;
    totalPodiums: number;
    totalPolPositions: number;
    totalIncidents: number;
    totalPenalties: number;
    totalWarnings: number;
    averageFinish: number;
    averageStart: number;
    bestFinish: number;
    totalPoints: number;
    lastSessionId?: string;
    lastSessionDate?: Date;
}

/**
 * Roster management for an event/session
 */
export interface EventRoster {
    sessionId: string;
    drivers: DriverParticipation[];
    teams: Team[];
    classes: CarClass[];
    maxGridSize: number;
    currentGridSize: number;
    updatedAt: Date;
}

/**
 * Grid sorting options
 */
export type GridSortOption =
    | 'qualifying'
    | 'points'
    | 'irating'
    | 'alphabetical'
    | 'car_number'
    | 'manual';

/**
 * Grid entry
 */
export interface GridEntry {
    position: number;
    driverId: string;
    driverName: string;
    carNumber: string;
    carClass?: string;
    teamName?: string;
    qualifyingTime?: number;
    iRating?: number;
}

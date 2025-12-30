// =====================================================================
// Race Control Type Definitions
// Flag system, session controls, and race management types
// =====================================================================

// ========================
// Flag System
// ========================

/**
 * Track-wide flag states for race control
 */
export type RaceControlFlag =
    | 'green'      // Racing conditions
    | 'yellow'     // Full course caution
    | 'red'        // Session stopped
    | 'white'      // Final lap
    | 'checkered'; // Session complete

/**
 * Driver-specific flags issued by race control
 */
export type RaceControlDriverFlag =
    | 'none'
    | 'black'      // Disqualification / come to pits
    | 'black_white' // Warning for unsportsmanlike conduct
    | 'blue'       // Faster car approaching
    | 'meatball'   // Mechanical issue, come to pits
    | 'penalty';   // Penalty pending

/**
 * Flag change event
 */
export interface FlagEvent {
    id: string;
    sessionId: string;
    type: 'global' | 'driver' | 'sector';
    flag: RaceControlFlag | RaceControlDriverFlag;
    previousFlag?: RaceControlFlag | RaceControlDriverFlag;
    targetDriverId?: string;
    targetDriverName?: string;
    sector?: number;
    reason?: string;
    issuedBy: string;
    issuedAt: Date;
    clearedAt?: Date;
    lapNumber: number;
    sessionTimeMs: number;
}

/**
 * Current flag state for the session
 */
export interface FlagState {
    global: RaceControlFlag;
    sectors: ('green' | 'yellow')[];
    driverFlags: Record<string, RaceControlDriverFlag>;
    activeFlags: FlagEvent[];
}

// ========================
// Session Control
// ========================

/**
 * Session control actions
 */
export type SessionControlAction =
    | 'start'
    | 'pause'
    | 'resume'
    | 'advance'      // Move to next session stage
    | 'end'
    | 'restart'      // Restart procedure
    | 'sort_grid';   // Sort field by position

/**
 * Session stage types
 */
export type SessionStage =
    | 'pre_race'
    | 'formation'
    | 'stage_1'
    | 'stage_2'
    | 'stage_3'
    | 'final_stage'
    | 'cooldown'
    | 'post_race';

/**
 * Restart types
 */
export type RestartType =
    | 'single_file'
    | 'double_file'
    | 'standing'
    | 'rolling';

/**
 * Session control command
 */
export interface SessionControlCommand {
    id: string;
    sessionId: string;
    action: SessionControlAction;
    targetStage?: SessionStage;
    restartType?: RestartType;
    sortBy?: 'position' | 'points' | 'qualifying' | 'manual';
    manualOrder?: string[]; // Driver IDs in order
    reason?: string;
    issuedBy: string;
    issuedAt: Date;
    executedAt?: Date;
    status: 'pending' | 'executed' | 'failed' | 'cancelled';
}

/**
 * Caution period
 */
export interface CautionPeriod {
    id: string;
    sessionId: string;
    type: 'local' | 'full_course';
    reason: string;
    relatedIncidentId?: string;
    startLap: number;
    startTimeMs: number;
    endLap?: number;
    endTimeMs?: number;
    restartType?: RestartType;
    isActive: boolean;
    createdAt: Date;
}

// ========================
// Race Control State
// ========================

/**
 * Complete race control state
 */
export interface RaceControlState {
    sessionId: string;
    flags: FlagState;
    currentStage: SessionStage;
    lapsCompleted: number;
    lapsRemaining: number;
    stageProgress?: {
        stage: number;
        lapsInStage: number;
        lapsRemainingInStage: number;
    };
    cautions: CautionPeriod[];
    activeCaution?: CautionPeriod;
    isPaused: boolean;
    isUnderCaution: boolean;
    restartPending: boolean;
    pendingRestart?: {
        type: RestartType;
        lap: number;
    };
}

// ========================
// Race Control Actions
// ========================

/**
 * Actions available to race control
 */
export interface RaceControlActions {
    // Flags
    deployGlobalFlag: (flag: RaceControlFlag, reason?: string) => void;
    deployDriverFlag: (driverId: string, flag: RaceControlDriverFlag, reason?: string) => void;
    clearDriverFlag: (driverId: string) => void;
    clearAllFlags: () => void;

    // Cautions
    deployCaution: (type: 'local' | 'full_course', reason: string, incidentId?: string) => void;
    endCaution: (restartType: RestartType) => void;

    // Session
    pauseSession: () => void;
    resumeSession: () => void;
    advanceStage: () => void;
    endSession: () => void;

    // Grid
    sortGrid: (by: 'position' | 'points' | 'qualifying' | 'manual', order?: string[]) => void;
    initiateRestart: (type: RestartType) => void;
}

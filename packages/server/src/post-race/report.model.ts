// =====================================================================
// Post-Race Intelligence Model (Week 16)
// Factual, non-judgmental race understanding.
// =====================================================================

// =====================================================================
// Core Types
// =====================================================================

export type ReviewRole = 'driver' | 'team' | 'race_control' | 'broadcast';

/**
 * Canonical post-race report.
 */
export interface PostRaceReport {
    id: string;
    sessionId: string;
    role: ReviewRole;
    generatedAt: number;

    // High-level
    summary: string;
    duration: { start: number; end: number };

    // Timeline
    timeline: TimelineEvent[];
    keyMoments: KeyMoment[];

    // Signals (separated)
    executionSignals: ExecutionSignal[];
    contextSignals: ContextSignal[];

    // Meta
    unansweredQuestions: string[];
    confidenceNotes: string[];

    // Trust markers
    disclaimers: string[];
}

// =====================================================================
// Timeline Event
// =====================================================================

export type TimelineEventType =
    | 'session_start'
    | 'session_end'
    | 'lap_complete'
    | 'position_change'
    | 'pit_entry'
    | 'pit_exit'
    | 'incident'
    | 'race_control_action'
    | 'battle_start'
    | 'battle_end'
    | 'strategy_shift'
    | 'weather_change'
    | 'safety_car'
    | 'restart';

export interface TimelineEvent {
    id: string;
    type: TimelineEventType;
    timestamp: number;
    lap?: number;

    // Description (factual, present tense at time of event)
    description: string;

    // Involved parties
    drivers?: string[];

    // Additional data
    metadata?: Record<string, unknown>;
}

// =====================================================================
// Key Moment
// =====================================================================

export type KeyMomentType =
    | 'incident'
    | 'prolonged_battle'
    | 'strategy_inflection'
    | 'race_control_action'
    | 'lead_change'
    | 'late_pressure'
    | 'overtake'
    | 'field_compression'
    | 'recovery';

export interface KeyMoment {
    id: string;
    type: KeyMomentType;

    // Temporal bounds
    startTime: number;
    endTime: number;
    startLap?: number;
    endLap?: number;

    // Involved drivers
    involvedDrivers: string[];

    // Factual description
    title: string;
    description: string;

    // What changed as a result
    whatChanged: string;

    // What information was available at this moment
    availableInformation: string[];

    // Confidence in classification
    confidence: number;

    // Related timeline events
    relatedEventIds: string[];
}

// =====================================================================
// Key Moment Qualification Rules
// =====================================================================

export const KEY_MOMENT_THRESHOLDS = {
    prolongedBattle: {
        maxGapSeconds: 1.5,
        minDurationSeconds: 30,
        description: 'Gap under 1.5s for 30+ seconds',
    },
    leadChange: {
        description: 'Position 1 changed hands',
    },
    latePressure: {
        raceProgressionMin: 0.75,  // Last 25% of race
        maxGapSeconds: 2.0,
        description: 'Pressure within 2s in final quarter',
    },
    incidentProximity: {
        maxDistanceMeters: 50,
        description: 'Within 50m of incident',
    },
    strategyInflection: {
        pitTimingDeltaSeconds: 5,
        description: 'Pit timing deviated from expected window',
    },
};

// =====================================================================
// Execution Signals
// =====================================================================

export type ExecutionSignalType =
    | 'car_state_trend'
    | 'input_consistency'
    | 'stability_change'
    | 'tire_degradation'
    | 'fuel_consumption'
    | 'brake_balance_shift'
    | 'traction_pattern';

export interface ExecutionSignal {
    id: string;
    type: ExecutionSignalType;

    // Temporal
    startTime: number;
    endTime: number;
    lapRange?: { from: number; to: number };

    // Observation (factual, non-judgmental)
    observation: string;

    // Trend direction
    trend: 'increasing' | 'decreasing' | 'stable' | 'variable';

    // Data reference
    metricName: string;
    values?: number[];
}

// =====================================================================
// Context Signals
// =====================================================================

export type ContextSignalType =
    | 'field_position'
    | 'gap_change'
    | 'battle_proximity'
    | 'incident_nearby'
    | 'strategy_window'
    | 'race_control'
    | 'weather_condition'
    | 'track_evolution';

export interface ContextSignal {
    id: string;
    type: ContextSignalType;

    // Temporal
    timestamp: number;
    lap?: number;

    // Situation description
    situation: string;

    // Scope
    scope: 'driver_local' | 'team_scope' | 'field_wide';

    // Related drivers
    relatedDrivers?: string[];
}

// =====================================================================
// Language Constraints
// =====================================================================

export const BANNED_REVIEW_PHRASES = [
    'you should have',
    'mistake',
    'optimal',
    'improve',
    'next time',
    'better if',
    'failed to',
    'missed opportunity',
    'could have',
    'should have',
    'error',
    'suboptimal',
    'wrong',
    'correct',
    'best practice',
    'lesson',
];

export const ALLOWED_PHRASE_PATTERNS = [
    'At this point in the race',
    'The situation changed when',
    'Available information included',
    'The outcome followed',
    'During this period',
    'At lap X',
    'The gap was',
    'Position changed from',
    'Data showed',
    'The field',
];

export const REVIEW_PRINCIPLE =
    'This system explains the race. Humans decide what to learn.';

// =====================================================================
// Trust Preservation
// =====================================================================

export const TRUST_SAFEGUARDS = {
    noNumericScores: true,
    noRankings: true,
    noComparativeGrading: true,
    noRetroactiveSeverity: true,
    noFaultAssignment: true,
    noOutcomeJudgment: true,
    noHindsightLanguage: true,
};

export const DEFAULT_DISCLAIMERS = [
    'This report describes what occurred. It does not assign fault or evaluate decisions.',
    'Information shown reflects what was available at each moment, not what was known afterward.',
    REVIEW_PRINCIPLE,
];

// =====================================================================
// Factory
// =====================================================================

let reportIdCounter = 0;

export function createPostRaceReport(
    sessionId: string,
    role: ReviewRole
): PostRaceReport {
    return {
        id: `report-${Date.now()}-${++reportIdCounter}`,
        sessionId,
        role,
        generatedAt: Date.now(),
        summary: '',
        duration: { start: 0, end: 0 },
        timeline: [],
        keyMoments: [],
        executionSignals: [],
        contextSignals: [],
        unansweredQuestions: [],
        confidenceNotes: [],
        disclaimers: [...DEFAULT_DISCLAIMERS],
    };
}

// =====================================================================
// Validation
// =====================================================================

/**
 * Check if text contains banned review language.
 */
export function containsBannedReviewLanguage(text: string): {
    hasBanned: boolean;
    found: string[];
} {
    const lower = text.toLowerCase();
    const found = BANNED_REVIEW_PHRASES.filter(phrase =>
        lower.includes(phrase.toLowerCase())
    );
    return { hasBanned: found.length > 0, found };
}

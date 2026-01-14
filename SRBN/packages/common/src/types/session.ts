// =====================================================================
// Session Types
// Core types for session state management
// =====================================================================

/**
 * Session states following race phases.
 * UI behavior changes based on these states.
 */
export type SessionState =
    | 'IDLE'        // No active race
    | 'PRACTICE'    // Practice session
    | 'QUALIFYING'  // Qualifying session
    | 'RACE_GREEN'  // Race under green
    | 'CAUTION'     // Yellow flag / safety car
    | 'RESTART'     // Restart pending
    | 'FINAL_LAPS'  // Last laps indicator
    | 'FINISH';     // Checkered flag

/**
 * Flag status for track conditions
 */
export type FlagStatus =
    | 'green'
    | 'yellow'
    | 'red'
    | 'white'      // Last lap
    | 'checkered'
    | 'black';     // Disqualification

/**
 * Session type from sim
 */
export type SessionType = 'practice' | 'qualifying' | 'race' | 'warmup';

/**
 * Core session data
 */
export interface Session {
    id: string;
    trackName: string;
    trackConfig?: string;
    sessionType: SessionType;
    state: SessionState;
    flagStatus: FlagStatus;
    currentLap: number;
    totalLaps: number;
    timeRemaining?: number;  // milliseconds
    driverCount: number;
}

/**
 * Session state configuration
 * Controls UI behavior per state
 */
export interface SessionStateConfig {
    overlayVerbosity: 'minimal' | 'standard' | 'detailed';
    aiSuggestionFrequency: 'low' | 'medium' | 'high';
    leaderboardExpanded: boolean;
    autoHighlight: boolean;
}

/**
 * Default configs per session state
 */
export const SESSION_STATE_CONFIGS: Record<SessionState, SessionStateConfig> = {
    IDLE: {
        overlayVerbosity: 'minimal',
        aiSuggestionFrequency: 'low',
        leaderboardExpanded: false,
        autoHighlight: false,
    },
    PRACTICE: {
        overlayVerbosity: 'minimal',
        aiSuggestionFrequency: 'low',
        leaderboardExpanded: false,
        autoHighlight: false,
    },
    QUALIFYING: {
        overlayVerbosity: 'standard',
        aiSuggestionFrequency: 'medium',
        leaderboardExpanded: true,
        autoHighlight: true,
    },
    RACE_GREEN: {
        overlayVerbosity: 'standard',
        aiSuggestionFrequency: 'high',
        leaderboardExpanded: false,
        autoHighlight: true,
    },
    CAUTION: {
        overlayVerbosity: 'detailed',
        aiSuggestionFrequency: 'low',
        leaderboardExpanded: true,
        autoHighlight: false,
    },
    RESTART: {
        overlayVerbosity: 'detailed',
        aiSuggestionFrequency: 'high',
        leaderboardExpanded: true,
        autoHighlight: true,
    },
    FINAL_LAPS: {
        overlayVerbosity: 'detailed',
        aiSuggestionFrequency: 'high',
        leaderboardExpanded: false,
        autoHighlight: true,
    },
    FINISH: {
        overlayVerbosity: 'detailed',
        aiSuggestionFrequency: 'low',
        leaderboardExpanded: true,
        autoHighlight: false,
    },
};

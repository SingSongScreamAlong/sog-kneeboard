// =====================================================================
// Season Management Types
// Types for championship/season tracking
// =====================================================================

// Season configuration
export interface Season {
    id: string;
    name: string;
    leagueName: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';

    // Configuration
    rounds: SeasonRound[];
    pointsSystem: SeasonPointsSystem;
    tiebreakerRules: TiebreakerRule[];
    dropWorstCount: number;

    // Participants
    registeredDrivers: SeasonDriver[];
    registeredTeams: SeasonTeam[];

    // Results
    currentStandings: DriverStanding[];
    teamStandings: TeamStanding[];

    createdAt: Date;
    updatedAt: Date;
}

export interface SeasonRound {
    roundNumber: number;
    name: string;
    trackName: string;
    scheduledDate: Date;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
    sessionId?: string;
    results?: RoundResult[];
    notes?: string;
}

export interface SeasonPointsSystem {
    id: string;
    name: string;
    racePoints: number[];           // Points by position (1st, 2nd, etc.)
    stagePoints: number[];          // Stage points
    polePoints: number;             // Points for pole position
    fastestLapPoints: number;       // Points for fastest lap
    lapLedPoints: number;           // Points per lap led
    mostLapsLedBonus: number;       // Bonus for most laps led
    finishBonus: number;            // Points for finishing the race
}

export interface TiebreakerRule {
    priority: number;
    type: 'wins' | 'podiums' | 'best_finish' | 'most_recent_best' | 'head_to_head';
    description: string;
}

// Season participants
export interface SeasonDriver {
    driverId: string;
    driverName: string;
    carNumber: string;
    teamId?: string;
    teamName?: string;
    registeredAt: Date;
    isActive: boolean;

    // Stats
    roundsEntered: number;
    roundsCompleted: number;
    bestFinish: number;
    averageFinish: number;
}

export interface SeasonTeam {
    teamId: string;
    teamName: string;
    drivers: string[];
    primaryColor?: string;
    secondaryColor?: string;
}

// Standings
export interface DriverStanding {
    position: number;
    previousPosition?: number;
    positionChange: number;
    driverId: string;
    driverName: string;
    carNumber: string;
    teamName?: string;

    // Points breakdown
    totalPoints: number;
    droppedPoints: number;
    racePoints: number;
    stagePoints: number;
    bonusPoints: number;
    playoffPoints: number;
    penaltyPoints: number;

    // Stats
    roundsEntered: number;
    wins: number;
    podiums: number;
    top5s: number;
    top10s: number;
    lapsLed: number;
    lapsCompleted: number;
    dnfs: number;
    poles: number;
    fastestLaps: number;

    // Trend
    lastFiveResults: number[];
    pointsPerRound: number;
}

export interface TeamStanding {
    position: number;
    teamId: string;
    teamName: string;
    totalPoints: number;
    wins: number;
    podiums: number;
    drivers: {
        driverId: string;
        driverName: string;
        points: number;
    }[];
}

// Round results
export interface RoundResult {
    position: number;
    driverId: string;
    driverName: string;
    carNumber: string;
    teamName?: string;

    // Points earned
    racePoints: number;
    stagePoints: number;
    bonusPoints: number;
    totalPoints: number;

    // Race stats
    startPosition: number;
    positionsGained: number;
    lapsCompleted: number;
    lapsLed: number;
    bestLapTime: number;
    incidents: number;

    // Status
    finishStatus: 'running' | 'retired' | 'disqualified';
    retirementLap?: number;
    retirementReason?: string;
}

// Advanced reporting
export interface SeasonReport {
    seasonId: string;
    seasonName: string;
    generatedAt: Date;
    generatedBy: string;

    // Summary
    totalRounds: number;
    completedRounds: number;
    totalDrivers: number;
    totalIncidents: number;
    totalPenalties: number;

    // Champions
    driverChampion?: DriverStanding;
    teamChampion?: TeamStanding;

    // Records
    mostWins: { driverName: string; count: number };
    mostPoles: { driverName: string; count: number };
    mostLapsLed: { driverName: string; count: number };
    bestAverageFinish: { driverName: string; average: number };
    mostIncidents: { driverName: string; count: number };

    // Round summaries
    roundSummaries: RoundSummary[];
}

export interface RoundSummary {
    roundNumber: number;
    trackName: string;
    date: Date;
    winner: string;
    polePosition: string;
    fastestLap: string;
    leaderboardMoves: number;      // Total position changes
    incidents: number;
    cautions: number;
    greenFlagLaps: number;
}

// Driver performance tracking
export interface DriverSeasonStats {
    driverId: string;
    driverName: string;
    seasonId: string;

    // Performance by track type
    ovalPerformance: TrackTypeStats;
    roadPerformance: TrackTypeStats;
    streetPerformance: TrackTypeStats;

    // Trends
    positionTrend: number[];        // Average finish by round
    incidentTrend: number[];        // Incidents per round
    qualifyingTrend: number[];      // Qualifying position by round

    // Comparisons
    vsTeammate?: {
        headToHead: number;         // Win percentage
        averageGap: number;         // Positions
    };

    // Incident analysis
    incidentBreakdown: {
        type: string;
        count: number;
        atFaultCount: number;
    }[];
}

export interface TrackTypeStats {
    rounds: number;
    averageStart: number;
    averageFinish: number;
    positionsGained: number;
    wins: number;
    incidents: number;
}

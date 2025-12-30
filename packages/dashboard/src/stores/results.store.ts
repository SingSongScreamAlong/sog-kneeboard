// =====================================================================
// Results Store
// Zustand store for race results and standings management
// =====================================================================

import { create } from 'zustand';
import type {
    ProcessedDriverResult,
    StandingsEntry,
    PointsConfiguration,
    AppliedPenalty,
} from '@controlbox/common';
import { DEFAULT_POINTS_CONFIGURATION } from '@controlbox/common';

interface ResultsStore {
    // State
    sessionResults: ProcessedDriverResult[];
    standings: StandingsEntry[];
    pointsConfig: PointsConfiguration;

    // Actions
    setSessionResults: (results: ProcessedDriverResult[]) => void;
    updateDriverResult: (driverId: string, updates: Partial<ProcessedDriverResult>) => void;
    applyPenaltyToResult: (driverId: string, penalty: AppliedPenalty) => void;
    calculatePoints: () => void;

    // Points configuration
    setPointsConfig: (config: PointsConfiguration) => void;

    // Standings
    updateStandings: () => void;

    // Import/Export
    importIRacingResults: (jsonData: unknown) => void;
    exportResults: () => string;
    exportStandings: () => string;

    // Generate sample results
    generateSampleResults: () => void;
}

export const useResultsStore = create<ResultsStore>((set, get) => ({
    sessionResults: [],
    standings: [],
    pointsConfig: DEFAULT_POINTS_CONFIGURATION,

    setSessionResults: (results) => set({ sessionResults: results }),

    updateDriverResult: (driverId, updates) => {
        const results = get().sessionResults.map(r =>
            r.driverId === driverId ? { ...r, ...updates } : r
        );
        set({ sessionResults: results });
    },

    applyPenaltyToResult: (driverId, penalty) => {
        const results = get().sessionResults;
        const driverResult = results.find(r => r.driverId === driverId);
        if (!driverResult) return;

        let positionPenalty = 0;
        let timePenalty = 0;

        // Parse penalty value
        if (penalty.type === 'time_penalty') {
            const match = penalty.value.match(/(\d+)/);
            if (match) timePenalty = parseInt(match[1]);
        } else if (penalty.type === 'position_penalty') {
            const match = penalty.value.match(/(\d+)/);
            if (match) positionPenalty = parseInt(match[1]);
        } else if (penalty.type === 'dq') {
            // Move to last position
            positionPenalty = results.length - driverResult.position;
        }

        const updatedResult: ProcessedDriverResult = {
            ...driverResult,
            timePenalties: driverResult.timePenalties + timePenalty,
            positionPenalties: driverResult.positionPenalties + positionPenalty,
            appliedPenalties: [...driverResult.appliedPenalties, penalty],
            finishStatus: penalty.type === 'dq' ? 'disqualified' : driverResult.finishStatus,
        };

        // Apply position penalty
        if (positionPenalty > 0) {
            updatedResult.position = Math.min(
                results.length,
                driverResult.position + positionPenalty
            );
        }

        get().updateDriverResult(driverId, updatedResult);
        get().calculatePoints();
    },

    calculatePoints: () => {
        const results = get().sessionResults;
        const config = get().pointsConfig;

        const updatedResults = results.map(result => {
            // Skip if disqualified
            if (result.finishStatus === 'disqualified') {
                return { ...result, racePoints: 0, totalPoints: result.stagePoints.reduce((a, b) => a + b, 0) - result.penaltyPoints };
            }

            // Calculate race points
            const racePoints = config.racePoints[result.position - 1] || 0;

            // Calculate bonus points
            let bonusPoints = 0;
            if (result.lapsLed > 0) bonusPoints += config.lapLedBonus;

            // Total stage points
            const stagePointsTotal = result.stagePoints.reduce((a, b) => a + b, 0);

            // Total
            const totalPoints = racePoints + stagePointsTotal + bonusPoints - result.penaltyPoints;

            return {
                ...result,
                racePoints,
                bonusPoints,
                totalPoints,
            };
        });

        set({ sessionResults: updatedResults });
    },

    setPointsConfig: (config) => {
        set({ pointsConfig: config });
        get().calculatePoints();
    },

    updateStandings: () => {
        // This would aggregate results across multiple sessions
        // For now, just use current session results
        const results = get().sessionResults;

        const standings: StandingsEntry[] = results
            .filter(r => r.finishStatus !== 'disqualified')
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((r, index) => ({
                position: index + 1,
                positionChange: 0,
                driverId: r.driverId,
                driverName: r.driverName,
                teamName: r.teamName,
                carClass: r.carClass,
                totalPoints: r.totalPoints,
                racePoints: r.racePoints,
                stagePoints: r.stagePoints.reduce((a, b) => a + b, 0),
                bonusPoints: r.bonusPoints,
                penaltyPoints: r.penaltyPoints,
                droppedPoints: 0,
                races: 1,
                wins: r.position === 1 ? 1 : 0,
                podiums: r.position <= 3 ? 1 : 0,
                poles: 0,
                lapsLed: r.lapsLed,
                dnfs: r.finishStatus === 'retired' ? 1 : 0,
                incidents: r.incidentCount,
                bestFinish: r.position,
                averageFinish: r.position,
                averageStart: 0,
            }));

        set({ standings });
    },

    importIRacingResults: (jsonData) => {
        // Parse iRacing results JSON and convert to ProcessedDriverResult
        try {
            const data = jsonData as any;

            // Find race session
            const raceSession = data.session_results?.find(
                (s: any) => s.simsession_type === 5
            );

            if (!raceSession?.results) {
                console.error('No race results found in file');
                return;
            }

            const results: ProcessedDriverResult[] = raceSession.results.map((r: any) => ({
                position: r.finish_position,
                originalPosition: r.finish_position,
                classPosition: r.finish_position_in_class,
                driverId: String(r.cust_id),
                driverName: r.display_name,
                carNumber: r.car_number,
                carClass: r.car_class_name,
                teamName: r.team_name,
                lapsCompleted: r.laps_complete,
                lapsLed: r.laps_lead,
                gap: formatGap(r.interval),
                bestLapTime: r.best_lap_time,
                bestLapNumber: r.best_lap_num,
                averageLapTime: r.average_lap,
                racePoints: 0,
                stagePoints: [],
                bonusPoints: 0,
                penaltyPoints: 0,
                totalPoints: 0,
                timePenalties: 0,
                positionPenalties: 0,
                appliedPenalties: [],
                incidentCount: r.incidents,
                incidentPoints: r.incidents,
                iRatingBefore: r.oldi_rating,
                iRatingAfter: r.newi_rating,
                iRatingChange: r.newi_rating - r.oldi_rating,
                safetyRatingBefore: r.old_sub_level / 100,
                safetyRatingAfter: r.new_sub_level / 100,
                safetyRatingChange: (r.new_sub_level - r.old_sub_level) / 100,
                finishStatus: r.reason_out_id === 0 ? 'running' : 'retired',
                retirementReason: r.reason_out,
            }));

            set({ sessionResults: results });
            get().calculatePoints();
            get().updateStandings();
        } catch (error) {
            console.error('Failed to parse iRacing results:', error);
        }
    },

    exportResults: () => {
        const results = get().sessionResults;
        return JSON.stringify(results, null, 2);
    },

    exportStandings: () => {
        const standings = get().standings;
        return JSON.stringify(standings, null, 2);
    },

    generateSampleResults: () => {
        const sampleDrivers = [
            { name: 'Max Verstappen', number: '1', team: 'Red Bull Racing' },
            { name: 'Lewis Hamilton', number: '44', team: 'Mercedes' },
            { name: 'Charles Leclerc', number: '16', team: 'Ferrari' },
            { name: 'Lando Norris', number: '4', team: 'McLaren' },
            { name: 'Carlos Sainz', number: '55', team: 'Ferrari' },
            { name: 'George Russell', number: '63', team: 'Mercedes' },
            { name: 'Oscar Piastri', number: '81', team: 'McLaren' },
            { name: 'Sergio Perez', number: '11', team: 'Red Bull Racing' },
            { name: 'Fernando Alonso', number: '14', team: 'Aston Martin' },
            { name: 'Lance Stroll', number: '18', team: 'Aston Martin' },
        ];

        const results: ProcessedDriverResult[] = sampleDrivers.map((driver, index) => ({
            position: index + 1,
            originalPosition: index + 1,
            classPosition: index + 1,
            driverId: `driver-${index}`,
            driverName: driver.name,
            carNumber: driver.number,
            carClass: 'Formula',
            teamName: driver.team,
            lapsCompleted: 50,
            lapsLed: index === 0 ? 35 : index === 1 ? 10 : index === 2 ? 5 : 0,
            gap: index === 0 ? 'Leader' : `+${(index * 5.5).toFixed(3)}`,
            bestLapTime: 90 + Math.random() * 2,
            bestLapNumber: 25 + Math.floor(Math.random() * 10),
            averageLapTime: 92 + Math.random() * 2,
            racePoints: 0,
            stagePoints: [index < 10 ? 10 - index : 0, index < 10 ? 10 - index : 0],
            bonusPoints: 0,
            penaltyPoints: 0,
            totalPoints: 0,
            timePenalties: 0,
            positionPenalties: 0,
            appliedPenalties: [],
            incidentCount: Math.floor(Math.random() * 4),
            incidentPoints: 0,
            iRatingBefore: 5000 + Math.random() * 3000,
            iRatingAfter: 5000 + Math.random() * 3000,
            iRatingChange: Math.floor(Math.random() * 100) - 50,
            safetyRatingBefore: 4.0 + Math.random(),
            safetyRatingAfter: 4.0 + Math.random(),
            safetyRatingChange: (Math.random() - 0.5) * 0.2,
            finishStatus: 'running',
        }));

        set({ sessionResults: results });
        get().calculatePoints();
        get().updateStandings();
    },
}));

function formatGap(microseconds: number): string {
    if (microseconds === 0) return 'Leader';
    const seconds = microseconds / 1000000;
    if (seconds < 60) return `+${seconds.toFixed(3)}`;
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `+${mins}:${secs.padStart(6, '0')}`;
}

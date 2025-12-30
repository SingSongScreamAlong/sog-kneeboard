// =====================================================================
// Race Control Store
// Zustand store for race control state management
// =====================================================================

import { create } from 'zustand';
import type {
    RaceControlFlag,
    RaceControlDriverFlag,
    FlagEvent,
    FlagState,
    CautionPeriod,
    RaceControlState,
    SessionStage,
    RestartType,
} from '@controlbox/common';

interface RaceControlStore {
    // State
    state: RaceControlState | null;
    flagHistory: FlagEvent[];
    cautionHistory: CautionPeriod[];

    // Actions
    setState: (state: RaceControlState) => void;
    updateState: (partial: Partial<RaceControlState>) => void;

    // Flag actions
    deployGlobalFlag: (flag: RaceControlFlag, reason?: string) => void;
    deployDriverFlag: (driverId: string, driverName: string, flag: RaceControlDriverFlag, reason?: string) => void;
    clearDriverFlag: (driverId: string) => void;
    clearAllFlags: () => void;

    // Caution actions
    deployCaution: (type: 'local' | 'full_course', reason: string, incidentId?: string) => void;
    endCaution: (restartType: RestartType) => void;

    // Session actions
    pauseSession: () => void;
    resumeSession: () => void;
    advanceStage: () => void;
    endSession: () => void;

    // Restart actions
    initiateRestart: (type: RestartType, lap: number) => void;
    completeRestart: () => void;
}

const DEFAULT_FLAG_STATE: FlagState = {
    global: 'green',
    sectors: [],
    driverFlags: {},
    activeFlags: [],
};

// Default state is initialized dynamically per session

export const useRaceControlStore = create<RaceControlStore>((set, get) => ({
    state: null,
    flagHistory: [],
    cautionHistory: [],

    setState: (state) => set({ state }),

    updateState: (partial) => {
        const current = get().state;
        if (current) {
            set({ state: { ...current, ...partial } });
        }
    },

    deployGlobalFlag: (flag, reason) => {
        const current = get().state;
        if (!current) return;

        const flagEvent: FlagEvent = {
            id: `flag-${Date.now()}`,
            sessionId: current.sessionId,
            type: 'global',
            flag,
            previousFlag: current.flags.global,
            reason,
            issuedBy: 'steward',
            issuedAt: new Date(),
            lapNumber: current.lapsCompleted,
            sessionTimeMs: Date.now(),
        };

        set({
            state: {
                ...current,
                flags: {
                    ...current.flags,
                    global: flag,
                    activeFlags: [...current.flags.activeFlags, flagEvent],
                },
                isUnderCaution: flag === 'yellow' || flag === 'red',
            },
            flagHistory: [...get().flagHistory, flagEvent],
        });
    },

    deployDriverFlag: (driverId, driverName, flag, reason) => {
        const current = get().state;
        if (!current) return;

        const flagEvent: FlagEvent = {
            id: `flag-${Date.now()}`,
            sessionId: current.sessionId,
            type: 'driver',
            flag,
            previousFlag: current.flags.driverFlags[driverId] || 'none',
            targetDriverId: driverId,
            targetDriverName: driverName,
            reason,
            issuedBy: 'steward',
            issuedAt: new Date(),
            lapNumber: current.lapsCompleted,
            sessionTimeMs: Date.now(),
        };

        set({
            state: {
                ...current,
                flags: {
                    ...current.flags,
                    driverFlags: {
                        ...current.flags.driverFlags,
                        [driverId]: flag,
                    },
                    activeFlags: [...current.flags.activeFlags, flagEvent],
                },
            },
            flagHistory: [...get().flagHistory, flagEvent],
        });
    },

    clearDriverFlag: (driverId) => {
        const current = get().state;
        if (!current) return;

        const updatedDriverFlags = { ...current.flags.driverFlags };
        delete updatedDriverFlags[driverId];

        set({
            state: {
                ...current,
                flags: {
                    ...current.flags,
                    driverFlags: updatedDriverFlags,
                },
            },
        });
    },

    clearAllFlags: () => {
        const current = get().state;
        if (!current) return;

        set({
            state: {
                ...current,
                flags: {
                    ...DEFAULT_FLAG_STATE,
                    global: 'green',
                },
                isUnderCaution: false,
            },
        });
    },

    deployCaution: (type, reason, incidentId) => {
        const current = get().state;
        if (!current) return;

        const caution: CautionPeriod = {
            id: `caution-${Date.now()}`,
            sessionId: current.sessionId,
            type,
            reason,
            relatedIncidentId: incidentId,
            startLap: current.lapsCompleted,
            startTimeMs: Date.now(),
            isActive: true,
            createdAt: new Date(),
        };

        // Also deploy yellow flag
        get().deployGlobalFlag('yellow', reason);

        set({
            state: {
                ...current,
                cautions: [...current.cautions, caution],
                activeCaution: caution,
                isUnderCaution: true,
            },
            cautionHistory: [...get().cautionHistory, caution],
        });
    },

    endCaution: (restartType) => {
        const current = get().state;
        if (!current || !current.activeCaution) return;

        const updatedCaution: CautionPeriod = {
            ...current.activeCaution,
            endLap: current.lapsCompleted,
            endTimeMs: Date.now(),
            restartType,
            isActive: false,
        };

        const updatedCautions = current.cautions.map(c =>
            c.id === updatedCaution.id ? updatedCaution : c
        );

        set({
            state: {
                ...current,
                cautions: updatedCautions,
                activeCaution: undefined,
                isUnderCaution: false,
                restartPending: true,
                pendingRestart: {
                    type: restartType,
                    lap: current.lapsCompleted + 1,
                },
            },
        });
    },

    pauseSession: () => {
        const current = get().state;
        if (!current) return;
        set({ state: { ...current, isPaused: true } });
    },

    resumeSession: () => {
        const current = get().state;
        if (!current) return;
        set({ state: { ...current, isPaused: false } });
    },

    advanceStage: () => {
        const current = get().state;
        if (!current) return;

        const stageOrder: SessionStage[] = [
            'pre_race', 'formation', 'stage_1', 'stage_2', 'stage_3', 'final_stage', 'cooldown', 'post_race'
        ];
        const currentIndex = stageOrder.indexOf(current.currentStage);
        const nextStage = stageOrder[currentIndex + 1] || 'post_race';

        set({ state: { ...current, currentStage: nextStage } });
    },

    endSession: () => {
        const current = get().state;
        if (!current) return;
        set({ state: { ...current, currentStage: 'post_race' } });
        get().deployGlobalFlag('checkered', 'Session ended');
    },

    initiateRestart: (type, lap) => {
        const current = get().state;
        if (!current) return;

        set({
            state: {
                ...current,
                restartPending: true,
                pendingRestart: { type, lap },
            },
        });
    },

    completeRestart: () => {
        const current = get().state;
        if (!current) return;

        set({
            state: {
                ...current,
                restartPending: false,
                pendingRestart: undefined,
            },
        });

        get().deployGlobalFlag('green', 'Restart');
    },
}));

// =====================================================================
// Session Store
// Zustand store for session state management
// =====================================================================

import { create } from 'zustand';
import type {
    Session,
    SessionState,
    SessionStateConfig,
    FlagStatus
} from '@broadcastbox/common';
import { SESSION_STATE_CONFIGS } from '@broadcastbox/common';

export type UserRole = 'operator' | 'director' | 'superadmin';

interface SessionStoreState {
    // Current session data
    session: Session | null;
    sessionState: SessionState;
    stateConfig: SessionStateConfig;

    // Connection status
    isConnected: boolean;

    // Account role
    userRole: UserRole;

    // Actions
    setSession: (session: Session | null) => void;
    setSessionState: (state: SessionState) => void;
    updateLap: (currentLap: number) => void;
    updateFlag: (flag: FlagStatus) => void;
    setConnected: (connected: boolean) => void;
    setUserRole: (role: UserRole) => void;
}

const DEFAULT_CONFIG: SessionStateConfig = {
    overlayVerbosity: 'minimal',
    aiSuggestionFrequency: 'low',
    leaderboardExpanded: false,
    autoHighlight: false,
};

export const useSessionStore = create<SessionStoreState>((set, get) => ({
    // Initial state
    session: null,
    sessionState: 'IDLE',
    stateConfig: DEFAULT_CONFIG,
    isConnected: false,
    userRole: 'superadmin',

    // Actions
    setSession: (session) => set({ session }),

    setSessionState: (state) => {
        set({
            sessionState: state,
            stateConfig: SESSION_STATE_CONFIGS[state] || DEFAULT_CONFIG,
        });
    },

    updateLap: (currentLap) => {
        const { session } = get();
        if (session) {
            set({ session: { ...session, currentLap } });
        }
    },

    updateFlag: (flagStatus) => {
        const { session } = get();
        if (session) {
            set({ session: { ...session, flagStatus } });
        }
    },

    setConnected: (isConnected) => set({ isConnected }),

    setUserRole: (userRole) => set({ userRole }),
}));

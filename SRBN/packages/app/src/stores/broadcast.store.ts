// =====================================================================
// Broadcast Store
// Zustand store for broadcast state and camera control
// =====================================================================

import { create } from 'zustand';
import type {
    BroadcastState,
    CameraMode,
    CameraSuggestion,
    ReplayBookmark,
    OutputStatus
} from '@broadcastbox/common';

interface BroadcastStoreState extends BroadcastState {
    // UI state
    showAdvancedOptions: boolean;
    leaderboardExpanded: boolean;
    selectedSuggestionIndex: number;

    // Media sources
    youtubeUrl: string | null;
    masterVolume: number; // 0-100
    driverAudioMuted: Record<string, boolean>; // driverId -> muted

    // Actions
    setFeaturedDriver: (driverId: string | null) => void;
    setFeaturedBattle: (battle: { driverA: string; driverB: string } | null) => void;
    setCameraMode: (mode: CameraMode) => void;
    toggleCameraLock: () => void;
    setDelay: (delayMs: number) => void;
    setAIAggressiveness: (value: number) => void;
    setOverlayVerbosity: (verbosity: 'minimal' | 'standard' | 'detailed') => void;

    // UI actions
    toggleAdvancedOptions: () => void;
    toggleLeaderboard: () => void;

    // Media source actions
    setYoutubeUrl: (url: string | null) => void;
    setMasterVolume: (volume: number) => void;
    toggleDriverAudio: (driverId: string) => void;
    setDriverAudioMuted: (driverId: string, muted: boolean) => void;
    resetToAuto: () => void;

    // Suggestion actions
    addSuggestion: (suggestion: CameraSuggestion) => void;
    dismissSuggestion: (id: string) => void;
    acceptSuggestion: (id: string) => void;
    nextSuggestion: () => void;
    prevSuggestion: () => void;

    // Replay actions
    addBookmark: (bookmark: ReplayBookmark) => void;
    replayLastEvent: () => ReplayBookmark | null;

    // Output actions
    updateOutput: (target: string, status: Partial<OutputStatus>) => void;
}

export const useBroadcastStore = create<BroadcastStoreState>((set, get) => ({
    // Initial broadcast state
    sessionId: null,
    featuredDriverId: null,
    featuredBattle: null,
    cameraMode: 'world',
    cameraLocked: false,
    delayMs: 0,
    outputs: [],
    aiAggressiveness: 50,
    overlayVerbosity: 'standard',
    pendingSuggestions: [],
    replayBookmarks: [],
    isLive: false,

    // UI state
    showAdvancedOptions: false,
    leaderboardExpanded: false,
    selectedSuggestionIndex: 0,

    // Media sources
    youtubeUrl: null,
    masterVolume: 80,
    driverAudioMuted: {},

    // Camera actions
    setFeaturedDriver: (driverId) => set({ featuredDriverId: driverId }),

    setFeaturedBattle: (battle) => set({ featuredBattle: battle }),

    setCameraMode: (mode) => set({ cameraMode: mode }),

    toggleCameraLock: () => set((state) => ({ cameraLocked: !state.cameraLocked })),

    setDelay: (delayMs) => set({ delayMs }),

    setAIAggressiveness: (value) => set({ aiAggressiveness: value }),

    setOverlayVerbosity: (verbosity) => set({ overlayVerbosity: verbosity }),

    // UI actions
    toggleAdvancedOptions: () => set((state) => ({
        showAdvancedOptions: !state.showAdvancedOptions
    })),

    toggleLeaderboard: () => set((state) => ({
        leaderboardExpanded: !state.leaderboardExpanded
    })),

    // Media source actions
    setYoutubeUrl: (url) => set({ youtubeUrl: url }),

    setMasterVolume: (volume) => set({ masterVolume: Math.max(0, Math.min(100, volume)) }),

    toggleDriverAudio: (driverId) => set((state) => ({
        driverAudioMuted: {
            ...state.driverAudioMuted,
            [driverId]: !state.driverAudioMuted[driverId]
        }
    })),

    setDriverAudioMuted: (driverId, muted) => set((state) => ({
        driverAudioMuted: { ...state.driverAudioMuted, [driverId]: muted }
    })),

    // Reset to auto - clears manual overrides and returns to AI direction
    resetToAuto: () => set({
        featuredDriverId: null,
        featuredBattle: null,
        cameraMode: 'world',
        cameraLocked: false,
    }),

    // Suggestion actions
    addSuggestion: (suggestion) => set((state) => ({
        pendingSuggestions: [...state.pendingSuggestions, suggestion]
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5), // Keep top 5
    })),

    dismissSuggestion: (id) => set((state) => ({
        pendingSuggestions: state.pendingSuggestions.filter(s => s.id !== id),
    })),

    acceptSuggestion: (id) => {
        const { pendingSuggestions } = get();
        const suggestion = pendingSuggestions.find(s => s.id === id);
        if (suggestion) {
            if (suggestion.targetDriverId) {
                set({ featuredDriverId: suggestion.targetDriverId });
            }
            if (suggestion.targetBattle) {
                set({ featuredBattle: suggestion.targetBattle });
            }
            set({ cameraMode: suggestion.cameraMode });
            get().dismissSuggestion(id);
        }
    },

    nextSuggestion: () => set((state) => ({
        selectedSuggestionIndex: Math.min(
            state.selectedSuggestionIndex + 1,
            state.pendingSuggestions.length - 1
        ),
    })),

    prevSuggestion: () => set((state) => ({
        selectedSuggestionIndex: Math.max(state.selectedSuggestionIndex - 1, 0),
    })),

    // Replay actions
    addBookmark: (bookmark) => set((state) => ({
        replayBookmarks: [...state.replayBookmarks, bookmark].slice(-50), // Keep last 50
    })),

    replayLastEvent: () => {
        const { replayBookmarks } = get();
        return replayBookmarks.length > 0
            ? replayBookmarks[replayBookmarks.length - 1]
            : null;
    },

    // Output actions
    updateOutput: (target, status) => set((state) => ({
        outputs: state.outputs.map(o =>
            o.target === target ? { ...o, ...status } : o
        ),
    })),
}));

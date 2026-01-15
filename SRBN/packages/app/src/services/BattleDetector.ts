// =====================================================================
// BattleDetector
// AI service for detecting close racing and suggesting camera switches
// =====================================================================

import { create } from 'zustand';
import type { Driver } from '@broadcastbox/common';

export interface Battle {
    id: string;
    driverIds: string[];
    positions: number[];
    gap: number;
    closingRate: number;      // Seconds per lap (positive = closing)
    intensity: number;        // 0-1 score
    duration: number;         // Seconds since battle started
    lapsRemaining: number;    // Estimated laps until pass
    type: 'drs_train' | 'wheel_to_wheel' | 'closing' | 'defensive';
}

export interface CameraSuggestion {
    id: string;
    timestamp: number;
    targetDriverId: string;
    reason: string;
    confidence: number;
    battleId?: string;
    expires: number;
}

interface BattleState {
    activeBattles: Battle[];
    suggestions: CameraSuggestion[];
    focusedBattleId: string | null;

    // Settings
    battleThresholdGap: number;     // Gap in seconds to consider a battle
    suggestionEnabled: boolean;

    // Actions
    setBattles: (battles: Battle[]) => void;
    addSuggestion: (suggestion: CameraSuggestion) => void;
    dismissSuggestion: (id: string) => void;
    setFocusedBattle: (id: string | null) => void;
    setSettings: (threshold: number, enabled: boolean) => void;
}

export const useBattleStore = create<BattleState>((set) => ({
    activeBattles: [],
    suggestions: [],
    focusedBattleId: null,
    battleThresholdGap: 1.5,
    suggestionEnabled: true,

    setBattles: (battles) => set({ activeBattles: battles }),

    addSuggestion: (suggestion) => set((state) => ({
        suggestions: [...state.suggestions, suggestion]
            .filter(s => s.expires > Date.now())
            .slice(0, 5)
    })),

    dismissSuggestion: (id) => set((state) => ({
        suggestions: state.suggestions.filter(s => s.id !== id)
    })),

    setFocusedBattle: (id) => set({ focusedBattleId: id }),

    setSettings: (threshold, enabled) => set({
        battleThresholdGap: threshold,
        suggestionEnabled: enabled,
    }),
}));

// =====================================================================
// BattleDetector Class
// =====================================================================

class BattleDetector {
    private lastAnalysis: number = 0;
    private analysisIntervalMs: number = 1000;
    private gapHistory: Map<string, number[]> = new Map(); // driverId -> last N gaps
    private historyLength: number = 10;

    // Analyze driver data for battles
    analyze(drivers: Driver[]): void {
        const now = Date.now();
        if (now - this.lastAnalysis < this.analysisIntervalMs) return;
        this.lastAnalysis = now;

        const { battleThresholdGap, suggestionEnabled } = useBattleStore.getState();
        const battles: Battle[] = [];

        // Sort by position
        const sorted = [...drivers].sort((a, b) => a.position - b.position);

        // Find battles (pairs of drivers with small gaps)
        for (let i = 0; i < sorted.length - 1; i++) {
            const ahead = sorted[i];
            const behind = sorted[i + 1];

            const gap = Math.abs(behind.gapAhead || 999);

            if (gap <= battleThresholdGap) {
                const closingRate = this.calculateClosingRate(behind.id, gap);
                const intensity = this.calculateIntensity(gap, closingRate);

                const battle: Battle = {
                    id: `battle-${ahead.id}-${behind.id}`,
                    driverIds: [ahead.id, behind.id],
                    positions: [ahead.position, behind.position],
                    gap,
                    closingRate,
                    intensity,
                    duration: 0, // Would track over time
                    lapsRemaining: closingRate > 0 ? gap / closingRate : 999,
                    type: this.classifyBattle(gap, closingRate),
                };

                battles.push(battle);

                // Auto-suggest camera switch for intense battles
                if (suggestionEnabled && intensity > 0.7) {
                    this.suggestCamera(behind, battle);
                }
            }

            // Update gap history
            this.updateGapHistory(behind.id, gap);
        }

        useBattleStore.getState().setBattles(battles);
    }

    private calculateClosingRate(driverId: string, currentGap: number): number {
        const history = this.gapHistory.get(driverId) || [];
        if (history.length < 3) return 0;

        // Calculate trend over last N samples
        const oldGap = history[0];
        const samples = history.length;

        // Closing rate in seconds per analysis cycle
        return (oldGap - currentGap) / samples;
    }

    private calculateIntensity(gap: number, closingRate: number): number {
        // Intensity based on gap and closing rate
        // Closer = more intense, faster closing = more intense
        const gapScore = Math.max(0, 1 - gap / 2); // 0 at 2s, 1 at 0s
        const closingScore = Math.min(1, closingRate * 5); // Scale closing rate

        return Math.min(1, (gapScore * 0.7) + (closingScore * 0.3));
    }

    private classifyBattle(gap: number, closingRate: number): Battle['type'] {
        if (gap < 0.3) return 'wheel_to_wheel';
        if (gap < 1.0 && closingRate < 0.1) return 'drs_train';
        if (closingRate > 0.2) return 'closing';
        return 'defensive';
    }

    private updateGapHistory(driverId: string, gap: number): void {
        const history = this.gapHistory.get(driverId) || [];
        history.push(gap);
        if (history.length > this.historyLength) {
            history.shift();
        }
        this.gapHistory.set(driverId, history);
    }

    private suggestCamera(driver: Driver, battle: Battle): void {
        const existing = useBattleStore.getState().suggestions
            .find(s => s.battleId === battle.id);

        if (existing) return; // Don't duplicate suggestions

        const suggestion: CameraSuggestion = {
            id: `suggest-${Date.now()}`,
            timestamp: Date.now(),
            targetDriverId: driver.id,
            reason: this.generateReason(battle),
            confidence: Math.round(battle.intensity * 100),
            battleId: battle.id,
            expires: Date.now() + 30000, // 30 second expiry
        };

        useBattleStore.getState().addSuggestion(suggestion);
        console.log('🤖 Battle suggestion:', suggestion.reason);
    }

    private generateReason(battle: Battle): string {
        const positions = `P${battle.positions[0]}-P${battle.positions[1]}`;

        switch (battle.type) {
            case 'wheel_to_wheel':
                return `Wheel-to-wheel battle ${positions}`;
            case 'drs_train':
                return `DRS train forming ${positions}`;
            case 'closing':
                return `Closing gap ${positions} (${battle.gap.toFixed(1)}s, +${(battle.closingRate * 10).toFixed(1)}s/lap)`;
            case 'defensive':
                return `Defensive battle ${positions}`;
            default:
                return `Battle for position ${positions}`;
        }
    }

    // Get the most exciting battle currently
    getTopBattle(): Battle | null {
        const battles = useBattleStore.getState().activeBattles;
        if (battles.length === 0) return null;

        return battles.reduce((top, battle) =>
            battle.intensity > top.intensity ? battle : top
        );
    }

    // Clear all data (e.g., at session start)
    reset(): void {
        this.gapHistory.clear();
        useBattleStore.getState().setBattles([]);
    }
}

// Singleton export
export const battleDetector = new BattleDetector();

// =====================================================================
// Driver Store
// Zustand store for driver data and selection
// =====================================================================

import { create } from 'zustand';
import type { Driver, Battle } from '@broadcastbox/common';

interface DriverStoreState {
    // Driver data
    drivers: Driver[];
    stackDriverIds: string[]; // IDs of drivers in the stack (up to 5)

    // Battles
    battles: Battle[];

    // Actions
    setDrivers: (drivers: Driver[]) => void;
    updateDriver: (driverId: string, update: Partial<Driver>) => void;
    setStackDrivers: (driverIds: string[]) => void;
    addToStack: (driverId: string) => void;
    removeFromStack: (driverId: string) => void;
    setBattles: (battles: Battle[]) => void;

    // Computed
    getStackDrivers: () => Driver[];
    getDriverById: (id: string) => Driver | undefined;
}

export const useDriverStore = create<DriverStoreState>((set, get) => ({
    // Initial state
    drivers: [],
    stackDriverIds: [],
    battles: [],

    // Actions
    setDrivers: (drivers) => {
        set({ drivers });
        const { stackDriverIds } = get();
        const driverIdSet = new Set(drivers.map(d => d.id));

        // Remove stale IDs that no longer exist in the new driver list
        const validStackIds = stackDriverIds.filter(id => driverIdSet.has(id));

        // If stack is empty or all previous IDs became stale, seed from top 5
        if (validStackIds.length === 0) {
            const topFive = [...drivers]
                .sort((a, b) => a.position - b.position)
                .slice(0, 5)
                .map(d => d.id);
            set({ stackDriverIds: topFive });
        } else if (validStackIds.length !== stackDriverIds.length) {
            set({ stackDriverIds: validStackIds });
        }
    },

    updateDriver: (driverId, update) => set((state) => ({
        drivers: state.drivers.map(d =>
            d.id === driverId ? { ...d, ...update } : d
        ),
    })),

    setStackDrivers: (driverIds) => set({
        stackDriverIds: driverIds.slice(0, 5)
    }),

    addToStack: (driverId) => set((state) => {
        if (state.stackDriverIds.length >= 5) return state;
        if (state.stackDriverIds.includes(driverId)) return state;
        return { stackDriverIds: [...state.stackDriverIds, driverId] };
    }),

    removeFromStack: (driverId) => set((state) => ({
        stackDriverIds: state.stackDriverIds.filter(id => id !== driverId),
    })),

    setBattles: (battles) => set({ battles }),

    // Computed
    getStackDrivers: () => {
        const { drivers, stackDriverIds } = get();
        return stackDriverIds
            .map(id => drivers.find(d => d.id === id))
            .filter((d): d is Driver => d !== undefined);
    },

    getDriverById: (id) => get().drivers.find(d => d.id === id),
}));

// =====================================================================
// Roster Store
// Zustand store for driver and team management
// =====================================================================

import { create } from 'zustand';
import type {
    Driver,
    Team,
    CarClass,
    DriverParticipation,
    GridEntry,
    GridSortOption,
} from '@controlbox/common';

interface RosterStore {
    // State
    drivers: Driver[];
    teams: Team[];
    classes: CarClass[];
    participation: DriverParticipation[];
    grid: GridEntry[];

    // Actions
    setDrivers: (drivers: Driver[]) => void;
    addDriver: (driver: Driver) => void;
    updateDriver: (driverId: string, updates: Partial<Driver>) => void;
    removeDriver: (driverId: string) => void;

    setTeams: (teams: Team[]) => void;
    addTeam: (team: Team) => void;
    updateTeam: (teamId: string, updates: Partial<Team>) => void;
    removeTeam: (teamId: string) => void;

    setClasses: (classes: CarClass[]) => void;
    addClass: (carClass: CarClass) => void;
    updateClass: (classId: string, updates: Partial<CarClass>) => void;
    removeClass: (classId: string) => void;

    // Participation
    setParticipation: (participation: DriverParticipation[]) => void;
    updateDriverParticipation: (driverId: string, updates: Partial<DriverParticipation>) => void;

    // Grid
    setGrid: (grid: GridEntry[]) => void;
    sortGrid: (by: GridSortOption) => void;
    moveDriverInGrid: (driverId: string, newPosition: number) => void;

    // Helpers
    getDriverById: (driverId: string) => Driver | undefined;
    getTeamById: (teamId: string) => Team | undefined;
    getDriversByTeam: (teamId: string) => Driver[];
    getDriversByClass: (className: string) => Driver[];
}

// Sample data for demo
const SAMPLE_DRIVERS: Driver[] = [
    { id: 'd1', name: 'Max Verstappen', carNumber: '1', carClass: 'Formula', isActive: true, isRegistered: true, isCheckedIn: true, iRating: 8500, safetyRating: 4.99, licenseClass: 'A', createdAt: new Date(), updatedAt: new Date() },
    { id: 'd2', name: 'Lewis Hamilton', carNumber: '44', carClass: 'Formula', teamId: 't1', isActive: true, isRegistered: true, isCheckedIn: true, iRating: 8200, safetyRating: 4.85, licenseClass: 'A', createdAt: new Date(), updatedAt: new Date() },
    { id: 'd3', name: 'Charles Leclerc', carNumber: '16', carClass: 'Formula', teamId: 't2', isActive: true, isRegistered: true, isCheckedIn: true, iRating: 7800, safetyRating: 4.75, licenseClass: 'A', createdAt: new Date(), updatedAt: new Date() },
    { id: 'd4', name: 'Lando Norris', carNumber: '4', carClass: 'Formula', teamId: 't3', isActive: true, isRegistered: true, isCheckedIn: true, iRating: 7600, safetyRating: 4.80, licenseClass: 'A', createdAt: new Date(), updatedAt: new Date() },
    { id: 'd5', name: 'Carlos Sainz', carNumber: '55', carClass: 'Formula', teamId: 't2', isActive: true, isRegistered: true, isCheckedIn: true, iRating: 7500, safetyRating: 4.70, licenseClass: 'A', createdAt: new Date(), updatedAt: new Date() },
];

const SAMPLE_TEAMS: Team[] = [
    { id: 't1', name: 'Mercedes-AMG', shortName: 'MER', primaryColor: '#00D2BE', driverIds: ['d2'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 't2', name: 'Scuderia Ferrari', shortName: 'FER', primaryColor: '#DC0000', driverIds: ['d3', 'd5'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 't3', name: 'McLaren', shortName: 'MCL', primaryColor: '#FF8700', driverIds: ['d4'], isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const SAMPLE_CLASSES: CarClass[] = [
    { id: 'c1', name: 'Formula', shortName: 'F1', color: '#E10600', priority: 1, cars: ['Formula Vee', 'Formula Renault'], isActive: true },
];

export const useRosterStore = create<RosterStore>((set, get) => ({
    drivers: SAMPLE_DRIVERS,
    teams: SAMPLE_TEAMS,
    classes: SAMPLE_CLASSES,
    participation: [],
    grid: [],

    setDrivers: (drivers) => set({ drivers }),

    addDriver: (driver) => {
        set({ drivers: [...get().drivers, driver] });
    },

    updateDriver: (driverId, updates) => {
        const drivers = get().drivers.map(d =>
            d.id === driverId ? { ...d, ...updates, updatedAt: new Date() } : d
        );
        set({ drivers });
    },

    removeDriver: (driverId) => {
        set({ drivers: get().drivers.filter(d => d.id !== driverId) });
    },

    setTeams: (teams) => set({ teams }),

    addTeam: (team) => {
        set({ teams: [...get().teams, team] });
    },

    updateTeam: (teamId, updates) => {
        const teams = get().teams.map(t =>
            t.id === teamId ? { ...t, ...updates, updatedAt: new Date() } : t
        );
        set({ teams });
    },

    removeTeam: (teamId) => {
        set({ teams: get().teams.filter(t => t.id !== teamId) });
    },

    setClasses: (classes) => set({ classes }),

    addClass: (carClass) => {
        set({ classes: [...get().classes, carClass] });
    },

    updateClass: (classId, updates) => {
        const classes = get().classes.map(c =>
            c.id === classId ? { ...c, ...updates } : c
        );
        set({ classes });
    },

    removeClass: (classId) => {
        set({ classes: get().classes.filter(c => c.id !== classId) });
    },

    setParticipation: (participation) => set({ participation }),

    updateDriverParticipation: (driverId, updates) => {
        const participation = get().participation.map(p =>
            p.driverId === driverId ? { ...p, ...updates } : p
        );
        set({ participation });
    },

    setGrid: (grid) => set({ grid }),

    sortGrid: (by) => {
        const grid = [...get().grid];
        switch (by) {
            case 'qualifying':
                grid.sort((a, b) => (a.qualifyingTime || Infinity) - (b.qualifyingTime || Infinity));
                break;
            case 'irating':
                grid.sort((a, b) => (b.iRating || 0) - (a.iRating || 0));
                break;
            case 'car_number':
                grid.sort((a, b) => parseInt(a.carNumber) - parseInt(b.carNumber));
                break;
            case 'alphabetical':
                grid.sort((a, b) => a.driverName.localeCompare(b.driverName));
                break;
        }
        // Reassign positions
        grid.forEach((entry, index) => { entry.position = index + 1; });
        set({ grid });
    },

    moveDriverInGrid: (driverId, newPosition) => {
        const grid = [...get().grid];
        const currentIndex = grid.findIndex(e => e.driverId === driverId);
        if (currentIndex === -1) return;

        const [entry] = grid.splice(currentIndex, 1);
        grid.splice(newPosition - 1, 0, entry);
        grid.forEach((e, i) => { e.position = i + 1; });
        set({ grid });
    },

    getDriverById: (driverId) => get().drivers.find(d => d.id === driverId),

    getTeamById: (teamId) => get().teams.find(t => t.id === teamId),

    getDriversByTeam: (teamId) => get().drivers.filter(d => d.teamId === teamId),

    getDriversByClass: (className) => get().drivers.filter(d => d.carClass === className),
}));

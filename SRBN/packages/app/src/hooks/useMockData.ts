// =====================================================================
// useMockData Hook
// Initializes mock data for development
// =====================================================================

import { useEffect } from 'react';
import { useSessionStore } from '../stores/session.store';
import { useDriverStore } from '../stores/driver.store';
import { useBroadcastStore } from '../stores/broadcast.store';
import type { Driver, Session, CameraSuggestion } from '@broadcastbox/common';

// Mock drivers
const MOCK_DRIVERS: Driver[] = [
    {
        id: 'driver-1',
        name: 'Samuels',
        carNumber: '1',
        position: 1,
        gapAhead: null,
        gapBehind: 1.5,
        gapToLeader: 0,
        tireCompound: 'medium',
        tireLaps: 4,
        pitStatus: 'on_track',
        pitCount: 1,
        isInBattle: false,
        lastLapTime: 93540,
        bestLapTime: 92890,
    },
    {
        id: 'driver-2',
        name: 'Smith',
        carNumber: '9',
        position: 2,
        gapAhead: 1.5,
        gapBehind: 0.3,
        gapToLeader: 1.5,
        tireCompound: 'medium',
        tireLaps: 4,
        pitStatus: 'on_track',
        pitCount: 1,
        isInBattle: true,
        lastLapTime: 93720,
        bestLapTime: 93010,
    },
    {
        id: 'driver-3',
        name: 'Pérez',
        carNumber: '3',
        position: 3,
        gapAhead: 0.3,
        gapBehind: 1.2,
        gapToLeader: 1.8,
        tireCompound: 'medium',
        tireLaps: 11,
        pitStatus: 'on_track',
        pitCount: 0,
        isInBattle: true,
        lastLapTime: 93890,
        bestLapTime: 93120,
    },
    {
        id: 'driver-4',
        name: 'Higashi',
        carNumber: '4',
        position: 4,
        gapAhead: 1.2,
        gapBehind: 0.8,
        gapToLeader: 3.0,
        tireCompound: 'medium',
        tireLaps: 12,
        pitStatus: 'on_track',
        pitCount: 0,
        isInBattle: false,
        lastLapTime: 94010,
        bestLapTime: 93340,
    },
    {
        id: 'driver-5',
        name: 'Morrow',
        carNumber: '5',
        position: 5,
        gapAhead: 0.8,
        gapBehind: 1.5,
        gapToLeader: 3.8,
        tireCompound: 'medium',
        tireLaps: 13,
        pitStatus: 'on_track',
        pitCount: 0,
        isInBattle: false,
        lastLapTime: 94230,
        bestLapTime: 93560,
    },
    {
        id: 'driver-6',
        name: 'Carlsen',
        carNumber: '6',
        position: 6,
        gapAhead: 1.5,
        gapBehind: 0.4,
        gapToLeader: 5.3,
        tireCompound: 'medium',
        tireLaps: 18,
        pitStatus: 'on_track',
        pitCount: 1,
        isInBattle: false,
        lastLapTime: 94450,
        bestLapTime: 93780,
    },
    {
        id: 'driver-7',
        name: 'Wilson',
        carNumber: '11',
        position: 7,
        gapAhead: 0.4,
        gapBehind: 0.3,
        gapToLeader: 5.7,
        tireCompound: 'hard',
        tireLaps: 11,
        pitStatus: 'on_track',
        pitCount: 1,
        isInBattle: true,
        lastLapTime: 94520,
        bestLapTime: 93890,
    },
    {
        id: 'driver-8',
        name: 'Chen',
        carNumber: '10',
        position: 8,
        gapAhead: 0.3,
        gapBehind: 1.8,
        gapToLeader: 6.0,
        tireCompound: 'medium',
        tireLaps: 3,
        pitStatus: 'on_track',
        pitCount: 2,
        isInBattle: true,
        lastLapTime: 94680,
        bestLapTime: 94010,
    },
    {
        id: 'driver-9',
        name: 'Wimzel',
        carNumber: '11',
        position: 9,
        gapAhead: 1.8,
        gapBehind: 2.1,
        gapToLeader: 7.8,
        tireCompound: 'medium',
        tireLaps: 1,
        pitStatus: 'on_track',
        pitCount: 2,
        isInBattle: false,
        lastLapTime: 95120,
        bestLapTime: 94230,
    },
];

const MOCK_SESSION: Session = {
    id: '01A23-ZYV5B',
    trackName: 'Sebring',
    trackConfig: 'Sebring International Raceway',
    sessionType: 'race',
    state: 'CAUTION',
    flagStatus: 'yellow',
    currentLap: 7,
    totalLaps: 30,
    timeRemaining: 153000, // 2:33
    driverCount: 9,
};

export function useMockData() {
    const { setSession, setSessionState, setConnected } = useSessionStore();
    const { setDrivers, setBattles } = useDriverStore();
    const { addSuggestion } = useBroadcastStore();

    useEffect(() => {
        // Initialize mock data
        setSession(MOCK_SESSION);
        setSessionState('CAUTION');
        setConnected(true);
        setDrivers(MOCK_DRIVERS);

        // Set up battles
        setBattles([
            {
                driverA: MOCK_DRIVERS[1],
                driverB: MOCK_DRIVERS[2],
                gap: 0.3,
                positionFought: 2,
                duration: 45000,
                intensity: 'high',
            },
        ]);

        // Add a mock AI suggestion
        setTimeout(() => {
            addSuggestion({
                id: 'sug-1',
                type: 'battle',
                targetBattle: { driverA: 'driver-2', driverB: 'driver-3' },
                cameraMode: 'battle',
                reason: 'Battle for P2 - 0.3s gap',
                confidence: 87,
                priority: 'high',
                expiresAt: Date.now() + 30000,
                createdAt: Date.now(),
            });
        }, 2000);
    }, []);
}

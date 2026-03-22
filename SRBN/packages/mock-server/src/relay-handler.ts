// =====================================================================
// Relay Handler
// Processes incoming relay agent messages and updates state
// =====================================================================

import type { Socket } from 'socket.io';
import {
    RelayMessage,
    SessionMetadataMessage,
    RaceEventMessage,
    TelemetrySnapshotMessage,
    IncidentMessage,
    DriverUpdateMessage,
    isSessionMetadata,
    isRaceEvent,
    isTelemetry,
    isIncident,
    isDriverUpdate,
} from './relay-protocol';

interface Driver {
    id: string;
    name: string;
    carNumber: string;
    carName: string;
    teamName: string;
    irating: number;
    safetyRating: number;
    position: number;
    gapToLeader: number;
    gapAhead: number | null;
    trackPosition: number; // 0-1
    speed: number;
    throttle: number;
    brake: number;
    gear: number;
    rpm: number;
    lap: number;
    inPit: boolean;
    tireCompound: 'soft' | 'medium' | 'hard';
    tireLaps: number;
    pitCount: number;
}

interface Session {
    id: string;
    trackName: string;
    trackConfig?: string;
    category: string;
    flagState: string;
    currentLap: number;
    timeRemaining: number;
    sessionPhase: string;
    multiClass: boolean;
}

export class RelayHandler {
    private session: Session | null = null;
    private drivers: Map<string, Driver> = new Map();
    private broadcastSocket: Socket | null = null;
    private tireLapsMap: Map<string, number> = new Map();
    private pitCountMap: Map<string, number> = new Map();

    constructor(private io: any) { }

    /**
     * Set the broadcast socket for forwarding to frontend
     */
    setBroadcastSocket(socket: Socket) {
        this.broadcastSocket = socket;
    }

    /**
     * Handle incoming relay message
     */
    handleMessage(msg: RelayMessage): void {
        try {
            if (isSessionMetadata(msg)) {
                this.handleSessionMetadata(msg);
            } else if (isRaceEvent(msg)) {
                this.handleRaceEvent(msg);
            } else if (isTelemetry(msg)) {
                this.handleTelemetry(msg);
            } else if (isIncident(msg)) {
                this.handleIncident(msg);
            } else if (isDriverUpdate(msg)) {
                this.handleDriverUpdate(msg);
            } else {
                console.log('📨 Unknown message type:', msg.type);
            }
        } catch (error) {
            console.error('❌ Error handling relay message:', error);
        }
    }

    /**
     * Handle session metadata
     */
    private handleSessionMetadata(msg: SessionMetadataMessage): void {
        console.log(`📋 Session started: ${msg.trackName} [${msg.category}]`);

        this.session = {
            id: msg.sessionId,
            trackName: msg.trackName,
            trackConfig: msg.trackConfig,
            category: msg.category,
            flagState: 'green',
            currentLap: 0,
            timeRemaining: -1,
            sessionPhase: 'pre_race',
            multiClass: msg.multiClass,
        };

        this.drivers.clear();
        this.tireLapsMap.clear();
        this.pitCountMap.clear();

        // Broadcast to frontend
        this.io.emit('session:state', this.formatSessionForFrontend());
    }

    /**
     * Handle race event (flag changes, lap updates)
     */
    private handleRaceEvent(msg: RaceEventMessage): void {
        if (!this.session) return;

        const previousLap = this.session.currentLap;

        this.session.flagState = msg.flagState;
        this.session.currentLap = msg.lap;
        this.session.timeRemaining = msg.timeRemaining * 1000; // Convert to ms
        this.session.sessionPhase = msg.sessionPhase;

        // Increment tire laps on new lap
        if (msg.lap > previousLap) {
            for (const [driverId, tireLaps] of this.tireLapsMap) {
                this.tireLapsMap.set(driverId, tireLaps + 1);
            }
        }

        console.log(`🏁 Race event: ${msg.flagState} | Lap ${msg.lap} | ${msg.sessionPhase}`);

        // Broadcast to frontend
        this.io.emit('session:state', this.formatSessionForFrontend());
    }

    /**
     * Handle telemetry snapshot
     */
    private handleTelemetry(msg: TelemetrySnapshotMessage): void {
        if (!this.session) {
            // Create a placeholder session if we get telemetry before metadata
            this.session = {
                id: msg.sessionId,
                trackName: 'Unknown Track',
                category: 'unknown',
                flagState: 'green',
                currentLap: 0,
                timeRemaining: -1,
                sessionPhase: 'racing',
                multiClass: false,
            };
        }

        // Sort by position
        const sortedCars = [...msg.cars].sort((a, b) => (a.position || 999) - (b.position || 999));

        // Calculate gaps
        let leaderPos = 0;
        sortedCars.forEach((car, index) => {
            if (index === 0) {
                leaderPos = car.pos.s;
            }

            const driverId = car.driverId || `car-${car.carId}`;
            const existingDriver = this.drivers.get(driverId);

            // Detect pit entry/exit
            if (existingDriver && !existingDriver.inPit && car.inPit) {
                const pitCount = this.pitCountMap.get(driverId) || 0;
                this.pitCountMap.set(driverId, pitCount + 1);
                this.tireLapsMap.set(driverId, 0); // Reset tire laps
            }

            const driver: Driver = {
                id: driverId,
                name: car.driverName || existingDriver?.name || `Driver ${car.carId}`,
                carNumber: car.carNumber || String(car.carId),
                carName: existingDriver?.carName || 'Unknown',
                teamName: existingDriver?.teamName || '',
                irating: existingDriver?.irating || 0,
                safetyRating: existingDriver?.safetyRating || 0,
                position: car.position || index + 1,
                gapToLeader: this.calculateGap(car.pos.s, leaderPos),
                gapAhead: index === 0 ? null : this.calculateGap(car.pos.s, sortedCars[index - 1].pos.s),
                trackPosition: car.pos.s,
                speed: car.speed,
                throttle: car.throttle,
                brake: car.brake,
                gear: car.gear,
                rpm: car.rpm || 0,
                lap: car.lap,
                inPit: car.inPit,
                tireCompound: existingDriver?.tireCompound || 'medium',
                tireLaps: this.tireLapsMap.get(driverId) || 0,
                pitCount: this.pitCountMap.get(driverId) || 0,
            };

            this.drivers.set(driverId, driver);
        });

        // Broadcast to frontend
        this.io.emit('timing:update', {
            sessionId: this.session.id,
            entries: this.formatDriversForFrontend(),
            timestamp: msg.timestamp,
        });
    }

    /**
     * Handle incident
     */
    private handleIncident(msg: IncidentMessage): void {
        console.log(`🚨 Incident: ${msg.driverNames?.join(' vs ') || msg.cars.join(' vs ')} at corner ${msg.corner}`);

        // Broadcast to frontend
        this.io.emit('event:new', {
            id: `incident-${msg.timestamp}`,
            type: 'incident',
            priority: msg.severity === 'high' ? 'critical' : msg.severity === 'med' ? 'important' : 'attention',
            title: `Incident: ${msg.driverNames?.[0] || `Car ${msg.cars[0]}`}`,
            description: `${msg.cornerName || `Corner ${msg.corner}`} | Severity: ${msg.severity}`,
            timestamp: msg.timestamp,
        });

        // Also generate AI suggestion for incident coverage
        if (msg.severity !== 'low') {
            this.io.emit('suggestion:new', {
                id: `sug-incident-${msg.timestamp}`,
                type: 'incident',
                targetDriverId: msg.cars[0] ? `car-${msg.cars[0]}` : undefined,
                cameraMode: 'world',
                reason: `Incident at ${msg.cornerName || `T${msg.corner}`} - ${msg.severity} severity`,
                confidence: msg.severity === 'high' ? 95 : 75,
                priority: msg.severity === 'high' ? 'critical' : 'high',
                expiresAt: Date.now() + 30000,
                createdAt: Date.now(),
            });
        }
    }

    /**
     * Handle driver update (join/leave)
     */
    private handleDriverUpdate(msg: DriverUpdateMessage): void {
        console.log(`👤 Driver ${msg.action}: ${msg.driverName} (#${msg.carNumber})`);

        if (msg.action === 'join') {
            const driver: Driver = {
                id: msg.driverId,
                name: msg.driverName,
                carNumber: msg.carNumber,
                carName: msg.carName,
                teamName: msg.teamName || '',
                irating: msg.irating || 0,
                safetyRating: msg.safetyRating || 0,
                position: this.drivers.size + 1,
                gapToLeader: 0,
                gapAhead: null,
                trackPosition: 0,
                speed: 0,
                throttle: 0,
                brake: 0,
                gear: 0,
                rpm: 0,
                lap: 0,
                inPit: true,
                tireCompound: 'medium',
                tireLaps: 0,
                pitCount: 0,
            };
            this.drivers.set(msg.driverId, driver);
            this.tireLapsMap.set(msg.driverId, 0);
            this.pitCountMap.set(msg.driverId, 0);
        } else if (msg.action === 'leave') {
            this.drivers.delete(msg.driverId);
            this.tireLapsMap.delete(msg.driverId);
            this.pitCountMap.delete(msg.driverId);
        }

        // Broadcast driver list update
        this.io.emit('drivers:update', this.formatDriversForFrontend());
    }

    /**
     * Calculate gap between two track positions
     */
    private calculateGap(pos1: number, pos2: number): number {
        // This is a simplified gap calculation
        // In reality, would need lap times to calculate actual time gap
        const rawGap = Math.abs(pos1 - pos2);
        // Approximate: 1 lap ≈ 90 seconds, so gap = rawGap * 90
        return Math.round(rawGap * 90 * 10) / 10;
    }

    /**
     * Format session for frontend
     */
    private formatSessionForFrontend() {
        if (!this.session) return null;

        return {
            id: this.session.id,
            trackName: this.session.trackName,
            trackConfig: this.session.trackConfig,
            sessionType: 'race',
            state: this.mapFlagToState(this.session.flagState),
            flagStatus: this.session.flagState,
            currentLap: this.session.currentLap,
            totalLaps: 0, // Unknown from relay
            timeRemaining: this.session.timeRemaining,
            driverCount: this.drivers.size,
        };
    }

    /**
     * Format drivers for frontend
     */
    private formatDriversForFrontend() {
        return Array.from(this.drivers.values())
            .sort((a, b) => a.position - b.position)
            .map(driver => ({
                id: driver.id,
                name: driver.name,
                driverId: driver.id,
                driverName: driver.name,
                carNumber: driver.carNumber,
                teamName: driver.teamName,
                irating: driver.irating,
                safetyRating: driver.safetyRating,
                position: driver.position,
                gapToLeader: driver.gapToLeader,
                gapAhead: driver.gapAhead,
                tireCompound: driver.tireCompound,
                tireLaps: driver.tireLaps,
                pitCount: driver.pitCount,
                isInPit: driver.inPit,
                pitStatus: driver.inPit ? 'in_pit' : 'on_track',
                isInBattle: Math.abs(driver.gapAhead || 999) < 1.5,
                gapBehind: null,
                lastLapTime: null,
                bestLapTime: null,
                speed: driver.speed,
                throttle: driver.throttle,
                brake: driver.brake,
                gear: driver.gear,
                rpm: driver.rpm,
            }));
    }

    /**
     * Map flag state to session state
     */
    private mapFlagToState(flagState: string): string {
        switch (flagState) {
            case 'green': return 'RACE_GREEN';
            case 'yellow':
            case 'caution':
            case 'localYellow': return 'CAUTION';
            case 'restart': return 'RESTART';
            case 'red': return 'RED_FLAG';
            case 'checkered': return 'FINISH';
            case 'white': return 'FINAL_LAPS';
            default: return 'RACE_GREEN';
        }
    }

    /**
     * Get current state (for new connections)
     */
    getCurrentState() {
        return {
            session: this.formatSessionForFrontend(),
            drivers: this.formatDriversForFrontend(),
        };
    }
}

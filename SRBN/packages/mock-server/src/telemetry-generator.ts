// =====================================================================
// Telemetry Generator
// Simulates realistic race telemetry for development
// =====================================================================

interface MockDriver {
    id: string;
    name: string;
    carNumber: string;
    position: number;
    lapDistPct: number;
    gapToLeader: number;
    tireCompound: 'soft' | 'medium' | 'hard';
    tireLaps: number;
    pitCount: number;
    isInPit: boolean;
    speed: number; // m/s
}

interface MockSession {
    id: string;
    trackName: string;
    trackConfig: string;
    sessionType: 'practice' | 'qualifying' | 'race';
    state: string;
    flagStatus: 'green' | 'yellow' | 'red' | 'checkered';
    currentLap: number;
    totalLaps: number;
    timeRemaining: number;
}

const DRIVER_NAMES = [
    'Samuels', 'Smith', 'Pérez', 'Higashi', 'Morrow',
    'Carlsen', 'Wilson', 'Chen', 'Wimzel', 'Garcia',
    'Thompson', 'Martinez', 'Anderson', 'Taylor', 'Brown',
];

export class TelemetryGenerator {
    private session: MockSession;
    private drivers: MockDriver[];
    private tickCount: number = 0;

    constructor() {
        // Initialize session
        this.session = {
            id: '01A23-ZYV5B',
            trackName: 'Sebring',
            trackConfig: 'Sebring International Raceway',
            sessionType: 'race',
            state: 'RACE_GREEN',
            flagStatus: 'green',
            currentLap: 7,
            totalLaps: 30,
            timeRemaining: 153000,
        };

        // Initialize drivers
        this.drivers = DRIVER_NAMES.slice(0, 12).map((name, i) => ({
            id: `driver-${i + 1}`,
            name,
            carNumber: String(i + 1),
            position: i + 1,
            lapDistPct: (1 - (i * 0.03)) % 1,
            gapToLeader: i * 1.2,
            tireCompound: i % 3 === 0 ? 'soft' : i % 3 === 1 ? 'medium' : 'hard',
            tireLaps: Math.floor(Math.random() * 15) + 1,
            pitCount: Math.floor(i / 4),
            isInPit: false,
            speed: 50 + Math.random() * 10,
        }));
    }

    tick(): void {
        this.tickCount++;

        // Update driver positions around track
        this.drivers.forEach((driver, i) => {
            // Simulate lap progress
            const baseSpeed = 0.01 - (i * 0.0002);
            driver.lapDistPct = (driver.lapDistPct + baseSpeed + Math.random() * 0.002) % 1;

            // Update speed (with some variation)
            driver.speed = 45 + Math.random() * 20;

            // Increment tire laps on crossing start/finish
            if (driver.lapDistPct < 0.01 && this.tickCount % 40 === 0) {
                driver.tireLaps++;
            }
        });

        // Sort by lap distance to update positions
        const sorted = [...this.drivers].sort((a, b) => {
            // Compare by lap completion
            return b.lapDistPct - a.lapDistPct;
        });

        // Update positions and gaps
        sorted.forEach((driver, i) => {
            driver.position = i + 1;
            driver.gapToLeader = i === 0 ? 0 : sorted[0].lapDistPct - driver.lapDistPct;
        });

        // Occasional random events
        if (this.tickCount % 100 === 0) {
            // Random pit stop
            const randomDriver = this.drivers[Math.floor(Math.random() * this.drivers.length)];
            if (!randomDriver.isInPit && randomDriver.tireLaps > 10) {
                randomDriver.isInPit = true;
                randomDriver.pitCount++;
                setTimeout(() => {
                    randomDriver.isInPit = false;
                    randomDriver.tireLaps = 0;
                    randomDriver.tireCompound = 'medium';
                }, 5000);
            }
        }

        // Update session time
        this.session.timeRemaining = Math.max(0, this.session.timeRemaining - 500);

        // Lap increment
        if (this.tickCount % 80 === 0) {
            this.session.currentLap = Math.min(this.session.currentLap + 1, this.session.totalLaps);
        }
    }

    getSession(): MockSession {
        return { ...this.session };
    }

    getDrivers(): MockDriver[] {
        return this.drivers.map(d => ({ ...d }));
    }

    getDriverCount(): number {
        return this.drivers.length;
    }

    getSessionState(): string {
        return this.session.state;
    }

    getTimingEntries() {
        return this.drivers.map(d => ({
            driverId: d.id,
            driverName: d.name,
            carNumber: d.carNumber,
            position: d.position,
            gapToLeader: d.gapToLeader,
            gapAhead: d.position === 1 ? null : d.gapToLeader - (this.drivers[d.position - 2]?.gapToLeader ?? 0),
            tireCompound: d.tireCompound,
            tireLaps: d.tireLaps,
            pitCount: d.pitCount,
            isInPit: d.isInPit,
        }));
    }

    setSessionState(state: string) {
        this.session.state = state;
        if (state === 'CAUTION') {
            this.session.flagStatus = 'yellow';
        } else if (state === 'RACE_GREEN') {
            this.session.flagStatus = 'green';
        }
    }
}

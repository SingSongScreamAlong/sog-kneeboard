// =====================================================================
// Event Generator
// Generates race events and AI camera suggestions
// =====================================================================

interface RaceEvent {
    id: string;
    type: string;
    priority: 'info' | 'attention' | 'important' | 'critical';
    title: string;
    description?: string;
    driverIds?: string[];
    timestamp: number;
}

interface CameraSuggestion {
    id: string;
    type: 'driver' | 'battle' | 'incident' | 'pit_activity' | 'leader';
    targetDriverId?: string;
    targetBattle?: { driverA: string; driverB: string };
    cameraMode: 'world' | 'onboard' | 'battle';
    reason: string;
    confidence: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    expiresAt: number;
    createdAt: number;
}

interface MockDriver {
    id: string;
    name: string;
    position: number;
    gapToLeader: number;
    isInPit: boolean;
}

const EVENT_TYPES = [
    { type: 'pit_window_open', title: 'Pit Window Open', priority: 'attention' as const },
    { type: 'tire_cliff', title: 'Tire Cliff Approaching', priority: 'important' as const },
    { type: 'battle_forming', title: 'Battle Forming', priority: 'attention' as const },
    { type: 'fuel_marginal', title: 'Fuel Marginal', priority: 'important' as const },
    { type: 'fastest_lap', title: 'Fastest Lap', priority: 'info' as const },
];

export class EventGenerator {
    private eventCounter: number = 0;
    private suggestionCounter: number = 0;
    private suggestions: CameraSuggestion[] = [];

    generateRandomEvent(): RaceEvent | null {
        // 30% chance to generate an event
        if (Math.random() > 0.3) return null;

        const template = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
        this.eventCounter++;

        return {
            id: `event-${this.eventCounter}`,
            type: template.type,
            priority: template.priority,
            title: template.title,
            description: this.generateDescription(template.type),
            timestamp: Date.now(),
        };
    }

    generateDescription(type: string): string {
        switch (type) {
            case 'pit_window_open':
                return `ETA ~${Math.floor(Math.random() * 5) + 1} Laps`;
            case 'tire_cliff':
                return `P${Math.floor(Math.random() * 5) + 1} soft tires degrading`;
            case 'battle_forming':
                return `P${Math.floor(Math.random() * 8) + 1}-P${Math.floor(Math.random() * 8) + 2}`;
            case 'fuel_marginal':
                return `P${Math.floor(Math.random() * 5) + 1} may need to save`;
            case 'fastest_lap':
                return `1:${32 + Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
            default:
                return '';
        }
    }

    generateCameraSuggestion(drivers: MockDriver[]): CameraSuggestion | null {
        // 40% chance to generate a suggestion
        if (Math.random() > 0.4) return null;

        this.suggestionCounter++;
        const suggestionTypes = ['battle', 'driver', 'pit_activity', 'leader'] as const;
        const type = suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)];

        const now = Date.now();
        let suggestion: CameraSuggestion;

        switch (type) {
            case 'battle': {
                const pos = Math.floor(Math.random() * (drivers.length - 1));
                const driverA = drivers[pos];
                const driverB = drivers[pos + 1];
                if (!driverA || !driverB) return null;

                suggestion = {
                    id: `sug-${this.suggestionCounter}`,
                    type: 'battle',
                    targetBattle: { driverA: driverA.id, driverB: driverB.id },
                    cameraMode: 'battle',
                    reason: `Battle for P${pos + 1} - ${driverA.name} vs ${driverB.name}`,
                    confidence: 70 + Math.floor(Math.random() * 25),
                    priority: 'high',
                    expiresAt: now + 30000,
                    createdAt: now,
                };
                break;
            }
            case 'pit_activity': {
                const pittingDriver = drivers.find(d => d.isInPit);
                if (!pittingDriver) return null;

                suggestion = {
                    id: `sug-${this.suggestionCounter}`,
                    type: 'pit_activity',
                    targetDriverId: pittingDriver.id,
                    cameraMode: 'onboard',
                    reason: `${pittingDriver.name} pit stop in progress`,
                    confidence: 85 + Math.floor(Math.random() * 10),
                    priority: 'medium',
                    expiresAt: now + 20000,
                    createdAt: now,
                };
                break;
            }
            case 'leader': {
                const leader = drivers.find(d => d.position === 1);
                if (!leader) return null;

                suggestion = {
                    id: `sug-${this.suggestionCounter}`,
                    type: 'leader',
                    targetDriverId: leader.id,
                    cameraMode: 'onboard',
                    reason: `Leader ${leader.name} - check in`,
                    confidence: 50 + Math.floor(Math.random() * 20),
                    priority: 'low',
                    expiresAt: now + 15000,
                    createdAt: now,
                };
                break;
            }
            default: {
                const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
                if (!randomDriver) return null;

                suggestion = {
                    id: `sug-${this.suggestionCounter}`,
                    type: 'driver',
                    targetDriverId: randomDriver.id,
                    cameraMode: 'onboard',
                    reason: `${randomDriver.name} making progress`,
                    confidence: 40 + Math.floor(Math.random() * 30),
                    priority: 'low',
                    expiresAt: now + 15000,
                    createdAt: now,
                };
            }
        }

        // Keep last 5 suggestions
        this.suggestions = [...this.suggestions, suggestion].slice(-5);
        return suggestion;
    }

    getSuggestions(): CameraSuggestion[] {
        const now = Date.now();
        // Filter out expired suggestions
        this.suggestions = this.suggestions.filter(s => s.expiresAt > now);
        return this.suggestions;
    }
}

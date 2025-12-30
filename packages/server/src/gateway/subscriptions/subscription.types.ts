// =====================================================================
// Subscription Types (Week 2)
// Server-side subscription model for rate-limited telemetry delivery.
// =====================================================================

/**
 * Role-based rate limits (Hz)
 */
export type TelemetryRole = 'driver' | 'team' | 'race_control' | 'broadcast';
export type Surface = 'blackbox' | 'controlbox' | 'racebox';

/**
 * Baseline rates per role (Hz)
 */
export const BASELINE_RATES: Record<TelemetryRole, number> = {
    driver: 60,
    team: 20,
    race_control: 10,
    broadcast: 5,
};

/**
 * Burst max rates per role (Hz)
 */
export const BURST_MAX_RATES: Record<TelemetryRole, number> = {
    driver: 60,  // Already at max
    team: 30,
    race_control: 30,
    broadcast: 20,
};

/**
 * Burst configuration
 */
export const BURST_CONFIG = {
    maxDurationMs: 30_000,
    cooldownMs: 10_000,
    maxConcurrentBurstsPerSocket: 3,
};

/**
 * Burst trigger types
 */
export type BurstTrigger =
    | 'incident_involvement'
    | 'incident_proximity'
    | 'battle_featured'
    | 'steward_focus'
    | 'director_focus';

/**
 * Which roles can use which triggers
 */
export const TRIGGER_ALLOWED_ROLES: Record<BurstTrigger, TelemetryRole[]> = {
    incident_involvement: ['team', 'race_control'],
    incident_proximity: ['race_control'],
    battle_featured: ['team', 'broadcast'],
    steward_focus: ['race_control'],
    director_focus: ['broadcast'],
};

/**
 * Active subscription for a socket
 */
export interface ActiveSubscription {
    id: string;
    socketId: string;
    sessionId: string;
    driverId: string | null;  // null = all drivers in session
    event: 'telemetry:frame' | 'telemetry:timing';
    requestedRateHz: number;
    actualRateHz: number;
    role: TelemetryRole;
    surface: Surface;
    isBurst: boolean;
    expiresAtMs: number | null;  // null = no expiration (baseline)
    createdAtMs: number;
    lastEmitMs: number;
    frameCount: number;
}

/**
 * Burst cooldown state per driver per socket
 */
export interface BurstCooldown {
    socketId: string;
    driverId: string;
    cooldownUntilMs: number;
}

/**
 * Fat frame request state
 */
export interface FatFrameGrant {
    socketId: string;
    sessionId: string;
    driverId: string;
    grantedAtMs: number;
    rateHz: number;  // Capped at 10 Hz for fat frames
}

// =====================================================================
// Socket Event Payloads
// =====================================================================

/**
 * C → S: Request a subscription
 */
export interface SubscriptionRequestPayload {
    sessionId: string;
    event: 'telemetry:frame' | 'telemetry:timing';
    driverId?: string;  // Optional: subscribe to specific driver
    requestedRateHz: number;
}

/**
 * C → S: Request burst escalation
 */
export interface SubscriptionEscalatePayload {
    sessionId: string;
    driverId: string;
    trigger: BurstTrigger;
    requestedRateHz: number;
    durationMs: number;
}

/**
 * C → S: Request fat frames for a driver
 */
export interface SubscriptionRequestFatPayload {
    sessionId: string;
    driverId: string;
}

/**
 * S → C: Subscription granted
 */
export interface SubscriptionGrantedPayload {
    event: 'telemetry:frame' | 'telemetry:timing';
    driverId: string | null;
    actualRateHz: number;
    expiresAtMs: number | null;
}

/**
 * S → C: Subscription denied
 */
export interface SubscriptionDeniedPayload {
    event: 'telemetry:frame' | 'telemetry:timing';
    driverId: string | null;
    reason: string;
}

/**
 * S → C: Fat frame granted
 */
export interface FatGrantedPayload {
    driverId: string;
    actualRateHz: number;
}

/**
 * S → C: Fat frame denied
 */
export interface FatDeniedPayload {
    driverId: string;
    reason: string;
}

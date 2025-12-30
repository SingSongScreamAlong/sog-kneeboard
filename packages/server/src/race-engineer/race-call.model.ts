// =====================================================================
// Race Call Model (Week 15)
// Canonical model for all race engineer communications.
// =====================================================================

// =====================================================================
// Core Types
// =====================================================================

/**
 * Call kind: what domain does this call address?
 */
export type RaceCallKind = 'execution' | 'context';

/**
 * Call severity: how important is this call?
 */
export type RaceCallSeverity = 'info' | 'warn' | 'caution' | 'critical';

/**
 * Delivery channel: where should this call appear?
 */
export type RaceCallChannel = 'ui' | 'voice' | 'both';

/**
 * Call source: what subsystem generated this call?
 */
export type RaceCallSource =
    | 'telemetry'
    | 'strategy'
    | 'incident'
    | 'field_model'
    | 'steward'
    | 'director'
    | 'system';

// =====================================================================
// Race Call
// =====================================================================

export interface RaceCall {
    id: string;
    sessionId: string;
    driverId: string;

    // Classification
    kind: RaceCallKind;
    severity: RaceCallSeverity;
    channel: RaceCallChannel;
    source: RaceCallSource;

    // Confidence (0.0 - 1.0)
    confidence: number;

    // Content
    message: string;
    voiceText?: string;  // Shorter version for TTS

    // Timing
    createdAt: number;
    expiresAt: number | null;  // null = no expiry

    // Lifecycle
    status: 'pending' | 'delivered' | 'expired' | 'suppressed';
    deliveredAt?: number;

    // Escalation tracking
    escalatedFrom?: string;  // Previous call ID
    escalationLevel: number;  // 0 = original, 1+ = escalated

    // Metadata
    metadata?: Record<string, unknown>;
}

// =====================================================================
// Confidence Scoring
// =====================================================================

export interface ConfidenceFactors {
    signalStrength: number;      // 0-1: magnitude of the signal
    signalAgreement: number;     // 0-1: multiple subsystems agree
    temporalStability: number;   // 0-1: persisting vs transient
    contextImportance: number;   // 0-1: race state relevance
}

/**
 * Calculate confidence score from factors.
 */
export function calculateConfidence(factors: ConfidenceFactors): number {
    // Weighted average
    const weights = {
        signalStrength: 0.35,
        signalAgreement: 0.25,
        temporalStability: 0.20,
        contextImportance: 0.20,
    };

    const score =
        factors.signalStrength * weights.signalStrength +
        factors.signalAgreement * weights.signalAgreement +
        factors.temporalStability * weights.temporalStability +
        factors.contextImportance * weights.contextImportance;

    return Math.max(0, Math.min(1, score));
}

/**
 * Confidence interpretation.
 */
export type ConfidenceLevel = 'weak' | 'moderate' | 'strong' | 'high';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence < 0.3) return 'weak';
    if (confidence < 0.6) return 'moderate';
    if (confidence < 0.85) return 'strong';
    return 'high';
}

/**
 * Allowed severities by confidence level.
 */
export const CONFIDENCE_SEVERITY_MATRIX: Record<ConfidenceLevel, RaceCallSeverity[]> = {
    weak: ['info'],  // UI only, never voiced
    moderate: ['info', 'warn'],
    strong: ['warn', 'caution'],
    high: ['caution', 'critical'],
};

/**
 * Check if severity is allowed for confidence level.
 */
export function isSeverityAllowed(confidence: number, severity: RaceCallSeverity): boolean {
    const level = getConfidenceLevel(confidence);
    return CONFIDENCE_SEVERITY_MATRIX[level].includes(severity);
}

// =====================================================================
// Channel Selection
// =====================================================================

/**
 * Determine delivery channel based on severity and confidence.
 */
export function selectChannel(
    severity: RaceCallSeverity,
    confidence: number,
    driverWorkload: 'low' | 'medium' | 'high'
): RaceCallChannel {
    // Critical always gets voice
    if (severity === 'critical' && confidence >= 0.85) {
        return 'both';
    }

    // Weak confidence = UI only
    if (confidence < 0.3) {
        return 'ui';
    }

    // High workload suppresses voice for non-critical
    if (driverWorkload === 'high' && severity !== 'critical') {
        return confidence >= 0.6 ? 'ui' : 'ui';
    }

    // Moderate confidence + medium workload = UI only
    if (confidence < 0.5 && driverWorkload === 'medium') {
        return 'ui';
    }

    // Caution and above gets voice
    if (severity === 'caution' && confidence >= 0.6) {
        return 'both';
    }

    // Warn with strong confidence gets voice
    if (severity === 'warn' && confidence >= 0.7) {
        return 'both';
    }

    // Default to UI only
    return 'ui';
}

// =====================================================================
// Call Expiration
// =====================================================================

/**
 * Default expiration times by severity (ms).
 */
export const CALL_EXPIRATION_MS: Record<RaceCallSeverity, number> = {
    info: 10000,      // 10 seconds
    warn: 15000,      // 15 seconds
    caution: 20000,   // 20 seconds
    critical: 30000,  // 30 seconds (stays longer)
};

/**
 * Calculate expiration timestamp.
 */
export function calculateExpiration(severity: RaceCallSeverity, createdAt: number): number {
    return createdAt + CALL_EXPIRATION_MS[severity];
}

// =====================================================================
// Voice Text Generation
// =====================================================================

/**
 * Maximum voice text length by severity.
 */
export const MAX_VOICE_LENGTH: Record<RaceCallSeverity, number> = {
    info: 40,
    warn: 50,
    caution: 60,
    critical: 30,  // Critical must be SHORT
};

/**
 * Truncate message for voice delivery.
 */
export function generateVoiceText(message: string, severity: RaceCallSeverity): string {
    const maxLen = MAX_VOICE_LENGTH[severity];
    if (message.length <= maxLen) return message;

    // Try to truncate at word boundary
    const truncated = message.substring(0, maxLen);
    const lastSpace = truncated.lastIndexOf(' ');

    return lastSpace > maxLen * 0.7
        ? truncated.substring(0, lastSpace)
        : truncated;
}

// =====================================================================
// Banned Phrases
// =====================================================================

export const BANNED_PHRASES = [
    'you should',
    'you need to',
    'try to',
    'consider',
    'i suggest',
    'i recommend',
    'improvement',
    'lesson',
    'training',
    'coaching',
    'next time',
    'you could have',
    'better if',
];

/**
 * Check if message contains banned instructional language.
 */
export function containsBannedPhrases(message: string): boolean {
    const lower = message.toLowerCase();
    return BANNED_PHRASES.some(phrase => lower.includes(phrase));
}

// =====================================================================
// Factory
// =====================================================================

let callIdCounter = 0;

export function createRaceCall(
    params: Omit<RaceCall, 'id' | 'status' | 'escalationLevel' | 'createdAt' | 'expiresAt'>
): RaceCall {
    const createdAt = Date.now();

    return {
        ...params,
        id: `call-${createdAt}-${++callIdCounter}`,
        status: 'pending',
        escalationLevel: params.escalatedFrom ? 1 : 0,
        createdAt,
        expiresAt: calculateExpiration(params.severity, createdAt),
    };
}

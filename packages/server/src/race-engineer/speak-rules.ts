// =====================================================================
// Speak/Silence Rules (Week 15)
// Controls when the Race Engineer speaks vs stays silent.
// =====================================================================

import type { RaceCall, RaceCallSeverity, RaceCallKind } from './race-call.model.js';

// =====================================================================
// Types
// =====================================================================

export interface SpeakDecision {
    shouldSpeak: boolean;
    reason: string;
    channel: 'voice' | 'ui' | 'suppress';
    delay?: number;  // Delay before speaking (ms)
}

export interface DriverWorkloadState {
    level: 'low' | 'medium' | 'high';
    cornerPhase: 'straight' | 'braking' | 'apex' | 'exit';
    recentCalls: number;  // Calls in last 30 seconds
}

export interface CallHistory {
    recentCalls: RaceCall[];
    lastVoicedAt: number | null;
    falsePositives: number;  // In last 5 minutes
    ignoredCalls: number;    // Driver-dismissed calls
}

// =====================================================================
// Cooldown Rules
// =====================================================================

/**
 * Minimum seconds between voiced calls, by severity.
 */
export const VOICE_COOLDOWNS: Record<RaceCallSeverity, number> = {
    info: 30,      // 30s between info voices (rare anyway)
    warn: 15,      // 15s between warnings
    caution: 10,   // 10s between cautions
    critical: 0,   // Critical always speaks immediately
};

/**
 * Maximum voiced calls per minute.
 */
export const MAX_VOICED_PER_MINUTE = 4;

/**
 * Mandatory silence after false positive (seconds).
 */
export const FALSE_POSITIVE_SILENCE_SEC = 60;

// =====================================================================
// Speak Decision Logic
// =====================================================================

/**
 * Determine if a call should be voiced, shown on UI, or suppressed.
 */
export function decideSpeakBehavior(
    call: RaceCall,
    workload: DriverWorkloadState,
    history: CallHistory,
    verbosity: 'minimal' | 'normal' | 'high' = 'normal'
): SpeakDecision {
    const now = Date.now();

    // Rule 1: Critical calls ALWAYS speak (unless confidence is terrible)
    if (call.severity === 'critical' && call.confidence >= 0.85) {
        return { shouldSpeak: true, reason: 'Critical call', channel: 'voice' };
    }

    // Rule 2: Confidence below 0.3 = never voice
    if (call.confidence < 0.3) {
        return { shouldSpeak: false, reason: 'Weak confidence', channel: 'suppress' };
    }

    // Rule 3: False positive penalty
    if (history.falsePositives >= 2) {
        if (call.severity !== 'critical') {
            return { shouldSpeak: false, reason: 'False positive cooldown', channel: 'ui' };
        }
    }

    // Rule 4: Rate limit check
    const recentVoiced = history.recentCalls.filter(
        c => c.channel === 'voice' || c.channel === 'both'
    ).length;

    if (recentVoiced >= MAX_VOICED_PER_MINUTE && call.severity !== 'critical') {
        return { shouldSpeak: false, reason: 'Rate limit', channel: 'ui' };
    }

    // Rule 5: Cooldown check
    if (history.lastVoicedAt) {
        const cooldown = VOICE_COOLDOWNS[call.severity] * 1000;
        if (now - history.lastVoicedAt < cooldown && call.severity !== 'critical') {
            return { shouldSpeak: false, reason: 'Cooldown active', channel: 'ui' };
        }
    }

    // Rule 6: Workload-based suppression
    if (workload.level === 'high') {
        if (call.confidence < 0.7) {
            return { shouldSpeak: false, reason: 'High workload + moderate confidence', channel: 'ui' };
        }
        if (call.severity === 'info') {
            return { shouldSpeak: false, reason: 'High workload suppresses info', channel: 'ui' };
        }
        // Delay non-critical during corner
        if (workload.cornerPhase !== 'straight' && call.severity !== 'critical') {
            return {
                shouldSpeak: true,
                reason: 'Delayed for corner exit',
                channel: 'voice',
                delay: estimateCornerExitMs(workload.cornerPhase),
            };
        }
    }

    // Rule 7: Verbosity preference
    if (verbosity === 'minimal') {
        if (call.severity === 'info' || call.severity === 'warn') {
            return { shouldSpeak: false, reason: 'Minimal verbosity', channel: 'ui' };
        }
    }

    // Rule 8: Ignored calls penalty
    if (history.ignoredCalls >= 3 && call.severity !== 'critical') {
        return { shouldSpeak: false, reason: 'Driver ignoring calls', channel: 'ui' };
    }

    // Rule 9: Duplicate suppression
    const isDuplicate = history.recentCalls.some(
        c => c.message === call.message && now - c.createdAt < 60000
    );
    if (isDuplicate) {
        return { shouldSpeak: false, reason: 'Duplicate call', channel: 'suppress' };
    }

    // Default: Speak based on severity
    if (call.severity === 'caution' && call.confidence >= 0.6) {
        return { shouldSpeak: true, reason: 'Caution with strong confidence', channel: 'voice' };
    }

    if (call.severity === 'warn' && call.confidence >= 0.7) {
        return { shouldSpeak: true, reason: 'Warning with strong confidence', channel: 'voice' };
    }

    // Info calls rarely get voice
    if (call.severity === 'info') {
        return { shouldSpeak: false, reason: 'Info is UI-only', channel: 'ui' };
    }

    return { shouldSpeak: false, reason: 'Default to UI', channel: 'ui' };
}

// =====================================================================
// Helper Functions
// =====================================================================

function estimateCornerExitMs(phase: string): number {
    switch (phase) {
        case 'braking': return 3000;
        case 'apex': return 2000;
        case 'exit': return 1000;
        default: return 0;
    }
}

// =====================================================================
// Trust Preservation Rules
// =====================================================================

export const TRUST_RULES = {
    // Being quiet is preferable to being wrong
    principleOfRestraint: true,

    // Maximum voiced calls per minute
    maxVoicedPerMinute: 4,

    // After a false positive, be silent for this long
    falsePositiveSilenceMs: 60000,

    // If driver ignores N calls, stop voicing non-critical
    ignoredCallThreshold: 3,

    // Repeated low-confidence calls get penalized
    lowConfidencePenalty: 0.1,  // Reduce future confidence by this

    // Minimum confidence to ever voice
    minVoiceConfidence: 0.5,

    // Silence is the default state
    defaultBehavior: 'silent' as const,
};

// =====================================================================
// Escalation Rules
// =====================================================================

/**
 * Check if call should be promoted to higher severity.
 */
export function shouldEscalate(
    call: RaceCall,
    durationSinceCreation: number,
    conditionIntensifying: boolean
): { escalate: boolean; newSeverity: RaceCallSeverity | null } {
    // Can't escalate critical
    if (call.severity === 'critical') {
        return { escalate: false, newSeverity: null };
    }

    // Must have been active for at least 5 seconds
    if (durationSinceCreation < 5000) {
        return { escalate: false, newSeverity: null };
    }

    // Condition must be intensifying
    if (!conditionIntensifying) {
        return { escalate: false, newSeverity: null };
    }

    // Determine new severity
    const escalationMap: Record<RaceCallSeverity, RaceCallSeverity> = {
        info: 'warn',
        warn: 'caution',
        caution: 'critical',
        critical: 'critical',
    };

    return {
        escalate: true,
        newSeverity: escalationMap[call.severity],
    };
}

/**
 * Check if call should be demoted or expire.
 */
export function shouldDemote(
    call: RaceCall,
    conditionResolved: boolean
): { demote: boolean; newSeverity: RaceCallSeverity | null; expire: boolean } {
    if (conditionResolved) {
        return { demote: false, newSeverity: null, expire: true };
    }

    // Demote after natural cooldown if not escalating
    const demotionMap: Record<RaceCallSeverity, RaceCallSeverity | null> = {
        critical: 'caution',
        caution: 'warn',
        warn: 'info',
        info: null,  // Info expires, doesn't demote
    };

    return {
        demote: true,
        newSeverity: demotionMap[call.severity],
        expire: demotionMap[call.severity] === null,
    };
}

// =====================================================================
// Adaptation Safeguards (Week 17)
// Hard limits to ensure safety and fairness.
// =====================================================================

import type { RaceCall } from '../race-engineer/race-call.model.js';
import type { EngineerMemory } from './memory.model.js';

// =====================================================================
// Core Principle
// =====================================================================

export const SAFEGUARD_PRINCIPLE =
    'Memory may reduce noise, but never suppress safety.';

// =====================================================================
// Safeguard Rules
// =====================================================================

export const SAFEGUARDS = {
    // Critical calls ALWAYS bypass memory
    criticalBypassesMemory: true,

    // Minimum calls per session (ensures some presence)
    minCallsPerSession: 3,

    // Max suppression rate from adaptation (e.g., 40%)
    maxSuppressionRate: 0.4,

    // Caution calls have limited suppression
    cautionMaxSuppression: 0.2,

    // Hard reset always available
    hardResetAvailable: true,

    // Memory changes are logged for auditability
    logAllChanges: true,
};

// =====================================================================
// Safeguard Checks
// =====================================================================

/**
 * Check if a call can be suppressed by memory.
 */
export function canMemorySuppress(
    call: RaceCall,
    sessionCallCount: number,
    sessionSuppressedCount: number
): { allowed: boolean; reason: string } {
    // Rule 1: Critical never suppressed
    if (call.severity === 'critical') {
        return {
            allowed: false,
            reason: 'Critical calls bypass memory suppression',
        };
    }

    // Rule 2: Caution has limited suppression
    if (call.severity === 'caution') {
        const cautionSuppressionRate = sessionSuppressedCount / (sessionCallCount + 1);
        if (cautionSuppressionRate >= SAFEGUARDS.cautionMaxSuppression) {
            return {
                allowed: false,
                reason: 'Caution suppression limit reached',
            };
        }
    }

    // Rule 3: Max suppression rate
    if (sessionCallCount > 0) {
        const suppressionRate = sessionSuppressedCount / sessionCallCount;
        if (suppressionRate >= SAFEGUARDS.maxSuppressionRate) {
            return {
                allowed: false,
                reason: `Max suppression rate (${SAFEGUARDS.maxSuppressionRate * 100}%) reached`,
            };
        }
    }

    // Rule 4: Minimum calls per session
    const effectiveDelivered = sessionCallCount - sessionSuppressedCount;
    if (effectiveDelivered < SAFEGUARDS.minCallsPerSession) {
        return {
            allowed: false,
            reason: `Minimum calls per session (${SAFEGUARDS.minCallsPerSession}) not met`,
        };
    }

    return { allowed: true, reason: 'Suppression allowed' };
}

/**
 * Validate memory state is within bounds.
 */
export function validateMemoryBounds(memory: EngineerMemory): {
    valid: boolean;
    issues: string[];
} {
    const issues: string[] = [];

    // Check tolerances
    if (memory.executionCallTolerance < 0.2) {
        issues.push('Execution tolerance below minimum (0.2)');
    }
    if (memory.contextCallTolerance < 0.2) {
        issues.push('Context tolerance below minimum (0.2)');
    }
    if (memory.executionCallTolerance > 1.0) {
        issues.push('Execution tolerance above maximum (1.0)');
    }
    if (memory.contextCallTolerance > 1.0) {
        issues.push('Context tolerance above maximum (1.0)');
    }

    // Check pattern counts
    if (memory.ignoredCallPatterns.length > 100) {
        issues.push('Too many ignored patterns (max 100)');
    }
    if (memory.trustedCallPatterns.length > 100) {
        issues.push('Too many trusted patterns (max 100)');
    }

    return {
        valid: issues.length === 0,
        issues,
    };
}

/**
 * Repair memory to be within bounds.
 */
export function repairMemoryBounds(memory: EngineerMemory): EngineerMemory {
    // Clamp tolerances
    memory.executionCallTolerance = Math.max(0.2, Math.min(1.0, memory.executionCallTolerance));
    memory.contextCallTolerance = Math.max(0.2, Math.min(1.0, memory.contextCallTolerance));

    // Trim patterns
    if (memory.ignoredCallPatterns.length > 20) {
        memory.ignoredCallPatterns.sort((a, b) => b.decayedWeight - a.decayedWeight);
        memory.ignoredCallPatterns = memory.ignoredCallPatterns.slice(0, 20);
    }
    if (memory.trustedCallPatterns.length > 20) {
        memory.trustedCallPatterns.sort((a, b) => b.decayedWeight - a.decayedWeight);
        memory.trustedCallPatterns = memory.trustedCallPatterns.slice(0, 20);
    }

    return memory;
}

// =====================================================================
// Change Logging
// =====================================================================

export interface MemoryChangeLog {
    timestamp: number;
    driverId: string;
    changeType: 'adaptation' | 'reset' | 'preference' | 'decay';
    description: string;
    before?: unknown;
    after?: unknown;
}

const changeLogs: MemoryChangeLog[] = [];

export function logMemoryChange(log: MemoryChangeLog): void {
    if (!SAFEGUARDS.logAllChanges) return;

    changeLogs.push(log);

    // Keep last 1000 logs
    if (changeLogs.length > 1000) {
        changeLogs.shift();
    }
}

export function getRecentChangeLogs(driverId: string, limit = 50): MemoryChangeLog[] {
    return changeLogs
        .filter(l => l.driverId === driverId)
        .slice(-limit);
}

// =====================================================================
// Adaptation Rules (Week 17)
// Hard-bounded, rule-based adaptation. No ML.
// =====================================================================

import type { RaceCall, RaceCallKind, RaceCallSource } from '../race-engineer/race-call.model.js';
import {
    type EngineerMemory,
    type IgnoredPattern,
    type TrustedPattern,
    MEMORY_BOUNDS,
} from './memory.model.js';

// =====================================================================
// Adaptation Actions
// =====================================================================

export type AdaptationType =
    | 'reduce_frequency'      // Reduce ignored call types
    | 'increase_threshold'    // Raise confidence bar for false positives
    | 'prefer_ui'             // Downgrade voice to UI
    | 'preserve_priority'     // Maintain trusted patterns
    | 'decay_pattern';        // Age out old patterns

export interface AdaptationAction {
    type: AdaptationType;
    callKind: RaceCallKind;
    source?: RaceCallSource;
    oldValue: number;
    newValue: number;
    reason: string;
}

// =====================================================================
// Disallowed Adaptations
// =====================================================================

export const DISALLOWED_ADAPTATIONS = [
    'Changing core detection logic',
    'Altering severity classification',
    'Introducing new call types',
    'Suppressing critical calls',
    'Modifying confidence calculation',
    'Auto-enabling features',
];

// =====================================================================
// Adaptation Rules
// =====================================================================

/**
 * Update memory based on an ignored call.
 * Returns the adaptation actions taken.
 */
export function adaptToIgnoredCall(
    memory: EngineerMemory,
    call: RaceCall
): AdaptationAction[] {
    const actions: AdaptationAction[] = [];
    const now = Date.now();

    // Find or create pattern
    let pattern = memory.ignoredCallPatterns.find(
        p => p.callKind === call.kind && p.source === call.source
    );

    if (!pattern) {
        pattern = {
            callKind: call.kind,
            source: call.source,
            ignoreCount: 0,
            lastIgnoredAt: now,
            decayedWeight: 0,
        };
        memory.ignoredCallPatterns.push(pattern);
    }

    pattern.ignoreCount++;
    pattern.lastIgnoredAt = now;
    pattern.decayedWeight = Math.min(1.0, pattern.decayedWeight + 0.1);

    actions.push({
        type: 'reduce_frequency',
        callKind: call.kind,
        source: call.source,
        oldValue: pattern.decayedWeight - 0.1,
        newValue: pattern.decayedWeight,
        reason: `Driver ignored ${call.kind}/${call.source} call`,
    });

    // Reduce tolerance (bounded)
    const toleranceField = call.kind === 'execution'
        ? 'executionCallTolerance'
        : 'contextCallTolerance';

    const oldTolerance = memory[toleranceField];
    const newTolerance = Math.max(
        MEMORY_BOUNDS.minTolerance,
        oldTolerance - MEMORY_BOUNDS.toleranceStepSize
    );

    if (newTolerance !== oldTolerance) {
        memory[toleranceField] = newTolerance;
        actions.push({
            type: 'reduce_frequency',
            callKind: call.kind,
            oldValue: oldTolerance,
            newValue: newTolerance,
            reason: `Tolerance reduced after ignored call`,
        });
    }

    // Trim patterns if too many
    if (memory.ignoredCallPatterns.length > MEMORY_BOUNDS.maxIgnoredPatterns) {
        memory.ignoredCallPatterns.sort((a, b) => b.decayedWeight - a.decayedWeight);
        memory.ignoredCallPatterns = memory.ignoredCallPatterns.slice(0, MEMORY_BOUNDS.maxIgnoredPatterns);
    }

    memory.lastUpdatedAt = now;
    return actions;
}

/**
 * Update memory based on a trusted call (driver acted on it).
 */
export function adaptToTrustedCall(
    memory: EngineerMemory,
    call: RaceCall
): AdaptationAction[] {
    const actions: AdaptationAction[] = [];
    const now = Date.now();

    // Find or create pattern
    let pattern = memory.trustedCallPatterns.find(
        p => p.callKind === call.kind && p.source === call.source
    );

    if (!pattern) {
        pattern = {
            callKind: call.kind,
            source: call.source,
            trustCount: 0,
            lastTrustedAt: now,
            decayedWeight: 0,
        };
        memory.trustedCallPatterns.push(pattern);
    }

    pattern.trustCount++;
    pattern.lastTrustedAt = now;
    pattern.decayedWeight = Math.min(1.0, pattern.decayedWeight + 0.15);

    actions.push({
        type: 'preserve_priority',
        callKind: call.kind,
        source: call.source,
        oldValue: pattern.decayedWeight - 0.15,
        newValue: pattern.decayedWeight,
        reason: `Driver acted on ${call.kind}/${call.source} call`,
    });

    // Remove from ignored patterns if present
    const ignoredIdx = memory.ignoredCallPatterns.findIndex(
        p => p.callKind === call.kind && p.source === call.source
    );
    if (ignoredIdx !== -1) {
        memory.ignoredCallPatterns.splice(ignoredIdx, 1);
    }

    // Trim patterns
    if (memory.trustedCallPatterns.length > MEMORY_BOUNDS.maxTrustedPatterns) {
        memory.trustedCallPatterns.sort((a, b) => b.decayedWeight - a.decayedWeight);
        memory.trustedCallPatterns = memory.trustedCallPatterns.slice(0, MEMORY_BOUNDS.maxTrustedPatterns);
    }

    memory.lastUpdatedAt = now;
    return actions;
}

/**
 * Update memory after a false positive.
 */
export function adaptToFalsePositive(
    memory: EngineerMemory,
    call: RaceCall
): AdaptationAction[] {
    const actions: AdaptationAction[] = [];
    const now = Date.now();

    // Record false positive
    memory.falsePositiveHistory.push({
        callKind: call.kind,
        source: call.source,
        timestamp: now,
        confidenceAtTime: call.confidence,
    });

    // Trim history
    if (memory.falsePositiveHistory.length > MEMORY_BOUNDS.maxFalsePositives) {
        memory.falsePositiveHistory = memory.falsePositiveHistory.slice(-MEMORY_BOUNDS.maxFalsePositives);
    }

    // Count recent false positives for this source
    const recentFP = memory.falsePositiveHistory.filter(
        fp => fp.source === call.source && now - fp.timestamp < 24 * 60 * 60 * 1000
    ).length;

    if (recentFP >= 3) {
        actions.push({
            type: 'increase_threshold',
            callKind: call.kind,
            source: call.source,
            oldValue: call.confidence,
            newValue: call.confidence + 0.1,
            reason: `${recentFP} false positives from ${call.source} in 24h`,
        });
    }

    memory.lastUpdatedAt = now;
    return actions;
}

// =====================================================================
// Pattern Decay
// =====================================================================

/**
 * Apply time-based decay to patterns.
 */
export function applyPatternDecay(memory: EngineerMemory): void {
    const now = Date.now();
    const halfLifeMs = MEMORY_BOUNDS.patternDecayHalfLifeDays * 24 * 60 * 60 * 1000;

    for (const pattern of memory.ignoredCallPatterns) {
        const age = now - pattern.lastIgnoredAt;
        const decayFactor = Math.pow(0.5, age / halfLifeMs);
        pattern.decayedWeight *= decayFactor;
    }

    for (const pattern of memory.trustedCallPatterns) {
        const age = now - pattern.lastTrustedAt;
        const decayFactor = Math.pow(0.5, age / halfLifeMs);
        pattern.decayedWeight *= decayFactor;
    }

    // Remove fully decayed patterns
    memory.ignoredCallPatterns = memory.ignoredCallPatterns.filter(p => p.decayedWeight > 0.01);
    memory.trustedCallPatterns = memory.trustedCallPatterns.filter(p => p.decayedWeight > 0.01);

    memory.lastUpdatedAt = now;
}

// =====================================================================
// Query Adaptation
// =====================================================================

/**
 * Check if a call should be suppressed based on memory.
 * NEVER suppresses critical calls.
 */
export function shouldSuppressFromMemory(
    memory: EngineerMemory,
    call: RaceCall
): { suppress: boolean; reason: string } {
    // Critical calls NEVER suppressed
    if (call.severity === 'critical') {
        return { suppress: false, reason: 'Critical calls bypass memory' };
    }

    // Check ignored patterns
    const ignoredPattern = memory.ignoredCallPatterns.find(
        p => p.callKind === call.kind &&
            (!p.source || p.source === call.source)
    );

    if (ignoredPattern && ignoredPattern.decayedWeight > 0.5) {
        // Apply tolerance check
        const tolerance = call.kind === 'execution'
            ? memory.executionCallTolerance
            : memory.contextCallTolerance;

        // If confidence is below tolerance, suppress
        if (call.confidence < tolerance) {
            return {
                suppress: true,
                reason: `Ignored pattern (weight: ${ignoredPattern.decayedWeight.toFixed(2)}) + low confidence`,
            };
        }
    }

    return { suppress: false, reason: 'No memory-based suppression' };
}

/**
 * Check if a call should be prioritized based on memory.
 */
export function shouldPrioritizeFromMemory(
    memory: EngineerMemory,
    call: RaceCall
): { prioritize: boolean; boost: number } {
    const trustedPattern = memory.trustedCallPatterns.find(
        p => p.callKind === call.kind &&
            (!p.source || p.source === call.source)
    );

    if (trustedPattern && trustedPattern.decayedWeight > 0.3) {
        return {
            prioritize: true,
            boost: trustedPattern.decayedWeight * 0.1,  // Small confidence boost
        };
    }

    return { prioritize: false, boost: 0 };
}

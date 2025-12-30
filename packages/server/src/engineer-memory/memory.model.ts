// =====================================================================
// Engineer Memory Model (Week 17)
// Persistent, per-driver memory for continuity across sessions.
// NO ML. Rule-based. Explainable. Reversible.
// =====================================================================

import type { RaceCallKind, RaceCallSource } from '../race-engineer/race-call.model.js';

// =====================================================================
// Core Types
// =====================================================================

export type VerbosityPreference = 'minimal' | 'normal' | 'high';

/**
 * Pattern of calls the driver has ignored.
 */
export interface IgnoredPattern {
    callKind: RaceCallKind;
    source?: RaceCallSource;
    messagePattern?: string;  // Substring match
    ignoreCount: number;
    lastIgnoredAt: number;
    decayedWeight: number;  // 0-1, decays over time
}

/**
 * Pattern of calls the driver has trusted/acted on.
 */
export interface TrustedPattern {
    callKind: RaceCallKind;
    source?: RaceCallSource;
    messagePattern?: string;
    trustCount: number;
    lastTrustedAt: number;
    decayedWeight: number;
}

/**
 * Engineer memory for a specific driver.
 */
export interface EngineerMemory {
    driverId: string;
    version: number;  // Schema version for migrations

    // Preferences
    verbosityPreference: VerbosityPreference;
    voiceEnabled: boolean;
    voiceLocked: boolean;  // If true, don't auto-adjust voice

    // Tolerance thresholds (0-1)
    // Higher = more tolerant (fewer calls suppressed)
    executionCallTolerance: number;
    contextCallTolerance: number;

    // Patterns learned from behavior
    ignoredCallPatterns: IgnoredPattern[];
    trustedCallPatterns: TrustedPattern[];

    // False positives tracking (for confidence adjustment)
    falsePositiveHistory: FalsePositiveRecord[];

    // Session tracking
    sessionsTracked: number;
    totalCallsDelivered: number;
    totalCallsSuppressed: number;

    // Timestamps
    createdAt: number;
    lastUpdatedAt: number;
    lastSessionAt: number;
}

export interface FalsePositiveRecord {
    callKind: RaceCallKind;
    source: RaceCallSource;
    timestamp: number;
    confidenceAtTime: number;
}

// =====================================================================
// Defaults
// =====================================================================

export const DEFAULT_MEMORY: Omit<EngineerMemory, 'driverId'> = {
    version: 1,
    verbosityPreference: 'normal',
    voiceEnabled: true,
    voiceLocked: false,
    executionCallTolerance: 0.5,  // Neutral
    contextCallTolerance: 0.5,
    ignoredCallPatterns: [],
    trustedCallPatterns: [],
    falsePositiveHistory: [],
    sessionsTracked: 0,
    totalCallsDelivered: 0,
    totalCallsSuppressed: 0,
    createdAt: Date.now(),
    lastUpdatedAt: Date.now(),
    lastSessionAt: 0,
};

/**
 * Create new memory for a driver (neutral defaults).
 */
export function createNewMemory(driverId: string): EngineerMemory {
    return {
        ...DEFAULT_MEMORY,
        driverId,
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
    };
}

// =====================================================================
// Memory Bounds
// =====================================================================

export const MEMORY_BOUNDS = {
    // Tolerance never goes below this (always some calls get through)
    minTolerance: 0.2,

    // Tolerance never goes above this
    maxTolerance: 1.0,

    // Max patterns to track
    maxIgnoredPatterns: 20,
    maxTrustedPatterns: 20,
    maxFalsePositives: 50,

    // Decay half-life (days)
    patternDecayHalfLifeDays: 7,

    // Tolerance adjustment step
    toleranceStepSize: 0.05,
};

// =====================================================================
// Serialization
// =====================================================================

/**
 * Serialize memory to JSON (for storage).
 */
export function serializeMemory(memory: EngineerMemory): string {
    return JSON.stringify(memory, null, 2);
}

/**
 * Deserialize memory from JSON.
 */
export function deserializeMemory(json: string): EngineerMemory | null {
    try {
        const parsed = JSON.parse(json);

        // Validate required fields
        if (!parsed.driverId || typeof parsed.version !== 'number') {
            return null;
        }

        // Apply defaults for missing fields (migration)
        return {
            ...DEFAULT_MEMORY,
            ...parsed,
        };
    } catch {
        return null;
    }
}

// =====================================================================
// Human-Readable Debug Format
// =====================================================================

/**
 * Format memory for human-readable debug output.
 */
export function formatMemoryDebug(memory: EngineerMemory): string {
    const lines: string[] = [
        `=== Engineer Memory: ${memory.driverId} ===`,
        `Version: ${memory.version}`,
        `Sessions tracked: ${memory.sessionsTracked}`,
        ``,
        `--- Preferences ---`,
        `Verbosity: ${memory.verbosityPreference}`,
        `Voice: ${memory.voiceEnabled ? 'ON' : 'OFF'}${memory.voiceLocked ? ' (locked)' : ''}`,
        ``,
        `--- Tolerances ---`,
        `Execution: ${(memory.executionCallTolerance * 100).toFixed(0)}%`,
        `Context: ${(memory.contextCallTolerance * 100).toFixed(0)}%`,
        ``,
        `--- Stats ---`,
        `Calls delivered: ${memory.totalCallsDelivered}`,
        `Calls suppressed: ${memory.totalCallsSuppressed}`,
        ``,
        `--- Ignored Patterns (${memory.ignoredCallPatterns.length}) ---`,
    ];

    for (const p of memory.ignoredCallPatterns.slice(0, 5)) {
        lines.push(`  - ${p.callKind}/${p.source || '*'}: ${p.ignoreCount} times (weight: ${p.decayedWeight.toFixed(2)})`);
    }

    lines.push(``, `--- Trusted Patterns (${memory.trustedCallPatterns.length}) ---`);
    for (const p of memory.trustedCallPatterns.slice(0, 5)) {
        lines.push(`  - ${p.callKind}/${p.source || '*'}: ${p.trustCount} times (weight: ${p.decayedWeight.toFixed(2)})`);
    }

    lines.push(``, `Last updated: ${new Date(memory.lastUpdatedAt).toISOString()}`);

    return lines.join('\n');
}

// =====================================================================
// Reset
// =====================================================================

/**
 * Reset memory to defaults (preserves driverId).
 */
export function resetMemory(memory: EngineerMemory): EngineerMemory {
    return {
        ...createNewMemory(memory.driverId),
        // Preserve explicit user preferences if locked
        voiceLocked: memory.voiceLocked,
        voiceEnabled: memory.voiceLocked ? memory.voiceEnabled : true,
    };
}

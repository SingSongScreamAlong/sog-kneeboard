// =====================================================================
// Driver Controls (Week 15)
// Driver-configurable preferences for Race Engineer behavior.
// =====================================================================

import type { RaceCallKind, RaceCallSeverity } from './race-call.model.js';

// =====================================================================
// Driver Preferences
// =====================================================================

export interface DriverPreferences {
    // Verbosity level
    verbosity: 'minimal' | 'normal' | 'high';

    // Voice enable by call kind
    voiceExecution: boolean;  // Execution calls can use voice
    voiceContext: boolean;    // Context calls can use voice

    // Severity threshold for voice
    minVoiceSeverity: RaceCallSeverity;

    // UI preferences
    showConfidenceIndicator: boolean;
    showCallHistory: boolean;

    // Debug mode (dev only)
    debugMode: boolean;
}

export const DEFAULT_PREFERENCES: DriverPreferences = {
    verbosity: 'normal',
    voiceExecution: true,
    voiceContext: true,
    minVoiceSeverity: 'warn',
    showConfidenceIndicator: true,
    showCallHistory: true,
    debugMode: false,
};

// =====================================================================
// Verbosity Presets
// =====================================================================

export const VERBOSITY_DESCRIPTIONS = {
    minimal: 'Critical and caution calls only. Maximum focus.',
    normal: 'Balanced feedback. Warnings when relevant.',
    high: 'More situational context. Full awareness.',
};

export const VERBOSITY_THRESHOLDS: Record<DriverPreferences['verbosity'], {
    minConfidence: number;
    minSeverity: RaceCallSeverity;
    cooldownMultiplier: number;
}> = {
    minimal: {
        minConfidence: 0.7,
        minSeverity: 'caution',
        cooldownMultiplier: 2.0,  // Double cooldowns
    },
    normal: {
        minConfidence: 0.5,
        minSeverity: 'warn',
        cooldownMultiplier: 1.0,
    },
    high: {
        minConfidence: 0.4,
        minSeverity: 'info',
        cooldownMultiplier: 0.5,  // Half cooldowns
    },
};

// =====================================================================
// UI Confidence Indicator
// =====================================================================

export interface ConfidenceIndicator {
    level: 'weak' | 'moderate' | 'strong' | 'high';
    color: string;
    icon: string;
    tooltip: string;
}

export function getConfidenceIndicator(confidence: number): ConfidenceIndicator {
    if (confidence < 0.3) {
        return {
            level: 'weak',
            color: '#9CA3AF',  // Gray
            icon: '○',
            tooltip: 'Weak signal — informational only',
        };
    }
    if (confidence < 0.6) {
        return {
            level: 'moderate',
            color: '#FBBF24',  // Yellow
            icon: '◐',
            tooltip: 'Moderate confidence — worth noting',
        };
    }
    if (confidence < 0.85) {
        return {
            level: 'strong',
            color: '#34D399',  // Green
            icon: '◉',
            tooltip: 'Strong confidence — reliable signal',
        };
    }
    return {
        level: 'high',
        color: '#60A5FA',  // Blue
        icon: '●',
        tooltip: 'High certainty — trusted signal',
    };
}

// =====================================================================
// Debug Information
// =====================================================================

export interface CallDebugInfo {
    callId: string;
    source: string;
    confidenceFactors: {
        signalStrength: number;
        signalAgreement: number;
        temporalStability: number;
        contextImportance: number;
    };
    speakDecision: {
        shouldSpeak: boolean;
        reason: string;
        channel: string;
    };
    suppressionHistory: string[];
    escalationPath: string[];
}

/**
 * Generate debug tooltip text.
 */
export function formatDebugInfo(debug: CallDebugInfo): string {
    return [
        `ID: ${debug.callId}`,
        `Source: ${debug.source}`,
        `Confidence Factors:`,
        `  Signal: ${(debug.confidenceFactors.signalStrength * 100).toFixed(0)}%`,
        `  Agreement: ${(debug.confidenceFactors.signalAgreement * 100).toFixed(0)}%`,
        `  Stability: ${(debug.confidenceFactors.temporalStability * 100).toFixed(0)}%`,
        `  Context: ${(debug.confidenceFactors.contextImportance * 100).toFixed(0)}%`,
        `Decision: ${debug.speakDecision.shouldSpeak ? 'SPEAK' : 'SILENT'}`,
        `Reason: ${debug.speakDecision.reason}`,
    ].join('\n');
}

// =====================================================================
// Preferences Validation
// =====================================================================

export function validatePreferences(prefs: Partial<DriverPreferences>): DriverPreferences {
    return {
        verbosity: prefs.verbosity || DEFAULT_PREFERENCES.verbosity,
        voiceExecution: prefs.voiceExecution ?? DEFAULT_PREFERENCES.voiceExecution,
        voiceContext: prefs.voiceContext ?? DEFAULT_PREFERENCES.voiceContext,
        minVoiceSeverity: prefs.minVoiceSeverity || DEFAULT_PREFERENCES.minVoiceSeverity,
        showConfidenceIndicator: prefs.showConfidenceIndicator ?? DEFAULT_PREFERENCES.showConfidenceIndicator,
        showCallHistory: prefs.showCallHistory ?? DEFAULT_PREFERENCES.showCallHistory,
        debugMode: prefs.debugMode ?? DEFAULT_PREFERENCES.debugMode,
    };
}

// =====================================================================
// Preference Persistence Keys
// =====================================================================

export const PREFERENCE_STORAGE_KEY = 'okboxbox_driver_prefs';

export function loadPreferences(): DriverPreferences {
    if (typeof localStorage === 'undefined') {
        return DEFAULT_PREFERENCES;
    }

    try {
        const stored = localStorage.getItem(PREFERENCE_STORAGE_KEY);
        if (!stored) return DEFAULT_PREFERENCES;

        return validatePreferences(JSON.parse(stored));
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

export function savePreferences(prefs: DriverPreferences): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(prefs));
}

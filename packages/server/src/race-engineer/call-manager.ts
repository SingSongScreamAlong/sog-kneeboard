// =====================================================================
// Race Call Manager (Week 15)
// Orchestrates call lifecycle, suppression, and delivery.
// =====================================================================

import {
    type RaceCall,
    type RaceCallSeverity,
    type ConfidenceFactors,
    createRaceCall,
    calculateConfidence,
    isSeverityAllowed,
    selectChannel,
    containsBannedPhrases,
} from './race-call.model.js';
import {
    decideSpeakBehavior,
    shouldEscalate,
    shouldDemote,
    type DriverWorkloadState,
    type CallHistory,
} from './speak-rules.js';
import {
    type DriverPreferences,
    DEFAULT_PREFERENCES,
    VERBOSITY_THRESHOLDS,
} from './driver-controls.js';
import { containsBannedTerminology } from './terminology.js';

// =====================================================================
// Call Manager State
// =====================================================================

interface CallManagerState {
    activeCalls: Map<string, RaceCall>;
    callHistory: RaceCall[];
    preferences: DriverPreferences;
    falsePositiveCount: number;
    ignoredCallCount: number;
    lastVoicedAt: number | null;
    lastFalsePositiveAt: number | null;
}

// =====================================================================
// Call Manager
// =====================================================================

export class RaceCallManager {
    private state: CallManagerState;
    private onCallDelivered?: (call: RaceCall) => void;
    private onCallSuppressed?: (call: RaceCall, reason: string) => void;

    constructor() {
        this.state = {
            activeCalls: new Map(),
            callHistory: [],
            preferences: DEFAULT_PREFERENCES,
            falsePositiveCount: 0,
            ignoredCallCount: 0,
            lastVoicedAt: null,
            lastFalsePositiveAt: null,
        };
    }

    // =====================================================================
    // Configuration
    // =====================================================================

    setPreferences(prefs: Partial<DriverPreferences>): void {
        this.state.preferences = { ...this.state.preferences, ...prefs };
    }

    onDelivered(callback: (call: RaceCall) => void): void {
        this.onCallDelivered = callback;
    }

    onSuppressed(callback: (call: RaceCall, reason: string) => void): void {
        this.onCallSuppressed = callback;
    }

    // =====================================================================
    // Call Submission
    // =====================================================================

    submitCall(params: {
        sessionId: string;
        driverId: string;
        kind: RaceCall['kind'];
        severity: RaceCallSeverity;
        source: RaceCall['source'];
        message: string;
        confidenceFactors: ConfidenceFactors;
        workload: DriverWorkloadState;
    }): RaceCall | null {
        // Calculate confidence
        const confidence = calculateConfidence(params.confidenceFactors);

        // Validate message content
        if (containsBannedPhrases(params.message)) {
            console.warn('Call contains banned phrases, rejecting:', params.message);
            return null;
        }

        const termCheck = containsBannedTerminology(params.message);
        if (termCheck.hasBanned) {
            console.warn('Call contains banned terminology:', termCheck.found);
            return null;
        }

        // Check if severity is allowed for confidence
        if (!isSeverityAllowed(confidence, params.severity)) {
            // Downgrade severity
            const allowedSeverity = this.getAllowedSeverity(confidence, params.severity);
            if (!allowedSeverity) {
                // Too weak to even show
                return null;
            }
            params.severity = allowedSeverity;
        }

        // Apply verbosity threshold
        const verbosityThreshold = VERBOSITY_THRESHOLDS[this.state.preferences.verbosity];
        if (confidence < verbosityThreshold.minConfidence) {
            return null;  // Below verbosity threshold
        }

        // Determine channel
        const channel = selectChannel(
            params.severity,
            confidence,
            params.workload.level
        );

        // Create call
        const call = createRaceCall({
            sessionId: params.sessionId,
            driverId: params.driverId,
            kind: params.kind,
            severity: params.severity,
            channel,
            source: params.source,
            confidence,
            message: params.message,
        });

        // Get speak decision
        const history = this.getCallHistory();
        const decision = decideSpeakBehavior(
            call,
            params.workload,
            history,
            this.state.preferences.verbosity
        );

        if (!decision.shouldSpeak && decision.channel === 'suppress') {
            this.onCallSuppressed?.(call, decision.reason);
            return null;
        }

        // Update call channel based on decision
        call.channel = decision.channel === 'voice' ? 'both' : 'ui';

        // Handle delay
        if (decision.delay && decision.delay > 0) {
            setTimeout(() => this.deliverCall(call), decision.delay);
        } else {
            this.deliverCall(call);
        }

        return call;
    }

    // =====================================================================
    // Call Delivery
    // =====================================================================

    private deliverCall(call: RaceCall): void {
        call.status = 'delivered';
        call.deliveredAt = Date.now();

        this.state.activeCalls.set(call.id, call);
        this.state.callHistory.push(call);

        // Trim history
        if (this.state.callHistory.length > 100) {
            this.state.callHistory = this.state.callHistory.slice(-100);
        }

        // Track last voiced
        if (call.channel === 'voice' || call.channel === 'both') {
            this.state.lastVoicedAt = Date.now();
        }

        this.onCallDelivered?.(call);
    }

    // =====================================================================
    // Call Lifecycle
    // =====================================================================

    tickCallLifecycle(conditionStates: Map<string, boolean>): void {
        const now = Date.now();

        for (const [id, call] of this.state.activeCalls) {
            // Check expiration
            if (call.expiresAt && now > call.expiresAt) {
                call.status = 'expired';
                this.state.activeCalls.delete(id);
                continue;
            }

            const conditionActive = conditionStates.get(id) ?? false;

            // Check escalation
            if (conditionActive) {
                const escalation = shouldEscalate(
                    call,
                    now - call.createdAt,
                    true
                );
                if (escalation.escalate && escalation.newSeverity) {
                    this.escalateCall(call, escalation.newSeverity);
                }
            } else {
                // Check demotion
                const demotion = shouldDemote(call, !conditionActive);
                if (demotion.expire) {
                    call.status = 'expired';
                    this.state.activeCalls.delete(id);
                } else if (demotion.demote && demotion.newSeverity) {
                    call.severity = demotion.newSeverity;
                }
            }
        }
    }

    private escalateCall(call: RaceCall, newSeverity: RaceCallSeverity): void {
        const escalatedCall = createRaceCall({
            ...call,
            severity: newSeverity,
            escalatedFrom: call.id,
        });

        // Expire old call
        call.status = 'expired';
        this.state.activeCalls.delete(call.id);

        // Deliver escalated call
        this.deliverCall(escalatedCall);
    }

    // =====================================================================
    // False Positive Tracking
    // =====================================================================

    reportFalsePositive(): void {
        this.state.falsePositiveCount++;
        this.state.lastFalsePositiveAt = Date.now();

        // Decay after 5 minutes
        setTimeout(() => {
            this.state.falsePositiveCount = Math.max(0, this.state.falsePositiveCount - 1);
        }, 5 * 60 * 1000);
    }

    reportIgnored(): void {
        this.state.ignoredCallCount++;

        // Decay after 2 minutes
        setTimeout(() => {
            this.state.ignoredCallCount = Math.max(0, this.state.ignoredCallCount - 1);
        }, 2 * 60 * 1000);
    }

    // =====================================================================
    // Helpers
    // =====================================================================

    private getCallHistory(): CallHistory {
        const now = Date.now();
        const thirtySecondsAgo = now - 30000;

        return {
            recentCalls: this.state.callHistory.filter(c => c.createdAt > thirtySecondsAgo),
            lastVoicedAt: this.state.lastVoicedAt,
            falsePositives: this.state.falsePositiveCount,
            ignoredCalls: this.state.ignoredCallCount,
        };
    }

    private getAllowedSeverity(confidence: number, requested: RaceCallSeverity): RaceCallSeverity | null {
        const severities: RaceCallSeverity[] = ['critical', 'caution', 'warn', 'info'];
        const requestedIdx = severities.indexOf(requested);

        for (let i = requestedIdx; i < severities.length; i++) {
            if (isSeverityAllowed(confidence, severities[i])) {
                return severities[i];
            }
        }
        return null;
    }

    // =====================================================================
    // Query
    // =====================================================================

    getActiveCalls(): RaceCall[] {
        return Array.from(this.state.activeCalls.values());
    }

    getCallById(id: string): RaceCall | undefined {
        return this.state.activeCalls.get(id);
    }

    clearAll(): void {
        this.state.activeCalls.clear();
        this.state.callHistory = [];
    }
}

// =====================================================================
// Singleton
// =====================================================================

let _manager: RaceCallManager | null = null;

export function getRaceCallManager(): RaceCallManager {
    if (!_manager) {
        _manager = new RaceCallManager();
    }
    return _manager;
}

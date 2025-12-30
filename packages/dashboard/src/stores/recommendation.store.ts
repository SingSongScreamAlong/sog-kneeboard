// =====================================================================
// Recommendation Store
// Race status recommendation engine — RECOMMENDS only, never controls
// =====================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Local type definitions (avoid import timing issues)
type RaceStatus = 'GREEN' | 'LOCAL_YELLOW' | 'FULL_COURSE_YELLOW' | 'REVIEW' | 'POST_RACE_REVIEW' | 'NO_ACTION';
type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
type StewardAction = 'ACCEPT' | 'OVERRIDE' | 'DISMISS' | 'DEFER_TO_POST_RACE';

interface DriverReference {
    driverId: string;
    driverName: string;
    carNumber: string;
}

interface AnalysisFact {
    factor: string;
    value: string | number;
    weight: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
}

interface StatusRecommendation {
    id: string;
    sessionId: string;
    timestamp: Date;
    recommendedStatus: RaceStatus;
    confidence: ConfidenceLevel;
    reasoning: string;
    affectedDrivers: DriverReference[];
    incidentId?: string;
    lapNumber: number;
    sessionTimeMs: number;
    replayTimestamp?: number;
    severityScore: number;
    analysisFacts: AnalysisFact[];
    status: 'PENDING' | 'DECIDED';
    decision?: StewardDecision;
}

interface StewardDecision {
    recommendationId: string;
    action: StewardAction;
    overrideStatus?: RaceStatus;
    stewardId: string;
    stewardName: string;
    notes?: string;
    decidedAt: Date;
}

interface IncidentData {
    id: string;
    sessionId: string;
    type: string;
    severity: string;
    lapNumber: number;
    sessionTimeMs: number;
    driversInvolved?: { driverId: string; driverName: string; carNumber?: string }[];
    severityScore?: number;
}

interface RecommendationState {
    // Current internal status (NOT iRacing flag)
    currentStatus: RaceStatus;

    // Recommendations
    pendingRecommendations: StatusRecommendation[];
    decidedRecommendations: StatusRecommendation[];

    // Configuration
    autoAnalysisEnabled: boolean;
    alertOnHighConfidence: boolean;

    // Steward info
    currentStewardId: string;
    currentStewardName: string;

    // Actions
    generateRecommendation: (incident: IncidentData) => StatusRecommendation;
    acceptRecommendation: (id: string, notes?: string) => void;
    overrideRecommendation: (id: string, newStatus: RaceStatus, notes?: string) => void;
    dismissRecommendation: (id: string, notes?: string) => void;
    deferToPostRace: (id: string, notes?: string) => void;
    setCurrentStatus: (status: RaceStatus) => void;
    setSteward: (id: string, name: string) => void;
    toggleAutoAnalysis: () => void;
    clearPending: () => void;
    getRecommendationById: (id: string) => StatusRecommendation | undefined;
}

const generateId = () => `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Analyze an incident and determine recommended status.
 * Uses multiple factors to generate a confidence-weighted recommendation.
 */
function analyzeIncident(incident: IncidentData): {
    status: RaceStatus;
    confidence: ConfidenceLevel;
    reasoning: string;
    facts: AnalysisFact[];
    severityScore: number;
} {
    const facts: AnalysisFact[] = [];
    let severityScore = incident.severityScore || 0;

    // Factor: Number of cars involved
    const carCount = incident.driversInvolved?.length || 1;
    facts.push({
        factor: 'CAR_COUNT',
        value: carCount,
        weight: carCount >= 3 ? 'HIGH' : carCount >= 2 ? 'MEDIUM' : 'LOW',
        description: `${carCount} vehicle(s) involved`,
    });
    severityScore += carCount * 10;

    // Factor: Incident type severity
    const isContact = incident.type.toLowerCase().includes('contact');
    const isCollision = incident.type.toLowerCase().includes('collision');
    const isOffTrack = incident.type.toLowerCase().includes('off');

    if (isCollision) {
        facts.push({
            factor: 'INCIDENT_TYPE',
            value: 'collision',
            weight: 'HIGH',
            description: 'Collision detected',
        });
        severityScore += 30;
    } else if (isContact) {
        facts.push({
            factor: 'INCIDENT_TYPE',
            value: 'contact',
            weight: 'MEDIUM',
            description: 'Contact between vehicles',
        });
        severityScore += 20;
    } else if (isOffTrack) {
        facts.push({
            factor: 'INCIDENT_TYPE',
            value: 'off_track',
            weight: 'LOW',
            description: 'Vehicle went off track',
        });
        severityScore += 10;
    }

    // Factor: Base severity from incident data
    const severityMap: Record<string, number> = {
        light: 10,
        medium: 25,
        heavy: 50,
    };
    const baseSeverity = severityMap[incident.severity.toLowerCase()] || 15;
    facts.push({
        factor: 'CONTACT_SEVERITY',
        value: incident.severity,
        weight: baseSeverity >= 50 ? 'CRITICAL' : baseSeverity >= 25 ? 'HIGH' : 'MEDIUM',
        description: `Severity rated as ${incident.severity}`,
    });
    severityScore += baseSeverity;

    // Determine recommended status based on score
    let status: RaceStatus;
    let confidence: ConfidenceLevel;
    let reasoning: string;

    if (severityScore >= 80) {
        status = 'FULL_COURSE_YELLOW';
        confidence = 'HIGH';
        reasoning = `Major incident involving ${carCount} vehicle(s). High severity contact detected. Steward review recommended to determine if race neutralization is appropriate.`;
    } else if (severityScore >= 60) {
        status = 'REVIEW';
        confidence = 'HIGH';
        reasoning = `Significant incident requiring steward attention. ${carCount} vehicle(s) involved with ${incident.severity} severity contact.`;
    } else if (severityScore >= 40) {
        status = 'LOCAL_YELLOW';
        confidence = 'MEDIUM';
        reasoning = `Minor incident, appears contained. ${carCount} vehicle(s) involved. Monitor for safe recovery.`;
    } else if (severityScore >= 20) {
        status = 'REVIEW';
        confidence = 'LOW';
        reasoning = `Low-severity event detected. Steward may want to review for potential rule violation.`;
    } else {
        status = 'NO_ACTION';
        confidence = 'MEDIUM';
        reasoning = `Minor event with safe recovery. No steward intervention appears necessary.`;
    }

    return { status, confidence, reasoning, facts, severityScore: Math.min(100, severityScore) };
}

export const useRecommendationStore = create<RecommendationState>()(
    persist(
        (set, get) => ({
            currentStatus: 'GREEN',
            pendingRecommendations: [],
            decidedRecommendations: [],
            autoAnalysisEnabled: true,
            alertOnHighConfidence: true,
            currentStewardId: 'default',
            currentStewardName: 'Race Steward',

            generateRecommendation: (incident) => {
                const analysis = analyzeIncident(incident);

                const recommendation: StatusRecommendation = {
                    id: generateId(),
                    sessionId: incident.sessionId,
                    timestamp: new Date(),
                    recommendedStatus: analysis.status,
                    confidence: analysis.confidence,
                    reasoning: analysis.reasoning,
                    affectedDrivers: (incident.driversInvolved || []).map(d => ({
                        driverId: d.driverId,
                        driverName: d.driverName,
                        carNumber: d.carNumber || '?',
                    })),
                    incidentId: incident.id,
                    lapNumber: incident.lapNumber,
                    sessionTimeMs: incident.sessionTimeMs,
                    severityScore: analysis.severityScore,
                    analysisFacts: analysis.facts,
                    status: 'PENDING',
                };

                set(state => ({
                    pendingRecommendations: [...state.pendingRecommendations, recommendation],
                }));

                return recommendation;
            },

            acceptRecommendation: (id, notes) => {
                const state = get();
                const rec = state.pendingRecommendations.find(r => r.id === id);
                if (!rec) return;

                const decision: StewardDecision = {
                    recommendationId: id,
                    action: 'ACCEPT',
                    stewardId: state.currentStewardId,
                    stewardName: state.currentStewardName,
                    notes,
                    decidedAt: new Date(),
                };

                const updatedRec: StatusRecommendation = {
                    ...rec,
                    status: 'DECIDED',
                    decision,
                };

                set(state => ({
                    pendingRecommendations: state.pendingRecommendations.filter(r => r.id !== id),
                    decidedRecommendations: [...state.decidedRecommendations, updatedRec],
                    currentStatus: rec.recommendedStatus,
                }));
            },

            overrideRecommendation: (id, newStatus, notes) => {
                const state = get();
                const rec = state.pendingRecommendations.find(r => r.id === id);
                if (!rec) return;

                const decision: StewardDecision = {
                    recommendationId: id,
                    action: 'OVERRIDE',
                    overrideStatus: newStatus,
                    stewardId: state.currentStewardId,
                    stewardName: state.currentStewardName,
                    notes,
                    decidedAt: new Date(),
                };

                const updatedRec: StatusRecommendation = {
                    ...rec,
                    status: 'DECIDED',
                    decision,
                };

                set(state => ({
                    pendingRecommendations: state.pendingRecommendations.filter(r => r.id !== id),
                    decidedRecommendations: [...state.decidedRecommendations, updatedRec],
                    currentStatus: newStatus,
                }));
            },

            dismissRecommendation: (id, notes) => {
                const state = get();
                const rec = state.pendingRecommendations.find(r => r.id === id);
                if (!rec) return;

                const decision: StewardDecision = {
                    recommendationId: id,
                    action: 'DISMISS',
                    stewardId: state.currentStewardId,
                    stewardName: state.currentStewardName,
                    notes,
                    decidedAt: new Date(),
                };

                const updatedRec: StatusRecommendation = {
                    ...rec,
                    status: 'DECIDED',
                    decision,
                };

                set(state => ({
                    pendingRecommendations: state.pendingRecommendations.filter(r => r.id !== id),
                    decidedRecommendations: [...state.decidedRecommendations, updatedRec],
                }));
            },

            deferToPostRace: (id, notes) => {
                const state = get();
                const rec = state.pendingRecommendations.find(r => r.id === id);
                if (!rec) return;

                const decision: StewardDecision = {
                    recommendationId: id,
                    action: 'DEFER_TO_POST_RACE',
                    stewardId: state.currentStewardId,
                    stewardName: state.currentStewardName,
                    notes,
                    decidedAt: new Date(),
                };

                const updatedRec: StatusRecommendation = {
                    ...rec,
                    status: 'DECIDED',
                    decision,
                };

                set(state => ({
                    pendingRecommendations: state.pendingRecommendations.filter(r => r.id !== id),
                    decidedRecommendations: [...state.decidedRecommendations, updatedRec],
                }));
            },

            setCurrentStatus: (status) => set({ currentStatus: status }),

            setSteward: (id, name) => set({ currentStewardId: id, currentStewardName: name }),

            toggleAutoAnalysis: () => set(state => ({ autoAnalysisEnabled: !state.autoAnalysisEnabled })),

            clearPending: () => set({ pendingRecommendations: [] }),

            getRecommendationById: (id) => {
                const state = get();
                return state.pendingRecommendations.find(r => r.id === id) ||
                    state.decidedRecommendations.find(r => r.id === id);
            },
        }),
        {
            name: 'controlbox-recommendations',
            partialize: (state) => ({
                currentStatus: state.currentStatus,
                decidedRecommendations: state.decidedRecommendations,
                autoAnalysisEnabled: state.autoAnalysisEnabled,
                currentStewardId: state.currentStewardId,
                currentStewardName: state.currentStewardName,
            }),
        }
    )
);

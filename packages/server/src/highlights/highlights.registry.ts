// =====================================================================
// Highlights Registry (Week 10)
// Server-side highlight metadata storage and auto-detection.
// =====================================================================

import { v4 as uuid } from 'uuid';

// =====================================================================
// Types
// =====================================================================

export type HighlightType =
    | 'incident'
    | 'battle'
    | 'lead_change'
    | 'fastest_lap'
    | 'pit_stop'
    | 'custom';

export type HighlightVisibility = 'broadcast' | 'team' | 'race_control' | 'driver';

export type HighlightCreator = 'system' | 'director' | 'steward' | 'team';

export interface Highlight {
    id: string;
    sessionId: string;
    type: HighlightType;
    startMs: number;
    endMs: number;
    subjectDriverIds: string[];
    title: string;
    notes: string;
    createdBy: HighlightCreator;
    createdAt: number;
    visibility: HighlightVisibility;
    exported: boolean;
}

export interface CreateHighlightRequest {
    sessionId: string;
    type: HighlightType;
    startMs: number;
    endMs: number;
    subjectDriverIds?: string[];
    title?: string;
    notes?: string;
    visibility?: HighlightVisibility;
}

// =====================================================================
// In-Memory Storage
// =====================================================================

const highlights = new Map<string, Highlight>();
const sessionHighlights = new Map<string, Set<string>>();

// =====================================================================
// CRUD Operations
// =====================================================================

export function createHighlight(
    request: CreateHighlightRequest,
    createdBy: HighlightCreator
): Highlight {
    const id = uuid();
    const highlight: Highlight = {
        id,
        sessionId: request.sessionId,
        type: request.type,
        startMs: request.startMs,
        endMs: request.endMs,
        subjectDriverIds: request.subjectDriverIds || [],
        title: request.title || generateTitle(request.type),
        notes: request.notes || '',
        createdBy,
        createdAt: Date.now(),
        visibility: request.visibility || 'broadcast',
        exported: false,
    };

    highlights.set(id, highlight);

    // Index by session
    if (!sessionHighlights.has(request.sessionId)) {
        sessionHighlights.set(request.sessionId, new Set());
    }
    sessionHighlights.get(request.sessionId)!.add(id);

    console.log(`📌 Highlight created: ${highlight.type} - ${highlight.title}`);
    return highlight;
}

export function getHighlight(id: string): Highlight | undefined {
    return highlights.get(id);
}

export function getSessionHighlights(sessionId: string): Highlight[] {
    const ids = sessionHighlights.get(sessionId);
    if (!ids) return [];

    return Array.from(ids)
        .map(id => highlights.get(id)!)
        .filter(Boolean)
        .sort((a, b) => a.startMs - b.startMs);
}

export function updateHighlight(
    id: string,
    updates: Partial<Pick<Highlight, 'title' | 'notes' | 'visibility' | 'exported'>>
): Highlight | undefined {
    const highlight = highlights.get(id);
    if (!highlight) return undefined;

    Object.assign(highlight, updates);
    return highlight;
}

export function deleteHighlight(id: string): boolean {
    const highlight = highlights.get(id);
    if (!highlight) return false;

    highlights.delete(id);
    sessionHighlights.get(highlight.sessionId)?.delete(id);
    return true;
}

// =====================================================================
// Auto-Detection Rules
// =====================================================================

interface BattleState {
    driverA: string;
    driverB: string;
    startMs: number;
    minGap: number;
}

const activeBattles = new Map<string, BattleState>();

/**
 * Check for sustained battle (gap < 0.5s for > 8s)
 */
export function checkForBattle(
    sessionId: string,
    driverA: string,
    driverB: string,
    gap: number,
    sessionTimeMs: number
): Highlight | null {
    const key = `${sessionId}:${driverA}:${driverB}`;

    if (gap < 0.5) {
        const existing = activeBattles.get(key);
        if (existing) {
            existing.minGap = Math.min(existing.minGap, gap);

            // Check if battle sustained for 8+ seconds
            if (sessionTimeMs - existing.startMs >= 8000) {
                activeBattles.delete(key);
                return createHighlight({
                    sessionId,
                    type: 'battle',
                    startMs: existing.startMs,
                    endMs: sessionTimeMs,
                    subjectDriverIds: [driverA, driverB],
                    title: `Battle: ${driverA} vs ${driverB}`,
                    notes: `Min gap: ${existing.minGap.toFixed(3)}s`,
                }, 'system');
            }
        } else {
            activeBattles.set(key, {
                driverA,
                driverB,
                startMs: sessionTimeMs,
                minGap: gap,
            });
        }
    } else {
        activeBattles.delete(key);
    }

    return null;
}

/**
 * Create incident highlight from ControlBox incident.
 */
export function createIncidentHighlight(
    sessionId: string,
    incidentId: string,
    involvedDriverIds: string[],
    sessionTimeMs: number,
    description: string
): Highlight {
    return createHighlight({
        sessionId,
        type: 'incident',
        startMs: sessionTimeMs - 10000, // 10s before
        endMs: sessionTimeMs + 5000,    // 5s after
        subjectDriverIds: involvedDriverIds,
        title: `Incident: ${description}`,
        notes: `Incident ID: ${incidentId}`,
        visibility: 'race_control',
    }, 'system');
}

/**
 * Create fastest lap highlight.
 */
export function createFastestLapHighlight(
    sessionId: string,
    driverId: string,
    lapTime: number,
    lapNumber: number,
    sessionTimeMs: number
): Highlight {
    const lapDurationMs = lapTime * 1000;
    return createHighlight({
        sessionId,
        type: 'fastest_lap',
        startMs: sessionTimeMs - lapDurationMs,
        endMs: sessionTimeMs,
        subjectDriverIds: [driverId],
        title: 'Fastest Lap',
        notes: `${formatLapTime(lapTime)} on lap ${lapNumber}`,
    }, 'system');
}

/**
 * Create lead change highlight.
 */
export function createLeadChangeHighlight(
    sessionId: string,
    newLeader: string,
    previousLeader: string,
    sessionTimeMs: number
): Highlight {
    return createHighlight({
        sessionId,
        type: 'lead_change',
        startMs: sessionTimeMs - 5000,
        endMs: sessionTimeMs + 2000,
        subjectDriverIds: [newLeader, previousLeader],
        title: 'Lead Change',
        notes: `${newLeader} takes the lead from ${previousLeader}`,
    }, 'system');
}

// =====================================================================
// Helpers
// =====================================================================

function generateTitle(type: HighlightType): string {
    const titles: Record<HighlightType, string> = {
        incident: 'Incident',
        battle: 'Battle',
        lead_change: 'Lead Change',
        fastest_lap: 'Fastest Lap',
        pit_stop: 'Pit Stop',
        custom: 'Highlight',
    };
    return titles[type] || 'Highlight';
}

function formatLapTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : secs;
}

// =====================================================================
// Export for API routes
// =====================================================================

export const highlightsRegistry = {
    create: createHighlight,
    get: getHighlight,
    getBySession: getSessionHighlights,
    update: updateHighlight,
    delete: deleteHighlight,
    checkForBattle,
    createIncidentHighlight,
    createFastestLapHighlight,
    createLeadChangeHighlight,
};

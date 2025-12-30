// =====================================================================
// Role-Specific Views (Week 16)
// Tailored report generation for each role.
// =====================================================================

import type {
    PostRaceReport,
    ReviewRole,
    KeyMoment,
    TimelineEvent,
    ExecutionSignal,
    ContextSignal,
} from './report.model.js';

// =====================================================================
// View Configurations
// =====================================================================

export interface RoleViewConfig {
    role: ReviewRole;
    label: string;
    description: string;

    // Content inclusion
    includeExecutionSignals: boolean;
    includeContextSignals: boolean;
    contextScope: 'local' | 'team' | 'field';

    // Detail level
    maxKeyMoments: number;
    maxTimelineEvents: number;
    showConfidenceNotes: boolean;

    // UI hints
    collapsibleByDefault: boolean;
    summaryFirst: boolean;
}

export const ROLE_VIEW_CONFIGS: Record<ReviewRole, RoleViewConfig> = {
    driver: {
        role: 'driver',
        label: 'Post-Session Intelligence',
        description: 'Your race, explained.',
        includeExecutionSignals: true,
        includeContextSignals: true,
        contextScope: 'local',
        maxKeyMoments: 5,
        maxTimelineEvents: 20,
        showConfidenceNotes: false,
        collapsibleByDefault: true,
        summaryFirst: true,
    },

    team: {
        role: 'team',
        label: 'Session Debrief',
        description: 'Strategy and interaction context.',
        includeExecutionSignals: true,
        includeContextSignals: true,
        contextScope: 'team',
        maxKeyMoments: 10,
        maxTimelineEvents: 50,
        showConfidenceNotes: true,
        collapsibleByDefault: false,
        summaryFirst: true,
    },

    race_control: {
        role: 'race_control',
        label: 'Session Record',
        description: 'Incident timelines and decision audit.',
        includeExecutionSignals: false,
        includeContextSignals: true,
        contextScope: 'field',
        maxKeyMoments: 20,
        maxTimelineEvents: 100,
        showConfidenceNotes: true,
        collapsibleByDefault: false,
        summaryFirst: false,
    },

    broadcast: {
        role: 'broadcast',
        label: 'Race Narrative',
        description: 'Public-safe story beats.',
        includeExecutionSignals: false,
        includeContextSignals: true,
        contextScope: 'field',
        maxKeyMoments: 8,
        maxTimelineEvents: 30,
        showConfidenceNotes: false,
        collapsibleByDefault: true,
        summaryFirst: true,
    },
};

// =====================================================================
// View Filtering
// =====================================================================

/**
 * Filter report for specific role view.
 */
export function filterReportForRole(
    report: PostRaceReport,
    targetRole: ReviewRole,
    driverId?: string
): PostRaceReport {
    const config = ROLE_VIEW_CONFIGS[targetRole];

    return {
        ...report,
        role: targetRole,

        // Filter timeline
        timeline: filterTimeline(report.timeline, config, driverId),

        // Filter key moments
        keyMoments: filterKeyMoments(report.keyMoments, config, driverId),

        // Filter signals
        executionSignals: config.includeExecutionSignals
            ? report.executionSignals
            : [],

        contextSignals: filterContextSignals(report.contextSignals, config, driverId),

        // Confidence notes
        confidenceNotes: config.showConfidenceNotes
            ? report.confidenceNotes
            : [],
    };
}

function filterTimeline(
    events: TimelineEvent[],
    config: RoleViewConfig,
    driverId?: string
): TimelineEvent[] {
    let filtered = events;

    // For driver view, focus on events involving them
    if (config.role === 'driver' && driverId) {
        filtered = events.filter(e =>
            !e.drivers || e.drivers.length === 0 || e.drivers.includes(driverId)
        );
    }

    // Limit count
    return filtered.slice(0, config.maxTimelineEvents);
}

function filterKeyMoments(
    moments: KeyMoment[],
    config: RoleViewConfig,
    driverId?: string
): KeyMoment[] {
    let filtered = moments;

    // For driver view, focus on moments involving them
    if (config.role === 'driver' && driverId) {
        filtered = moments.filter(m =>
            m.involvedDrivers.includes(driverId)
        );
    }

    // Sort by confidence and limit
    return filtered
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, config.maxKeyMoments);
}

function filterContextSignals(
    signals: ContextSignal[],
    config: RoleViewConfig,
    driverId?: string
): ContextSignal[] {
    return signals.filter(s => {
        // Filter by scope
        switch (config.contextScope) {
            case 'local':
                return s.scope === 'driver_local' ||
                    (driverId && s.relatedDrivers?.includes(driverId));
            case 'team':
                return s.scope !== 'field_wide' ||
                    (driverId && s.relatedDrivers?.includes(driverId));
            case 'field':
                return true;
        }
    });
}

// =====================================================================
// Summary Generation
// =====================================================================

/**
 * Generate role-appropriate summary.
 */
export function generateRoleSummary(
    report: PostRaceReport,
    role: ReviewRole
): string {
    const config = ROLE_VIEW_CONFIGS[role];
    const moments = report.keyMoments.slice(0, 3);

    const lines: string[] = [];

    // Duration
    const durationMin = Math.round((report.duration.end - report.duration.start) / 60000);
    lines.push(`Session duration: ${durationMin} minutes.`);

    // Key moments count
    if (moments.length > 0) {
        lines.push(`${moments.length} notable moments identified.`);
    }

    // Role-specific additions
    switch (role) {
        case 'driver':
            lines.push('Review the timeline to understand the race situation at each point.');
            break;
        case 'team':
            lines.push('Strategy context and multi-driver interactions are highlighted.');
            break;
        case 'race_control':
            lines.push('Full incident timeline and decision points are available.');
            break;
        case 'broadcast':
            lines.push('Key story beats for narrative construction.');
            break;
    }

    return lines.join(' ');
}

// =====================================================================
// UI Section Definitions
// =====================================================================

export interface ReportSection {
    id: string;
    label: string;
    collapsible: boolean;
    defaultCollapsed: boolean;
    order: number;
}

export const REPORT_SECTIONS: Record<ReviewRole, ReportSection[]> = {
    driver: [
        { id: 'summary', label: 'Summary', collapsible: false, defaultCollapsed: false, order: 0 },
        { id: 'key_moments', label: 'Key Moments', collapsible: true, defaultCollapsed: false, order: 1 },
        { id: 'execution', label: 'Car — Execution', collapsible: true, defaultCollapsed: true, order: 2 },
        { id: 'context', label: 'Race — Context', collapsible: true, defaultCollapsed: true, order: 3 },
        { id: 'timeline', label: 'Full Timeline', collapsible: true, defaultCollapsed: true, order: 4 },
    ],
    team: [
        { id: 'summary', label: 'Summary', collapsible: false, defaultCollapsed: false, order: 0 },
        { id: 'key_moments', label: 'Key Moments', collapsible: true, defaultCollapsed: false, order: 1 },
        { id: 'strategy', label: 'Strategy Context', collapsible: true, defaultCollapsed: false, order: 2 },
        { id: 'execution', label: 'Execution Signals', collapsible: true, defaultCollapsed: true, order: 3 },
        { id: 'timeline', label: 'Full Timeline', collapsible: true, defaultCollapsed: true, order: 4 },
    ],
    race_control: [
        { id: 'incidents', label: 'Incident Timeline', collapsible: false, defaultCollapsed: false, order: 0 },
        { id: 'key_moments', label: 'Key Moments', collapsible: true, defaultCollapsed: false, order: 1 },
        { id: 'decisions', label: 'Decision Audit', collapsible: true, defaultCollapsed: false, order: 2 },
        { id: 'timeline', label: 'Full Timeline', collapsible: true, defaultCollapsed: true, order: 3 },
        { id: 'confidence', label: 'Confidence Notes', collapsible: true, defaultCollapsed: true, order: 4 },
    ],
    broadcast: [
        { id: 'summary', label: 'Race Story', collapsible: false, defaultCollapsed: false, order: 0 },
        { id: 'key_moments', label: 'Story Beats', collapsible: true, defaultCollapsed: false, order: 1 },
        { id: 'timeline', label: 'Timeline', collapsible: true, defaultCollapsed: true, order: 2 },
    ],
};

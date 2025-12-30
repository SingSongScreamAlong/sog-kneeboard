// =====================================================================
// Report Generator (Week 16)
// Generates post-race intelligence reports from session data.
// =====================================================================

import { pool } from '../db/pool.js';
import {
    type PostRaceReport,
    type ReviewRole,
    type TimelineEvent,
    type KeyMoment,
    type ExecutionSignal,
    type ContextSignal,
    type KeyMomentType,
    KEY_MOMENT_THRESHOLDS,
    containsBannedReviewLanguage,
    createPostRaceReport,
} from './report.model.js';
import { filterReportForRole, generateRoleSummary } from './role-views.js';

// =====================================================================
// Report Generation
// =====================================================================

export async function generatePostRaceReport(
    sessionId: string,
    role: ReviewRole,
    driverId?: string
): Promise<PostRaceReport> {
    // Create base report
    const report = createPostRaceReport(sessionId, role);

    // Get session info
    const sessionInfo = await getSessionInfo(sessionId);
    if (!sessionInfo) {
        report.summary = 'Session data not available.';
        return report;
    }

    report.duration = {
        start: sessionInfo.startTime,
        end: sessionInfo.endTime,
    };

    // Build timeline
    report.timeline = await buildTimeline(sessionId);

    // Detect key moments
    report.keyMoments = await detectKeyMoments(sessionId, report.timeline);

    // Extract signals
    report.executionSignals = await extractExecutionSignals(sessionId, driverId);
    report.contextSignals = await extractContextSignals(sessionId);

    // Generate summary
    report.summary = generateRoleSummary(report, role);

    // Add confidence notes
    report.confidenceNotes = generateConfidenceNotes(report);

    // Filter for role
    const filtered = filterReportForRole(report, role, driverId);

    // Validate language
    validateReportLanguage(filtered);

    return filtered;
}

// =====================================================================
// Session Info
// =====================================================================

interface SessionInfo {
    startTime: number;
    endTime: number;
    trackName: string;
    driverCount: number;
}

async function getSessionInfo(sessionId: string): Promise<SessionInfo | null> {
    try {
        const result = await pool.query(
            `SELECT 
                EXTRACT(EPOCH FROM start_time) * 1000 as start_time,
                EXTRACT(EPOCH FROM end_time) * 1000 as end_time,
                track_name,
                driver_count
             FROM sessions WHERE id = $1`,
            [sessionId]
        );

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            startTime: parseInt(row.start_time, 10),
            endTime: parseInt(row.end_time, 10) || Date.now(),
            trackName: row.track_name || 'Unknown',
            driverCount: row.driver_count || 0,
        };
    } catch {
        return null;
    }
}

// =====================================================================
// Timeline Building
// =====================================================================

async function buildTimeline(sessionId: string): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];
    let eventId = 0;

    // Get incidents
    try {
        const incidents = await pool.query(
            `SELECT timestamp, type, drivers, metadata FROM incidents
             WHERE session_id = $1 ORDER BY timestamp`,
            [sessionId]
        );

        for (const row of incidents.rows) {
            events.push({
                id: `event-${++eventId}`,
                type: 'incident',
                timestamp: parseInt(row.timestamp, 10),
                description: formatIncidentDescription(row.type),
                drivers: row.drivers || [],
                metadata: row.metadata,
            });
        }
    } catch { /* Table may not exist */ }

    // Get position changes
    try {
        const positions = await pool.query(
            `SELECT timestamp, driver_id, old_position, new_position FROM position_changes
             WHERE session_id = $1 ORDER BY timestamp`,
            [sessionId]
        );

        for (const row of positions.rows) {
            events.push({
                id: `event-${++eventId}`,
                type: 'position_change',
                timestamp: parseInt(row.timestamp, 10),
                description: `Position changed from P${row.old_position} to P${row.new_position}`,
                drivers: [row.driver_id],
            });
        }
    } catch { /* Table may not exist */ }

    // Get pit stops
    try {
        const pits = await pool.query(
            `SELECT timestamp, driver_id, type FROM pit_events
             WHERE session_id = $1 ORDER BY timestamp`,
            [sessionId]
        );

        for (const row of pits.rows) {
            events.push({
                id: `event-${++eventId}`,
                type: row.type === 'entry' ? 'pit_entry' : 'pit_exit',
                timestamp: parseInt(row.timestamp, 10),
                description: row.type === 'entry' ? 'Entered pit lane' : 'Exited pit lane',
                drivers: [row.driver_id],
            });
        }
    } catch { /* Table may not exist */ }

    // Sort by timestamp
    return events.sort((a, b) => a.timestamp - b.timestamp);
}

function formatIncidentDescription(type: string): string {
    const descriptions: Record<string, string> = {
        contact: 'Contact occurred',
        off_track: 'Car went off track',
        spin: 'Car spun',
        yellow_flag: 'Yellow flag shown',
        safety_car: 'Safety car deployed',
    };
    return descriptions[type] || 'Incident occurred';
}

// =====================================================================
// Key Moment Detection
// =====================================================================

async function detectKeyMoments(
    sessionId: string,
    timeline: TimelineEvent[]
): Promise<KeyMoment[]> {
    const moments: KeyMoment[] = [];
    let momentId = 0;

    // Detect from incidents
    const incidentEvents = timeline.filter(e => e.type === 'incident');
    for (const event of incidentEvents) {
        moments.push(createKeyMomentFromEvent(
            `moment-${++momentId}`,
            'incident',
            event,
            'Incident on track',
            'Track conditions changed following this incident.'
        ));
    }

    // Detect lead changes
    const leadChanges = timeline.filter(
        e => e.type === 'position_change' &&
            (e.metadata as any)?.newPosition === 1
    );
    for (const event of leadChanges) {
        moments.push(createKeyMomentFromEvent(
            `moment-${++momentId}`,
            'lead_change',
            event,
            'Lead change',
            'Race leader position changed hands.'
        ));
    }

    // Detect prolonged battles (would need gap data)
    // This is a placeholder - real implementation would analyze gap data

    return moments;
}

function createKeyMomentFromEvent(
    id: string,
    type: KeyMomentType,
    event: TimelineEvent,
    title: string,
    whatChanged: string
): KeyMoment {
    return {
        id,
        type,
        startTime: event.timestamp,
        endTime: event.timestamp + 5000,  // 5 second window
        startLap: event.lap,
        endLap: event.lap,
        involvedDrivers: event.drivers || [],
        title,
        description: event.description,
        whatChanged,
        availableInformation: [
            'Position data at this timestamp',
            'Gap information to nearby cars',
        ],
        confidence: 0.8,
        relatedEventIds: [event.id],
    };
}

// =====================================================================
// Signal Extraction
// =====================================================================

async function extractExecutionSignals(
    sessionId: string,
    driverId?: string
): Promise<ExecutionSignal[]> {
    const signals: ExecutionSignal[] = [];

    // Would extract from telemetry trends
    // Placeholder implementation

    return signals;
}

async function extractContextSignals(sessionId: string): Promise<ContextSignal[]> {
    const signals: ContextSignal[] = [];

    // Would extract from race situation data
    // Placeholder implementation

    return signals;
}

// =====================================================================
// Confidence Notes
// =====================================================================

function generateConfidenceNotes(report: PostRaceReport): string[] {
    const notes: string[] = [];

    // Note on data completeness
    if (report.timeline.length < 10) {
        notes.push('Limited timeline data available for this session.');
    }

    // Note on key moment detection
    if (report.keyMoments.length === 0) {
        notes.push('No key moments met detection thresholds.');
    }

    // Low confidence moments
    const lowConfMoments = report.keyMoments.filter(m => m.confidence < 0.6);
    if (lowConfMoments.length > 0) {
        notes.push(`${lowConfMoments.length} moment(s) have moderate confidence.`);
    }

    return notes;
}

// =====================================================================
// Language Validation
// =====================================================================

function validateReportLanguage(report: PostRaceReport): void {
    // Check summary
    const summaryCheck = containsBannedReviewLanguage(report.summary);
    if (summaryCheck.hasBanned) {
        console.warn('Report summary contains banned language:', summaryCheck.found);
        report.summary = sanitizeText(report.summary, summaryCheck.found);
    }

    // Check key moments
    for (const moment of report.keyMoments) {
        const descCheck = containsBannedReviewLanguage(moment.description);
        if (descCheck.hasBanned) {
            moment.description = sanitizeText(moment.description, descCheck.found);
        }
    }
}

function sanitizeText(text: string, bannedFound: string[]): string {
    let result = text;
    for (const banned of bannedFound) {
        const regex = new RegExp(banned, 'gi');
        result = result.replace(regex, '');
    }
    return result.replace(/\s+/g, ' ').trim();
}

// =====================================================================
// Export
// =====================================================================

export const reportGenerator = {
    generatePostRaceReport,
};

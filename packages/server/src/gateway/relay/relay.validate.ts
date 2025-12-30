// =====================================================================
// Relay Message Validation (Week 1)
// Safe validation that never crashes the server.
// =====================================================================

import type { RelaySessionInfo, RelayTelemetry } from './relay.types.js';

export interface ValidationResult<T> {
    valid: boolean;
    data?: T;
    error?: string;
}

/**
 * Validate relay session_info message
 */
export function validateRelaySessionInfo(payload: unknown): ValidationResult<RelaySessionInfo> {
    if (!payload || typeof payload !== 'object') {
        return { valid: false, error: 'Payload must be an object' };
    }

    const p = payload as Record<string, unknown>;

    // Required fields
    if (p.type !== 'session_info') {
        return { valid: false, error: 'type must be "session_info"' };
    }

    if (typeof p.session_id !== 'string' || p.session_id.length === 0) {
        return { valid: false, error: 'session_id must be a non-empty string' };
    }

    // Validate session_id format: alphanumeric + underscore only
    if (!/^[a-zA-Z0-9_]+$/.test(p.session_id)) {
        return { valid: false, error: 'session_id contains invalid characters' };
    }

    if (typeof p.api_key !== 'string' || p.api_key.length === 0) {
        return { valid: false, error: 'api_key must be a non-empty string' };
    }

    if (typeof p.timestamp !== 'number' || !isFinite(p.timestamp)) {
        return { valid: false, error: 'timestamp must be a finite number' };
    }

    if (!p.data || typeof p.data !== 'object') {
        return { valid: false, error: 'data must be an object' };
    }

    return {
        valid: true,
        data: {
            type: 'session_info',
            session_id: p.session_id,
            timestamp: p.timestamp,
            data: p.data as RelaySessionInfo['data'],
            api_key: p.api_key,
            user_id: typeof p.user_id === 'string' ? p.user_id : undefined,
            team_id: typeof p.team_id === 'string' ? p.team_id : undefined,
        },
    };
}

/**
 * Validate relay telemetry message
 */
export function validateRelayTelemetry(payload: unknown): ValidationResult<RelayTelemetry> {
    if (!payload || typeof payload !== 'object') {
        return { valid: false, error: 'Payload must be an object' };
    }

    const p = payload as Record<string, unknown>;

    // Required fields
    if (p.type !== 'telemetry') {
        return { valid: false, error: 'type must be "telemetry"' };
    }

    if (typeof p.session_id !== 'string' || p.session_id.length === 0) {
        return { valid: false, error: 'session_id must be a non-empty string' };
    }

    if (typeof p.timestamp !== 'number' || !isFinite(p.timestamp)) {
        return { valid: false, error: 'timestamp must be a finite number' };
    }

    if (!p.data || typeof p.data !== 'object') {
        return { valid: false, error: 'data must be an object' };
    }

    // events is optional but must be an array if present
    let events: string[] = [];
    if (p.events !== undefined) {
        if (!Array.isArray(p.events)) {
            return { valid: false, error: 'events must be an array' };
        }
        events = p.events.filter((e): e is string => typeof e === 'string');
    }

    return {
        valid: true,
        data: {
            type: 'telemetry',
            session_id: p.session_id,
            timestamp: p.timestamp,
            data: p.data as RelayTelemetry['data'],
            events: events as RelayTelemetry['events'],
        },
    };
}

/**
 * Check if message type is known
 */
export function getMessageType(payload: unknown): 'session_info' | 'telemetry' | 'unknown' {
    if (!payload || typeof payload !== 'object') {
        return 'unknown';
    }
    const p = payload as Record<string, unknown>;
    if (p.type === 'session_info') return 'session_info';
    if (p.type === 'telemetry') return 'telemetry';
    return 'unknown';
}

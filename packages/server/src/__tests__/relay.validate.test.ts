// =====================================================================
// Relay Validation Tests (Week 1)
// Unit tests for validateRelaySessionInfo and validateRelayTelemetry
// =====================================================================

import { describe, it, expect } from 'vitest';
import {
    validateRelaySessionInfo,
    validateRelayTelemetry,
    getMessageType,
} from '../gateway/relay/relay.validate.js';

describe('validateRelaySessionInfo', () => {
    it('rejects non-object payloads', () => {
        expect(validateRelaySessionInfo(null).valid).toBe(false);
        expect(validateRelaySessionInfo(undefined).valid).toBe(false);
        expect(validateRelaySessionInfo('string').valid).toBe(false);
        expect(validateRelaySessionInfo(123).valid).toBe(false);
    });

    it('rejects payload with wrong type', () => {
        const result = validateRelaySessionInfo({
            type: 'wrong_type',
            session_id: 'abc123',
            timestamp: Date.now() / 1000,
            api_key: 'test-key',
            data: {},
        });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('type');
    });

    it('rejects payload with empty session_id', () => {
        const result = validateRelaySessionInfo({
            type: 'session_info',
            session_id: '',
            timestamp: Date.now() / 1000,
            api_key: 'test-key',
            data: {},
        });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('session_id');
    });

    it('rejects payload with invalid session_id characters', () => {
        const result = validateRelaySessionInfo({
            type: 'session_info',
            session_id: 'abc-123!@#',
            timestamp: Date.now() / 1000,
            api_key: 'test-key',
            data: {},
        });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('invalid characters');
    });

    it('rejects payload without api_key', () => {
        const result = validateRelaySessionInfo({
            type: 'session_info',
            session_id: 'abc123',
            timestamp: Date.now() / 1000,
            data: {},
        });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('api_key');
    });

    it('accepts minimal valid payload', () => {
        const result = validateRelaySessionInfo({
            type: 'session_info',
            session_id: 'test_session_123',
            timestamp: Date.now() / 1000,
            api_key: 'test-api-key',
            data: {},
        });
        expect(result.valid).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.session_id).toBe('test_session_123');
    });

    it('accepts full valid payload with session data', () => {
        const result = validateRelaySessionInfo({
            type: 'session_info',
            session_id: 'race_2024_001',
            timestamp: Date.now() / 1000,
            api_key: 'prod-key-abc',
            user_id: 'user123',
            team_id: 'team456',
            data: {
                TrackName: 'Silverstone',
                DriverName: 'Max Speed',
                SessionType: 'Race',
                TrackLength: 5891,
            },
        });
        expect(result.valid).toBe(true);
        expect(result.data!.data.TrackName).toBe('Silverstone');
        expect(result.data!.user_id).toBe('user123');
    });
});

describe('validateRelayTelemetry', () => {
    it('rejects non-object payloads', () => {
        expect(validateRelayTelemetry(null).valid).toBe(false);
        expect(validateRelayTelemetry([]).valid).toBe(false);
    });

    it('rejects payload with wrong type', () => {
        const result = validateRelayTelemetry({
            type: 'session_info',
            session_id: 'abc123',
            timestamp: Date.now() / 1000,
            data: {},
        });
        expect(result.valid).toBe(false);
    });

    it('accepts minimal valid telemetry', () => {
        const result = validateRelayTelemetry({
            type: 'telemetry',
            session_id: 'abc123',
            timestamp: Date.now() / 1000,
            data: {},
        });
        expect(result.valid).toBe(true);
        expect(result.data!.events).toEqual([]);
    });

    it('accepts telemetry with events', () => {
        const result = validateRelayTelemetry({
            type: 'telemetry',
            session_id: 'abc123',
            timestamp: Date.now() / 1000,
            data: {
                Speed: 280.5,
                RPM: 12500,
                Gear: 7,
                Lap: 15,
            },
            events: ['lap_completed', 'sector_change'],
        });
        expect(result.valid).toBe(true);
        expect(result.data!.data.Speed).toBe(280.5);
        expect(result.data!.events).toContain('lap_completed');
    });

    it('filters non-string events', () => {
        const result = validateRelayTelemetry({
            type: 'telemetry',
            session_id: 'abc123',
            timestamp: Date.now() / 1000,
            data: {},
            events: ['lap_completed', 123, null, 'pit_entry'],
        });
        expect(result.valid).toBe(true);
        expect(result.data!.events).toEqual(['lap_completed', 'pit_entry']);
    });
});

describe('getMessageType', () => {
    it('returns unknown for non-objects', () => {
        expect(getMessageType(null)).toBe('unknown');
        expect(getMessageType('string')).toBe('unknown');
    });

    it('identifies session_info', () => {
        expect(getMessageType({ type: 'session_info' })).toBe('session_info');
    });

    it('identifies telemetry', () => {
        expect(getMessageType({ type: 'telemetry' })).toBe('telemetry');
    });

    it('returns unknown for other types', () => {
        expect(getMessageType({ type: 'other' })).toBe('unknown');
        expect(getMessageType({})).toBe('unknown');
    });
});

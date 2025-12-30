// =====================================================================
// Translation Tests (Week 3)
// Tests for relay-to-canonical translation and deduplication.
// =====================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
    translateToThinFrame,
    translateToFatFrame,
    setDriverIdContext,
    extractDriverId,
} from '../gateway/translation/relay-to-canonical.js';
import {
    checkDedupe,
    updateDriverState,
    getOrCreateSession,
} from '../gateway/sessions/session.registry.js';
import type { RelayTelemetry } from '../gateway/relay/relay.types.js';

describe('translateToThinFrame', () => {
    const baseRelay: RelayTelemetry = {
        type: 'telemetry',
        session_id: 'test_session',
        timestamp: Date.now() / 1000,
        data: {
            SessionTime: 1234.567,
            Speed: 85.5,  // m/s
            Gear: 5,
            Lap: 12,
            LapDist: 0.75,
            PlayerCarPosition: 3,
            LapLastLapTime: 92.456,
            LapBestLapTime: 91.234,
            LapCurrentLapTime: 45.123,
        },
        events: [],
    };

    beforeEach(() => {
        setDriverIdContext({
            DriverID: 12345,
            DriverName: 'Test Driver',
        });
    });

    it('translates speed correctly (m/s preserved)', () => {
        const frame = translateToThinFrame('test_session', baseRelay);
        expect(frame.driver.speed).toBe(85.5);
    });

    it('translates sessionTimeMs from seconds to ms', () => {
        const frame = translateToThinFrame('test_session', baseRelay);
        expect(frame.sessionTimeMs).toBe(1234567);
    });

    it('translates gear correctly', () => {
        const frame = translateToThinFrame('test_session', baseRelay);
        expect(frame.driver.gear).toBe(5);
    });

    it('translates lap number correctly', () => {
        const frame = translateToThinFrame('test_session', baseRelay);
        expect(frame.driver.lapNumber).toBe(12);
    });

    it('translates track position correctly', () => {
        const frame = translateToThinFrame('test_session', baseRelay);
        expect(frame.driver.trackPosition).toBe(3);
    });

    it('translates lap times correctly (seconds preserved)', () => {
        const frame = translateToThinFrame('test_session', baseRelay);
        expect(frame.driver.lastLapTime).toBe(92.456);
        expect(frame.driver.bestLapTime).toBe(91.234);
        expect(frame.driver.currentLapTime).toBe(45.123);
    });

    it('uses driver ID from context', () => {
        const frame = translateToThinFrame('test_session', baseRelay);
        expect(frame.driver.driverId).toBe('12345');
        expect(frame.driver.driverName).toBe('Test Driver');
    });

    it('handles missing fields gracefully', () => {
        const sparse: RelayTelemetry = {
            type: 'telemetry',
            session_id: 'test_session',
            timestamp: Date.now() / 1000,
            data: {},
            events: [],
        };
        const frame = translateToThinFrame('test_session', sparse);
        expect(frame.driver.speed).toBe(0);
        expect(frame.driver.gear).toBe(0);
        expect(frame.driver.lapNumber).toBe(0);
    });
});

describe('translateToFatFrame', () => {
    const relay: RelayTelemetry = {
        type: 'telemetry',
        session_id: 'test_session',
        timestamp: Date.now() / 1000,
        data: {
            SessionTime: 100,
            Speed: 50,
            Throttle: 0.85,
            Brake: 0.2,
            Clutch: 0.0,
            SteeringWheelAngle: 0.15,
            RPM: 8500,
            FuelLevel: 35.5,
            FuelUsePerHour: 2.3,
            TrackTemp: 32,
            AirTemp: 24,
        },
        events: [],
    };

    it('includes all thin frame fields', () => {
        const frame = translateToFatFrame('test_session', relay);
        expect(frame.driver.speed).toBe(50);
    });

    it('translates input values', () => {
        const frame = translateToFatFrame('test_session', relay);
        expect(frame.driver.throttle).toBe(0.85);
        expect(frame.driver.brake).toBe(0.2);
        expect(frame.driver.clutch).toBe(0.0);
        expect(frame.driver.steering).toBe(0.15);
        expect(frame.driver.rpm).toBe(8500);
    });

    it('translates fuel values', () => {
        const frame = translateToFatFrame('test_session', relay);
        expect(frame.driver.fuelLevel).toBe(35.5);
        expect(frame.driver.fuelUsePerHour).toBe(2.3);
    });

    it('translates temperature values', () => {
        const frame = translateToFatFrame('test_session', relay);
        expect(frame.driver.trackTemp).toBe(32);
        expect(frame.driver.airTemp).toBe(24);
    });
});

describe('checkDedupe', () => {
    const sessionId = 'dedupe_test_session';
    const driverId = 'driver_1';

    it('accepts first frame', () => {
        const result = checkDedupe(sessionId, driverId, 1000);
        expect(result.accept).toBe(true);
    });

    it('rejects duplicate timestamp', () => {
        checkDedupe(sessionId, 'driver_dup', 2000);
        const result = checkDedupe(sessionId, 'driver_dup', 2000);
        expect(result.accept).toBe(false);
        expect(result.reason).toBe('duplicate');
    });

    it('accepts newer timestamp', () => {
        checkDedupe(sessionId, 'driver_new', 3000);
        const result = checkDedupe(sessionId, 'driver_new', 3100);
        expect(result.accept).toBe(true);
    });

    it('accepts late frame within tolerance', () => {
        checkDedupe(sessionId, 'driver_late', 5000);
        // Late by 30ms (within 50ms tolerance)
        const result = checkDedupe(sessionId, 'driver_late', 4970);
        expect(result.accept).toBe(true);
    });

    it('rejects frame too far out of order', () => {
        checkDedupe(sessionId, 'driver_ooo', 6000);
        // Late by 500ms (beyond 250ms window)
        const result = checkDedupe(sessionId, 'driver_ooo', 5500);
        expect(result.accept).toBe(false);
        expect(result.reason).toBe('out_of_order');
    });
});

describe('extractDriverId', () => {
    it('uses sessionDriverId from context', () => {
        setDriverIdContext({ DriverID: 99999, DriverName: 'Context Driver' });
        expect(extractDriverId()).toBe('99999');
    });

    it('falls back to player index', () => {
        setDriverIdContext({});  // No DriverID
        expect(extractDriverId()).toContain('player_');
    });
});

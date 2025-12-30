// =====================================================================
// Relay Gateway Integration Test (Week 1)
// Tests end-to-end flow: relay client → gateway → dashboard observer
// =====================================================================

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer, type Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as SocketIOClient, type Socket as ClientSocket } from 'socket.io-client';
import { initializeRelayNamespace } from '../gateway/relay/index.js';

// Mock the config for tests
vi.mock('../config/index.js', () => ({
    config: {
        nodeEnv: 'test',
        corsOrigins: ['http://localhost:3000'],
    },
}));

describe('Relay Gateway Integration', () => {
    let httpServer: HttpServer;
    let io: SocketIOServer;
    let relayClient: ClientSocket;
    let dashboardClient: ClientSocket;
    const PORT = 3099; // Test port

    beforeAll(async () => {
        // Create server
        httpServer = createServer();
        io = new SocketIOServer(httpServer, {
            cors: { origin: '*' },
        });

        // Initialize relay namespace
        initializeRelayNamespace(io);

        // Start server
        await new Promise<void>((resolve) => {
            httpServer.listen(PORT, () => resolve());
        });

        // Create clients
        relayClient = SocketIOClient(`http://localhost:${PORT}/relay`, {
            transports: ['websocket'],
        });

        dashboardClient = SocketIOClient(`http://localhost:${PORT}`, {
            transports: ['websocket'],
        });

        // Wait for connections
        await Promise.all([
            new Promise<void>((resolve) => relayClient.on('connect', () => resolve())),
            new Promise<void>((resolve) => dashboardClient.on('connect', () => resolve())),
        ]);
    });

    afterAll(async () => {
        // Cleanup
        relayClient?.disconnect();
        dashboardClient?.disconnect();
        io?.close();
        httpServer?.close();
    });

    it('relay client connects to /relay namespace', () => {
        expect(relayClient.connected).toBe(true);
    });

    it('dashboard client connects to main namespace', () => {
        expect(dashboardClient.connected).toBe(true);
    });

    it('relay sends session_info and receives error for missing api_key', async () => {
        const errorPromise = new Promise<{ error: string; type: string }>((resolve) => {
            relayClient.once('relay:error', (data) => resolve(data));
        });

        relayClient.emit('session_info', {
            type: 'session_info',
            session_id: 'test_session',
            timestamp: Date.now() / 1000,
            // Missing api_key
            data: {},
        });

        const error = await errorPromise;
        expect(error.error).toContain('api_key');
    });

    it('relay sends valid session_info and creates session', async () => {
        const sessionId = `integration_test_${Date.now()}`;

        // Dashboard joins the session room first
        dashboardClient.emit('room:join', { sessionId });

        // Wait for join acknowledgment
        await new Promise<void>((resolve) => {
            dashboardClient.once('room:joined', () => resolve());
        });

        // Relay sends session_info
        const sessionReceivedPromise = new Promise<unknown>((resolve) => {
            dashboardClient.once('relay:session_info_received', (data) => resolve(data));
        });

        relayClient.emit('session_info', {
            type: 'session_info',
            session_id: sessionId,
            timestamp: Date.now() / 1000,
            api_key: 'test-integration-key',
            data: {
                TrackName: 'Test Track',
                DriverName: 'Test Driver',
                SessionType: 'Race',
            },
        });

        const received = await sessionReceivedPromise as { sessionId: string; isNew: boolean };
        expect(received.sessionId).toBe(sessionId);
        expect(received.isNew).toBe(true);
    });

    it('relay sends telemetry and dashboard receives relay:telemetry_raw', async () => {
        const sessionId = `telemetry_test_${Date.now()}`;

        // First send session_info to establish session
        relayClient.emit('session_info', {
            type: 'session_info',
            session_id: sessionId,
            timestamp: Date.now() / 1000,
            api_key: 'test-key',
            data: { TrackName: 'Telemetry Track' },
        });

        // Wait a bit for session to be created
        await new Promise((r) => setTimeout(r, 50));

        // Dashboard joins session room
        dashboardClient.emit('room:join', { sessionId });
        await new Promise<void>((resolve) => {
            dashboardClient.once('room:joined', () => resolve());
        });

        // Send telemetry
        const telemetryPromise = new Promise<unknown>((resolve) => {
            dashboardClient.once('relay:telemetry_raw', (data) => resolve(data));
        });

        relayClient.emit('telemetry', {
            type: 'telemetry',
            session_id: sessionId,
            timestamp: Date.now() / 1000,
            data: {
                Speed: 285.5,
                RPM: 12500,
                Gear: 7,
                Lap: 10,
                SessionTime: 1234.56,
            },
            events: ['lap_completed'],
        });

        const telemetry = await telemetryPromise as {
            sessionId: string;
            speed: number;
            rpm: number;
            sessionTimeMs: number;
            eventsCount: number;
        };

        expect(telemetry.sessionId).toBe(sessionId);
        expect(telemetry.speed).toBe(285.5);
        expect(telemetry.rpm).toBe(12500);
        expect(telemetry.sessionTimeMs).toBe(1234560); // Converted to ms
        expect(telemetry.eventsCount).toBe(1);
    });
});

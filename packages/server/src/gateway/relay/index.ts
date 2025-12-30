// =====================================================================
// Relay Namespace (Week 1 + Weeks 3-6 Integration)
// Socket.IO /relay namespace for BlackBox relay agent connections.
// =====================================================================

import type { Server, Socket } from 'socket.io';
import {
    handleSessionInfo,
    handleTelemetry,
    handleRelayDisconnect,
    handleUnknownMessage,
} from './relay.handlers.js';
// Week 3: Timing generator
import { startTimingGenerator, stopTimingGenerator } from '../timing/timing.generator.js';
// Week 5: Observability
import { metricsRegistry, startMetricsLogging } from '../../observability/metrics.registry.js';
// Week 6: Persistence
import { startPersistence, stopPersistence } from '../../persistence/persistence.manager.js';


export function initializeRelayNamespace(io: Server): void {
    const relayNsp = io.of('/relay');

    console.log('🛰️  Relay gateway namespace initialized at /relay');

    // =====================================================================
    // Week 3-6: Start supporting services
    // =====================================================================

    // Start timing generator (2Hz per session)
    startTimingGenerator(relayNsp);
    metricsRegistry.setTimingGeneratorReady(true);

    // Start persistence pipeline (Week 6)
    startPersistence();

    // Start metrics logging (Week 5)
    startMetricsLogging();

    // Mark subscription registry as ready (initialized on import)
    metricsRegistry.setSubscriptionRegistryReady(true);

    // Mark websocket as ready
    metricsRegistry.setWebsocketReady(true);

    console.log('✅ All gateway services started');

    // =====================================================================
    // Connection handlers
    // =====================================================================

    relayNsp.on('connection', (socket: Socket) => {
        console.log(`🛰️  Relay connected: ${socket.id}`);

        // Handle session_info message
        socket.on('session_info', async (payload: unknown) => {
            try {
                await handleSessionInfo(socket, relayNsp, payload);
            } catch (err) {
                console.error(`❌ Relay ${socket.id}: session_info handler error:`, err);
            }
        });

        // Handle telemetry message
        socket.on('telemetry', (payload: unknown) => {
            try {
                handleTelemetry(socket, relayNsp, payload);
            } catch (err) {
                // Silent fail for telemetry errors (too noisy)
            }
        });

        // Handle any other message (for debugging)
        socket.onAny((event: string, payload: unknown) => {
            if (event !== 'session_info' && event !== 'telemetry') {
                handleUnknownMessage(socket, payload);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            handleRelayDisconnect(socket);
        });
    });
}

/**
 * Shutdown all gateway services (for graceful shutdown)
 */
export function shutdownGatewayServices(): void {
    console.log('🛑 Shutting down gateway services...');
    stopTimingGenerator();
    stopPersistence();
    console.log('✅ Gateway services stopped');
}

// Re-export types and utilities
export * from './relay.types.js';
export * from './relay.validate.js';
export * from './relay.auth.js';
export * from './relay.metrics.js';
export * from './relay.handlers.js';


// =====================================================================
// Gateway Module Index
// Exports all gateway namespaces for WebSocket server initialization.
// =====================================================================

export { initializeRelayNamespace, shutdownGatewayServices } from './relay/index.js';

// Relay module (Week 1)
export * from './relay/relay.types.js';
export * from './relay/relay.validate.js';
export * from './relay/relay.auth.js';
// NOTE: relay.metrics exports getSession/getAllSessions which conflict with sessions module
// Use explicit imports where needed

// Subscriptions module (Week 2)
export * from './subscriptions/index.js';

// Translation module (Week 3)
export * from './translation/index.js';

// Sessions module (Week 3) - canonical session registry
export {
    getOrCreateSession,
    updateSessionFromSessionInfo,
    checkDedupe,
    updateDriverState,
    generateTimingSnapshot,
    shouldEmitTiming,
    markTimingEmitted,
    getAllSessionIds,
    type SessionRegistryEntry,
    type DriverState,
    type TimingSnapshot,
    type TimingSnapshotEntry,
} from './sessions/index.js';

// Timing module (Week 3)
export * from './timing/index.js';


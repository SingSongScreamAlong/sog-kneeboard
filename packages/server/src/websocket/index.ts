// =====================================================================
// WebSocket Server
// =====================================================================

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import type {
    JoinRoomMessage,
    LeaveRoomMessage,
    TimingUpdateMessage,
    IncidentNewMessage,
    PenaltyProposedMessage,
    SessionStateMessage,
    WatcherAuthMessage,
    WatcherAuthSuccess,
    WatcherAuthError,
    WatcherObservationBatch,
    WatcherStatusReport,
    WatcherCommand,
    AIInsight
} from '@controlbox/common';
import { config } from '../config/index.js';
import { initializeRelayNamespace } from '../gateway/index.js';
import {
    handleSubscriptionRequest,
    handleSubscriptionEscalate,
    handleRequestFat,
    getSocketRole,
    getSocketSurface,
    handleSubscriptionDisconnect,
} from '../gateway/subscriptions/subscription.handlers.js';


let io: Server;


// Track connected watcher agents
const watcherAgents = new Map<string, { socketId: string; agentId: string; connectedAt: Date }>();

export function initializeWebSocket(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: config.corsOrigins,
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    // Initialize relay gateway namespace (/relay)
    initializeRelayNamespace(io);

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // =====================================================================
        // Dashboard Client Handlers
        // =====================================================================

        // Join session room
        socket.on('room:join', (data: JoinRoomMessage) => {
            const roomName = `session:${data.sessionId}`;
            socket.join(roomName);
            console.log(`   Client ${socket.id} joined room ${roomName}`);

            // Acknowledge join
            socket.emit('room:joined', { sessionId: data.sessionId });
        });

        // Leave session room
        socket.on('room:leave', (data: LeaveRoomMessage) => {
            const roomName = `session:${data.sessionId}`;
            socket.leave(roomName);
            console.log(`   Client ${socket.id} left room ${roomName}`);
        });

        // =====================================================================
        // DEV ONLY: Debug handler for Week 1 relay testing
        // Allows dashboard clients to join session rooms to observe relay data
        // =====================================================================
        socket.on('debug:join_session', (data: { sessionId: string }) => {
            if (config.nodeEnv === 'production') {
                console.warn(`⚠️  debug:join_session blocked in production`);
                socket.emit('debug:error', { error: 'Not available in production' });
                return;
            }
            if (!data?.sessionId || typeof data.sessionId !== 'string') {
                socket.emit('debug:error', { error: 'sessionId required' });
                return;
            }
            const roomName = `session:${data.sessionId}`;
            socket.join(roomName);
            console.log(`🔧 DEV: Client ${socket.id} debug-joined room ${roomName}`);
            socket.emit('debug:joined', { sessionId: data.sessionId, room: roomName });
        });

        // Steward action
        socket.on('steward:action', (data: unknown) => {
            console.log('   Steward action received:', data);
            // TODO: Process steward action and broadcast result
        });

        // =====================================================================
        // Subscription Handlers (Week 2)
        // =====================================================================

        socket.on('subscription:request', (payload: unknown) => {
            handleSubscriptionRequest(socket, payload, getSocketRole(socket), getSocketSurface(socket));
        });

        socket.on('subscription:escalate', (payload: unknown) => {
            handleSubscriptionEscalate(socket, payload, getSocketRole(socket), getSocketSurface(socket));
        });

        socket.on('subscription:requestFat', (payload: unknown) => {
            handleRequestFat(socket, payload, getSocketRole(socket), getSocketSurface(socket));
        });

        // =====================================================================
        // Watcher Agent Handlers
        // =====================================================================

        // Watcher authentication

        socket.on('watcher:auth', async (data: WatcherAuthMessage) => {
            console.log(`🤖 Watcher auth attempt from ${socket.id}:`, data.agentType, data.version);

            try {
                const isValid = await validateWatcherApiKey(data.apiKey);

                if (isValid) {
                    const agentId = data.agentId || `watcher-${Date.now()}`;
                    socket.data.agentType = 'watcher';
                    socket.data.agentId = agentId;

                    // Track connected agent
                    watcherAgents.set(agentId, {
                        socketId: socket.id,
                        agentId,
                        connectedAt: new Date()
                    });

                    // Join watcher room for broadcasts
                    socket.join('watchers');

                    const response: WatcherAuthSuccess = {
                        agentId,
                        sessionToken: `session-${Date.now()}`,
                        serverTime: new Date().toISOString()
                    };

                    console.log(`✅ Watcher authenticated: ${agentId}`);
                    socket.emit('watcher:auth_success', response);
                } else {
                    const error: WatcherAuthError = {
                        error: 'Invalid API key',
                        code: 'INVALID_API_KEY'
                    };
                    console.log(`❌ Watcher auth failed: invalid API key`);
                    socket.emit('watcher:auth_error', error);
                }
            } catch (err) {
                const error: WatcherAuthError = {
                    error: 'Authentication error',
                    code: 'UNKNOWN'
                };
                console.error('Watcher auth error:', err);
                socket.emit('watcher:auth_error', error);
            }
        });

        // Receive observations from watcher
        socket.on('watcher:observations', async (batch: WatcherObservationBatch) => {
            if (socket.data.agentType !== 'watcher') {
                console.warn(`Unauthorized observations from ${socket.id}`);
                return;
            }

            console.log(`📊 Received ${batch.observations.length} observations from ${socket.data.agentId}`);
            console.log(`   Stream: ${batch.streamInfo.videoTitle} (${batch.streamInfo.videoId})`);

            try {
                // Process observations
                await processObservations(batch);

                // Acknowledge receipt
                socket.emit('watcher:observations_ack', {
                    batchId: batch.batchId,
                    received: batch.observations.length,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.error('Error processing observations:', err);
                socket.emit('watcher:observations_error', {
                    batchId: batch.batchId,
                    error: 'Processing failed'
                });
            }
        });

        // Watcher status update
        socket.on('watcher:status', (status: WatcherStatusReport) => {
            if (socket.data.agentType !== 'watcher') return;

            console.log(`📈 Watcher ${status.agentId} status: ${status.state}, ` +
                `${status.activeStreams} streams, ${status.totalObservationsSent} sent`);

            // Broadcast to admins/dashboard
            io.to('admin').emit('watcher:status_update', status);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);

            // Clean up watcher agent tracking
            if (socket.data.agentType === 'watcher' && socket.data.agentId) {
                watcherAgents.delete(socket.data.agentId);
                console.log(`🤖 Watcher ${socket.data.agentId} disconnected`);
            }

            // Clean up subscriptions (Week 2)
            handleSubscriptionDisconnect(socket);
        });
    });

    return io;
}

// =====================================================================
// Helper Functions
// =====================================================================

async function validateWatcherApiKey(apiKey: string): Promise<boolean> {
    // TODO: Implement proper API key validation from database
    // For now, accept any non-empty key or check against env var
    const validKey = process.env.WATCHER_API_KEY || 'dev-watcher-key';
    return apiKey === validKey || apiKey.length > 0;
}

async function processObservations(batch: WatcherObservationBatch): Promise<void> {
    // TODO: Implement observation processing
    // - Store in database
    // - Trigger AI analysis for interesting frames
    // - Generate insights
    for (const obs of batch.observations) {
        if (obs.detections.length > 0) {
            console.log(`   Frame ${obs.frameId}: ${obs.detections.length} detections at ${obs.currentTime}s`);
        }
    }
}

// =====================================================================
// Utility Functions
// =====================================================================

export function getIO(): Server {
    if (!io) {
        throw new Error('WebSocket server not initialized');
    }
    return io;
}

export function getConnectedWatchers(): Map<string, { socketId: string; agentId: string; connectedAt: Date }> {
    return watcherAgents;
}

// =====================================================================
// Broadcast Functions — Dashboard
// =====================================================================

export function broadcastTimingUpdate(message: TimingUpdateMessage): void {
    if (!io) return;
    io.to(`session:${message.sessionId}`).emit('timing:update', message);
}

export function broadcastNewIncident(message: IncidentNewMessage): void {
    if (!io) return;
    io.to(`session:${message.sessionId}`).emit('incident:new', message);
}

export function broadcastIncidentUpdated(message: IncidentNewMessage): void {
    if (!io) return;
    io.to(`session:${message.sessionId}`).emit('incident:updated', message);
}

export function broadcastPenaltyProposed(message: PenaltyProposedMessage): void {
    if (!io) return;
    io.to(`session:${message.sessionId}`).emit('penalty:proposed', message);
}

export function broadcastPenaltyApproved(message: PenaltyProposedMessage): void {
    if (!io) return;
    io.to(`session:${message.sessionId}`).emit('penalty:approved', message);
}

export function broadcastSessionState(message: SessionStateMessage): void {
    if (!io) return;
    io.to(`session:${message.sessionId}`).emit('session:state', message);
}

// =====================================================================
// Broadcast Functions — Watcher Agents
// =====================================================================

export function sendWatcherCommand(agentId: string, command: WatcherCommand): boolean {
    const agent = watcherAgents.get(agentId);
    if (!agent || !io) return false;

    io.to(agent.socketId).emit('watcher:command', command);
    return true;
}

export function broadcastToAllWatchers(event: string, data: unknown): void {
    if (!io) return;
    io.to('watchers').emit(event, data);
}

export function broadcastAIInsight(insight: AIInsight): void {
    if (!io) return;
    // Broadcast to dashboard for display
    io.emit('ai:insight', insight);
}


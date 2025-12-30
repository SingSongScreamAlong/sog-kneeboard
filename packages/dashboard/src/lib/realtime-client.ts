// =====================================================================
// Unified Realtime Client (Week 7)
// Single websocket connection for all surfaces with subscription management.
// =====================================================================

import { io, Socket } from 'socket.io-client';
import type {
    TimingUpdateMessage,
    IncidentNewMessage,
    SessionTiming,
} from '@controlbox/common';
import type { Role, Surface, UserClaims } from './claims';

// =====================================================================
// Types
// =====================================================================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type TelemetryRate = 5 | 10 | 20 | 60;

export interface ThinTelemetryFrame {
    driverId: string;
    sessionId: string;
    position: number | null;
    lapDistPct: number;
    speed: number;
    gear: number;
    lap: number;
    lastLapTime: number | null;
    gapToLeader: number | null;
    gapAhead: number | null;
    inPit: boolean;
    incidentCount: number;
    sessionTimeMs: number;
    timestamp: number;
}

export interface FatTelemetryFrame extends ThinTelemetryFrame {
    rpm: number;
    throttle: number;
    brake: number;
    clutch: number;
    steeringAngle: number;
    fuelLevel: number;
    tireTemps: number[];
    tirePressures: number[];
}

export interface SubscriptionState {
    sessionId: string;
    rateHz: TelemetryRate;
    isBurst: boolean;
    hasFatGrant: boolean;
    lastFrameAt: number;
}

// =====================================================================
// Listener Types
// =====================================================================

type ThinFrameListener = (frame: ThinTelemetryFrame) => void;
type FatFrameListener = (frame: FatTelemetryFrame) => void;
type TimingListener = (timing: SessionTiming) => void;
type IncidentListener = (incident: IncidentNewMessage) => void;
type ConnectionListener = (status: ConnectionStatus) => void;

// =====================================================================
// Unified Realtime Client
// =====================================================================

class UnifiedRealtimeClient {
    private socket: Socket | null = null;
    private status: ConnectionStatus = 'disconnected';
    private claims: UserClaims | null = null;
    private currentSurface: Surface | null = null;

    // Subscription state per session
    private subscriptions = new Map<string, SubscriptionState>();

    // Listeners (surface-agnostic callbacks)
    private thinListeners = new Set<ThinFrameListener>();
    private fatListeners = new Set<FatFrameListener>();
    private timingListeners = new Set<TimingListener>();
    private incidentListeners = new Set<IncidentListener>();
    private connectionListeners = new Set<ConnectionListener>();

    // Batching for high-frequency updates (prevents rerender storms)
    private pendingFrames: ThinTelemetryFrame[] = [];
    private batchIntervalId: ReturnType<typeof setInterval> | null = null;
    private batchIntervalMs = 50; // 20 fps max UI update rate

    // =====================================================================
    // Connection
    // =====================================================================

    connect(claims: UserClaims, surface: Surface): void {
        if (this.socket?.connected) {
            // Already connected, just update claims
            this.claims = claims;
            this.currentSurface = surface;
            return;
        }

        this.claims = claims;
        this.currentSurface = surface;
        this.status = 'connecting';
        this.notifyConnection('connecting');

        this.socket = io(window.location.origin, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            auth: {
                userId: claims.userId,
                orgId: claims.orgId,
                role: claims.role,
                surfaces: claims.surfaces,
            },
        });

        this.setupEventHandlers();
        this.startBatching();
    }

    disconnect(): void {
        this.stopBatching();

        // Leave all sessions
        for (const sessionId of this.subscriptions.keys()) {
            this.unsubscribe(sessionId);
        }

        this.socket?.disconnect();
        this.socket = null;
        this.status = 'disconnected';
        this.notifyConnection('disconnected');
    }

    // =====================================================================
    // Subscription Management
    // =====================================================================

    /**
     * Subscribe to a session at a specific rate.
     * Rate is validated server-side based on role.
     */
    subscribe(sessionId: string, rateHz: TelemetryRate = 10): void {
        if (!this.socket?.connected) return;

        this.socket.emit('room:join', { sessionId });
        this.socket.emit('subscription:request', {
            sessionId,
            rateHz,
            surface: this.currentSurface,
        });

        this.subscriptions.set(sessionId, {
            sessionId,
            rateHz,
            isBurst: false,
            hasFatGrant: false,
            lastFrameAt: 0,
        });

        console.log(`📡 Subscribed to ${sessionId} at ${rateHz}Hz`);
    }

    unsubscribe(sessionId: string): void {
        if (!this.socket?.connected) return;

        this.socket.emit('room:leave', { sessionId });
        this.subscriptions.delete(sessionId);

        console.log(`📡 Unsubscribed from ${sessionId}`);
    }

    /**
     * Request burst escalation for a session.
     * @param trigger Reason for burst (battle, incident, etc.)
     */
    requestBurst(sessionId: string, trigger: string): void {
        if (!this.socket?.connected) return;

        this.socket.emit('subscription:escalate', {
            sessionId,
            trigger,
            surface: this.currentSurface,
        });

        console.log(`⚡ Requested burst for ${sessionId}: ${trigger}`);
    }

    /**
     * Request fat frame access for a driver.
     */
    requestFatFrames(sessionId: string, driverId: string): void {
        if (!this.socket?.connected) return;

        this.socket.emit('subscription:requestFat', {
            sessionId,
            driverId,
        });

        console.log(`📊 Requested fat frames for ${driverId}`);
    }

    // =====================================================================
    // Event Handlers
    // =====================================================================

    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('🔌 Realtime client connected');
            this.status = 'connected';
            this.notifyConnection('connected');

            // Rejoin all subscriptions
            for (const [sessionId, sub] of this.subscriptions) {
                this.subscribe(sessionId, sub.rateHz);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Realtime client disconnected');
            this.status = 'disconnected';
            this.notifyConnection('disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.status = 'error';
            this.notifyConnection('error');
        });

        // Telemetry frames (Week 3 canonical format)
        this.socket.on('telemetry:frame', (frame: ThinTelemetryFrame) => {
            this.handleThinFrame(frame);
        });

        this.socket.on('telemetry:fat', (frame: FatTelemetryFrame) => {
            this.handleFatFrame(frame);
        });

        // Timing updates (2Hz)
        this.socket.on('telemetry:timing', (timing: SessionTiming) => {
            this.notifyTiming(timing);
        });

        // Incidents
        this.socket.on('incident:new', (incident: IncidentNewMessage) => {
            this.notifyIncident(incident);
        });

        // Subscription confirmations
        this.socket.on('subscription:confirmed', (data: { sessionId: string; rateHz: number }) => {
            const sub = this.subscriptions.get(data.sessionId);
            if (sub) {
                sub.rateHz = data.rateHz as TelemetryRate;
            }
        });

        this.socket.on('subscription:burst_granted', (data: { sessionId: string }) => {
            const sub = this.subscriptions.get(data.sessionId);
            if (sub) {
                sub.isBurst = true;
            }
        });

        this.socket.on('subscription:fat_granted', (data: { sessionId: string; driverId: string }) => {
            const sub = this.subscriptions.get(data.sessionId);
            if (sub) {
                sub.hasFatGrant = true;
            }
        });
    }

    // =====================================================================
    // Frame Handling with Batching
    // =====================================================================

    private handleThinFrame(frame: ThinTelemetryFrame): void {
        // Add to batch instead of notifying immediately
        this.pendingFrames.push(frame);

        // Update subscription state
        const sub = this.subscriptions.get(frame.sessionId);
        if (sub) {
            sub.lastFrameAt = Date.now();
        }
    }

    private handleFatFrame(frame: FatTelemetryFrame): void {
        // Fat frames are lower frequency, notify immediately
        for (const listener of this.fatListeners) {
            listener(frame);
        }
    }

    private startBatching(): void {
        if (this.batchIntervalId) return;

        this.batchIntervalId = setInterval(() => {
            if (this.pendingFrames.length > 0) {
                // Group by driver, keep latest only
                const latestByDriver = new Map<string, ThinTelemetryFrame>();
                for (const frame of this.pendingFrames) {
                    latestByDriver.set(frame.driverId, frame);
                }

                // Notify with latest frames only
                for (const frame of latestByDriver.values()) {
                    this.notifyThinFrame(frame);
                }

                this.pendingFrames = [];
            }
        }, this.batchIntervalMs);
    }

    private stopBatching(): void {
        if (this.batchIntervalId) {
            clearInterval(this.batchIntervalId);
            this.batchIntervalId = null;
        }
    }

    // =====================================================================
    // Listener Registration
    // =====================================================================

    onThinFrame(listener: ThinFrameListener): () => void {
        this.thinListeners.add(listener);
        return () => this.thinListeners.delete(listener);
    }

    onFatFrame(listener: FatFrameListener): () => void {
        this.fatListeners.add(listener);
        return () => this.fatListeners.delete(listener);
    }

    onTiming(listener: TimingListener): () => void {
        this.timingListeners.add(listener);
        return () => this.timingListeners.delete(listener);
    }

    onIncident(listener: IncidentListener): () => void {
        this.incidentListeners.add(listener);
        return () => this.incidentListeners.delete(listener);
    }

    onConnection(listener: ConnectionListener): () => void {
        this.connectionListeners.add(listener);
        return () => this.connectionListeners.delete(listener);
    }

    // =====================================================================
    // Notification Helpers
    // =====================================================================

    private notifyThinFrame(frame: ThinTelemetryFrame): void {
        for (const listener of this.thinListeners) {
            listener(frame);
        }
    }

    private notifyTiming(timing: SessionTiming): void {
        for (const listener of this.timingListeners) {
            listener(timing);
        }
    }

    private notifyIncident(incident: IncidentNewMessage): void {
        for (const listener of this.incidentListeners) {
            listener(incident);
        }
    }

    private notifyConnection(status: ConnectionStatus): void {
        for (const listener of this.connectionListeners) {
            listener(status);
        }
    }

    // =====================================================================
    // Status Methods
    // =====================================================================

    getStatus(): ConnectionStatus {
        return this.status;
    }

    getSubscription(sessionId: string): SubscriptionState | undefined {
        return this.subscriptions.get(sessionId);
    }

    getCurrentSurface(): Surface | null {
        return this.currentSurface;
    }
}

// =====================================================================
// Singleton Export
// =====================================================================

export const realtimeClient = new UnifiedRealtimeClient();

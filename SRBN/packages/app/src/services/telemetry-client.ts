// =====================================================================
// Telemetry Client
// WebSocket client for connecting to mock server
// =====================================================================

import { io, Socket } from 'socket.io-client';
import { useSessionStore } from '../stores/session.store';
import { useDriverStore } from '../stores/driver.store';
import { useBroadcastStore } from '../stores/broadcast.store';
import type { Driver, Session, CameraSuggestion, RaceEvent } from '@broadcastbox/common';

class TelemetryClient {
    private socket: Socket | null = null;
    private serverUrl: string = 'http://localhost:3002';
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 10;

    connect(): void {
        if (this.socket?.connected) {
            console.log('📡 Already connected');
            return;
        }

        console.log('📡 Connecting to telemetry server:', this.serverUrl);

        this.socket = io(this.serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.setupListeners();
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('📴 Disconnected from telemetry server');
        }
    }

    private setupListeners(): void {
        if (!this.socket) return;

        const socket = this.socket;

        socket.on('connect', () => {
            console.log('✅ Connected to telemetry server');
            this.reconnectAttempts = 0;
            useSessionStore.getState().setConnected(true);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected:', reason);
            useSessionStore.getState().setConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.warn('⚠️ Connection error:', error.message);
            this.reconnectAttempts++;
        });

        // Session state updates
        socket.on('session:state', (session: Session) => {
            console.log('📊 Session update:', session.trackName, session.state);
            useSessionStore.getState().setSession(session);
            useSessionStore.getState().setSessionState(session.state as any);
        });

        // Timing updates
        socket.on('timing:update', (data: { sessionId: string; entries: any[]; timestamp: number }) => {
            const drivers: Driver[] = data.entries.map((entry) => ({
                id: entry.driverId,
                name: entry.driverName,
                carNumber: entry.carNumber,
                position: entry.position,
                gapAhead: entry.gapAhead,
                gapBehind: null, // Calculate from next driver
                gapToLeader: entry.gapToLeader,
                tireCompound: entry.tireCompound || 'medium',
                tireLaps: entry.tireLaps || 0,
                pitStatus: entry.isInPit ? 'in_pit' : 'on_track',
                pitCount: entry.pitCount || 0,
                isInBattle: Math.abs(entry.gapAhead || 999) < 1.0,
                lastLapTime: null,
                bestLapTime: null,
            }));

            useDriverStore.getState().setDrivers(drivers);
        });

        // Driver updates (full list)
        socket.on('drivers:update', (drivers: Driver[]) => {
            useDriverStore.getState().setDrivers(drivers);

            // Run battle detection on updated driver data
            import('../services/BattleDetector').then(({ battleDetector }) => {
                battleDetector.analyze(drivers);
            });
        });

        // New race events
        socket.on('event:new', (event: RaceEvent) => {
            console.log('🚨 New event:', event.type, event.title);
            // Could add to an event store if we had one
        });

        // AI camera suggestions
        socket.on('suggestion:new', (suggestion: CameraSuggestion) => {
            console.log('🤖 AI suggestion:', suggestion.reason, `(${suggestion.confidence}%)`);
            useBroadcastStore.getState().addSuggestion(suggestion);
        });
    }

    subscribe(sessionId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('subscribe', sessionId);
            console.log('📺 Subscribed to session:', sessionId);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

// Singleton instance
export const telemetryClient = new TelemetryClient();

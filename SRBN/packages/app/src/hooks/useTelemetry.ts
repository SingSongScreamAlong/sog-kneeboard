// =====================================================================
// useTelemetry Hook
// Manages connection to telemetry server
// =====================================================================

import { useEffect, useState } from 'react';
import { telemetryClient } from '../services/telemetry-client';
import { useSessionStore } from '../stores/session.store';

interface TelemetryStatus {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
}

export function useTelemetry(autoConnect: boolean = true) {
    const [status, setStatus] = useState<TelemetryStatus>({
        isConnected: false,
        isConnecting: false,
        error: null,
    });

    const { session, isConnected } = useSessionStore();

    useEffect(() => {
        if (!autoConnect) return;

        setStatus(s => ({ ...s, isConnecting: true }));

        // Try to connect to mock server
        telemetryClient.connect();

        // Check connection status after a short delay
        const checkConnection = setTimeout(() => {
            if (telemetryClient.isConnected()) {
                setStatus({ isConnected: true, isConnecting: false, error: null });
            } else {
                setStatus({
                    isConnected: false,
                    isConnecting: false,
                    error: 'Could not connect to telemetry server. Using mock data.'
                });
            }
        }, 2000);

        return () => {
            clearTimeout(checkConnection);
        };
    }, [autoConnect]);

    // Sync with store's connection state
    useEffect(() => {
        setStatus(s => ({ ...s, isConnected }));
    }, [isConnected]);

    // Subscribe to session when we have one
    useEffect(() => {
        if (session && status.isConnected) {
            telemetryClient.subscribe(session.id);
        }
    }, [session?.id, status.isConnected]);

    return {
        ...status,
        connect: () => telemetryClient.connect(),
        disconnect: () => telemetryClient.disconnect(),
    };
}

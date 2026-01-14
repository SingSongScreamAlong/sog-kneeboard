// =====================================================================
// BroadcastBox App
// Main application component
// =====================================================================

import { TopBar } from './components/layout/TopBar';
import { DriverStack } from './components/driver-stack/DriverStack';
import { MainFeed } from './components/main-feed/MainFeed';
import { ContextStack } from './components/context-stack/ContextStack';
import { AdvancedOptions } from './components/advanced-options/AdvancedOptions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMockData } from './hooks/useMockData';
import { useTelemetry } from './hooks/useTelemetry';

export function App() {
    // Initialize keyboard shortcuts
    useKeyboardShortcuts();

    // Try to connect to live telemetry server
    const { isConnecting } = useTelemetry(true);

    // Fall back to mock data if not connected
    useMockData();

    // Show loading indicator while connecting
    if (isConnecting) {
        return (
            <div className="app-loading">
                <div className="loading-spinner" />
                <span>Connecting to telemetry...</span>
            </div>
        );
    }

    return (
        <div className="app-layout">
            {/* Top Bar */}
            <TopBar />

            {/* Left Column - Driver Stack with camera thumbnails */}
            <DriverStack />

            {/* Center - Main Feed */}
            <MainFeed />

            {/* Right Column - Context Stack (Map + Leaderboard) */}
            <ContextStack />

            {/* Advanced Options Overlay */}
            <AdvancedOptions />
        </div>
    );
}

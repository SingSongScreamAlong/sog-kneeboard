// =====================================================================
// Unified App Router (Week 7 + Week 8-9)
// Single app with BlackBox, ControlBox, and RaceBox surfaces.
// =====================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { SurfaceShell } from './components/SurfaceShell';

// ControlBox pages (existing)
import { MainLayout } from './components/layout/MainLayout';
import { AppInitializer } from './components/AppInitializer';
import { Dashboard } from './pages/Dashboard';
import { SessionView } from './pages/SessionView';
import { IncidentsPage } from './pages/IncidentsPage';
import { RulebookEditor } from './pages/RulebookEditor';
import { ReportsPage } from './pages/ReportsPage';
import { RaceControlPage } from './pages/RaceControlPage';
import { DriverRosterPage } from './pages/DriverRosterPage';
import { ResultsManagementPage } from './pages/ResultsManagementPage';
import { SeasonManagementPage } from './pages/SeasonManagementPage';
import { SettingsPage } from './pages/SettingsPage';

// BlackBox pages (Week 7)
import { BlackBoxTeamView, BlackBoxReplayView } from './pages/blackbox';

// RaceBox pages (Week 8-9)
import {
    DirectorView,
    PublicTimingPage,
    TimingTowerOverlay,
    LowerThirdOverlay,
    BattleBoxOverlay,
    IncidentBannerOverlay,
} from './pages/racebox';

// =====================================================================
// App Component
// =====================================================================

export function App() {
    return (
        <AuthProvider>
            <AppInitializer>
                <BrowserRouter>
                    <Routes>
                        {/* ============================================= */}
                        {/* Root: Redirect to default surface */}
                        {/* ============================================= */}
                        <Route path="/" element={<Navigate to="/controlbox" replace />} />

                        {/* ============================================= */}
                        {/* BlackBox Surface */}
                        {/* ============================================= */}
                        <Route
                            path="/blackbox"
                            element={
                                <SurfaceShell surface="blackbox">
                                    <Navigate to="/blackbox/team" replace />
                                </SurfaceShell>
                            }
                        />
                        <Route
                            path="/blackbox/team"
                            element={
                                <SurfaceShell surface="blackbox">
                                    <BlackBoxTeamView />
                                </SurfaceShell>
                            }
                        />
                        <Route
                            path="/blackbox/sessions"
                            element={
                                <SurfaceShell surface="blackbox">
                                    <BlackBoxTeamView />
                                </SurfaceShell>
                            }
                        />
                        <Route
                            path="/blackbox/session/:sessionId"
                            element={
                                <SurfaceShell surface="blackbox">
                                    <BlackBoxTeamView />
                                </SurfaceShell>
                            }
                        />
                        <Route
                            path="/blackbox/replay"
                            element={
                                <SurfaceShell surface="blackbox">
                                    <BlackBoxReplayView />
                                </SurfaceShell>
                            }
                        />
                        <Route
                            path="/blackbox/replay/:sessionId"
                            element={
                                <SurfaceShell surface="blackbox">
                                    <BlackBoxReplayView />
                                </SurfaceShell>
                            }
                        />

                        {/* ============================================= */}
                        {/* ControlBox Surface (existing routes) */}
                        {/* ============================================= */}
                        <Route
                            path="/controlbox"
                            element={
                                <SurfaceShell surface="controlbox">
                                    <MainLayout />
                                </SurfaceShell>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="sessions" element={<Dashboard />} />
                            <Route path="session/:sessionId" element={<SessionView />} />
                            <Route path="race-control/:sessionId" element={<RaceControlPage />} />
                            <Route path="incidents" element={<IncidentsPage />} />
                            <Route path="drivers" element={<DriverRosterPage />} />
                            <Route path="results" element={<ResultsManagementPage />} />
                            <Route path="season" element={<SeasonManagementPage />} />
                            <Route path="rulebooks" element={<RulebookEditor />} />
                            <Route path="reports" element={<ReportsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>

                        {/* ============================================= */}
                        {/* RaceBox Surface (Week 8-9) */}
                        {/* ============================================= */}

                        {/* Director View (requires racebox:director:control) */}
                        <Route
                            path="/racebox"
                            element={<Navigate to="/racebox/director" replace />}
                        />
                        <Route
                            path="/racebox/director"
                            element={
                                <SurfaceShell surface="racebox">
                                    <DirectorView />
                                </SurfaceShell>
                            }
                        />

                        {/* Public Timing (spectator mode) */}
                        <Route
                            path="/racebox/timing"
                            element={<PublicTimingPage />}
                        />
                        <Route
                            path="/racebox/public/:sessionId"
                            element={<PublicTimingPage />}
                        />

                        {/* OBS Overlays (no shell, minimal chrome) */}
                        <Route
                            path="/racebox/overlay/timing-tower"
                            element={<TimingTowerOverlay />}
                        />
                        <Route
                            path="/racebox/overlay/lower-third"
                            element={<LowerThirdOverlay />}
                        />
                        <Route
                            path="/racebox/overlay/battle-box"
                            element={<BattleBoxOverlay />}
                        />
                        <Route
                            path="/racebox/overlay/incident-banner"
                            element={<IncidentBannerOverlay />}
                        />

                        {/* ============================================= */}
                        {/* Fallback: Legacy routes redirect to ControlBox */}
                        {/* ============================================= */}
                        <Route path="/session/:sessionId" element={<Navigate to="/controlbox/session/:sessionId" replace />} />
                        <Route path="/incidents" element={<Navigate to="/controlbox/incidents" replace />} />
                        <Route path="/settings" element={<Navigate to="/controlbox/settings" replace />} />

                        {/* 404 */}
                        <Route path="*" element={<Navigate to="/controlbox" replace />} />
                    </Routes>
                </BrowserRouter>
            </AppInitializer>
        </AuthProvider>
    );
}


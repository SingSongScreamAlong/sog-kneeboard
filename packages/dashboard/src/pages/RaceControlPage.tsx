// =====================================================================
// Race Control Page
// Full race control interface with all management tools
// =====================================================================

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSessionStore } from '../stores/session.store';
import { useRaceControlStore } from '../stores/race-control.store';
import { useRecommendationStore } from '../stores/recommendation.store';
import { useIncidentStore } from '../stores/incident.store';
import { SessionHeader } from '../components/session/SessionHeader';
import { LiveTiming } from '../components/timing/LiveTiming';
import { RaceControlPanel } from '../components/race-control/RaceControlPanel';
import { DriverFlagsPanel } from '../components/race-control/DriverFlagsPanel';
import { FlagHistoryPanel } from '../components/race-control/FlagHistoryPanel';
import { MessagingPanel } from '../components/messaging/MessagingPanel';
import { IncidentPanel } from '../components/incidents/IncidentPanel';
import { PenaltyPanel } from '../components/penalties/PenaltyPanel';
import { RaceStatusBanner } from '../components/recommendations/RaceStatusBanner';
import { RecommendationPanel } from '../components/recommendations/RecommendationPanel';
import { DecisionHistoryPanel } from '../components/recommendations/DecisionHistoryPanel';
import { dashboardSimulator } from '../lib/simulation';

export function RaceControlPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { setCurrentSession, updateTiming, setDrivers, currentSession } = useSessionStore();
    const { setState } = useRaceControlStore();
    const { generateRecommendation } = useRecommendationStore();
    const { incidents } = useIncidentStore();

    // Auto-generate recommendations for new incidents
    useEffect(() => {
        if (incidents.length > 0) {
            const latestIncident = incidents[incidents.length - 1];
            // Only process if incident is new (within last 5 seconds)
            const isRecent = new Date().getTime() - new Date(latestIncident.createdAt).getTime() < 5000;
            if (isRecent && latestIncident.status === 'pending') {
                generateRecommendation({
                    id: latestIncident.id,
                    sessionId: latestIncident.sessionId,
                    type: latestIncident.type,
                    severity: latestIncident.severity,
                    lapNumber: latestIncident.lapNumber,
                    sessionTimeMs: latestIncident.sessionTimeMs,
                    driversInvolved: latestIncident.involvedDrivers.map((d) => ({
                        driverId: d.driverId,
                        driverName: d.driverName,
                        carNumber: d.carNumber || '?',
                    })),
                    severityScore: latestIncident.severityScore,
                });
            }
        }
    }, [incidents, generateRecommendation]);

    // Initialize simulation and race control state
    useEffect(() => {
        if (sessionId === 'demo') {
            const session = dashboardSimulator.start({
                onTimingUpdate: (timing) => {
                    updateTiming(timing);
                    setDrivers(timing.map(t => ({
                        id: `driver-${t.driverId}`,
                        sessionId: sessionId,
                        driverId: t.driverId,
                        driverName: t.driverName,
                        carNumber: t.carNumber,
                        carName: t.carName,
                        joinedAt: new Date(),
                        isActive: t.isConnected,
                    })));
                },
                onSessionUpdate: (sess) => {
                    setCurrentSession(sess);
                },
                onIncident: () => { },
                onPenalty: () => { },
            });

            setCurrentSession(session);

            // Initialize race control state
            setState({
                sessionId: 'demo',
                flags: {
                    global: 'green',
                    sectors: [],
                    driverFlags: {},
                    activeFlags: [],
                },
                currentStage: 'stage_1',
                lapsCompleted: 5,
                lapsRemaining: 45,
                cautions: [],
                isPaused: false,
                isUnderCaution: false,
                restartPending: false,
            });
        }

        return () => {
            dashboardSimulator.stop();
        };
    }, [sessionId, setCurrentSession, updateTiming, setDrivers, setState]);

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <SessionHeader />

            {/* Race Status Banner */}
            <div className="px-4 pt-4">
                <RaceStatusBanner />
            </div>

            {/* Race Control Banner */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 mx-4 mt-4 rounded-lg px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏁</span>
                        <div>
                            <h1 className="text-xl font-bold text-white">Race Control Center</h1>
                            <p className="text-sm text-red-100 opacity-80">
                                {currentSession?.trackName || 'Silverstone'} — {currentSession?.sessionType || 'Race'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm text-red-100 opacity-80">Session Time</div>
                            <div className="text-xl font-mono font-bold text-white">01:45:32</div>
                        </div>
                        <div className="h-12 w-px bg-white/20" />
                        <div className="text-right">
                            <div className="text-sm text-red-100 opacity-80">Lap</div>
                            <div className="text-xl font-mono font-bold text-white">5/50</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full grid grid-cols-12 gap-4">
                    {/* Left Column - Live Timing */}
                    <div className="col-span-3 overflow-auto">
                        <LiveTiming />
                    </div>

                    {/* Middle-Left Column - Recommendations */}
                    <div className="col-span-3 space-y-4 overflow-auto">
                        <RecommendationPanel />
                        <DecisionHistoryPanel />
                    </div>

                    {/* Middle-Right Column - Race Control & Flags */}
                    <div className="col-span-3 space-y-4 overflow-auto">
                        <RaceControlPanel />
                        <DriverFlagsPanel />
                        <FlagHistoryPanel />
                    </div>

                    {/* Right Column - Messaging, Incidents, Penalties */}
                    <div className="col-span-3 space-y-4 overflow-auto">
                        <MessagingPanel />
                        <IncidentPanel />
                        <PenaltyPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}


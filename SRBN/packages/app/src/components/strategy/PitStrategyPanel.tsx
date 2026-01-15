// =====================================================================
// PitStrategyPanel Component
// Displays tire age, pit windows, and undercut/overcut opportunities
// =====================================================================

import { useMemo } from 'react';
import { useDriverStore } from '../../stores/driver.store';
import { useSessionStore } from '../../stores/session.store';
import './PitStrategyPanel.css';

interface PitWindow {
    driverId: string;
    driverName: string;
    position: number;
    tireCompound: string;
    tireLaps: number;
    optimalWindow: { start: number; end: number };
    isInWindow: boolean;
    undercutOpportunity: boolean;
    overcutOpportunity: boolean;
}

export function PitStrategyPanel() {
    const { drivers } = useDriverStore();
    const { session } = useSessionStore();

    const currentLap = session?.currentLap || 0;
    const totalLaps = session?.totalLaps || 60;

    // Calculate pit windows for each driver
    const pitWindows = useMemo((): PitWindow[] => {
        return drivers
            .slice(0, 10) // Top 10
            .map(driver => {
                const tireLaps = driver.tireLaps || 0;
                const compound = driver.tireCompound || 'medium';

                // Estimate optimal pit window based on compound
                const tireLife = compound === 'soft' ? 15 : compound === 'medium' ? 25 : 35;
                const optimalStart = Math.max(1, tireLaps - 5);
                const optimalEnd = Math.min(totalLaps - 5, tireLaps + tireLife);

                const isInWindow = currentLap >= optimalStart && currentLap <= optimalEnd;

                // Check undercut/overcut opportunities
                const driversAhead = drivers.filter(d =>
                    d.position < driver.position &&
                    d.position >= driver.position - 2
                );

                const undercutOpportunity = driversAhead.some(d =>
                    (d.tireLaps || 0) > tireLaps + 5
                );

                const overcutOpportunity = driversAhead.some(d =>
                    (d.tireLaps || 0) < tireLaps - 5 && d.pitCount === driver.pitCount
                );

                return {
                    driverId: driver.id,
                    driverName: driver.name,
                    position: driver.position,
                    tireCompound: compound,
                    tireLaps,
                    optimalWindow: { start: optimalStart, end: optimalEnd },
                    isInWindow,
                    undercutOpportunity,
                    overcutOpportunity,
                };
            });
    }, [drivers, currentLap, totalLaps]);

    return (
        <div className="pit-strategy-panel">
            <header className="strategy-header">
                <span className="strategy-title">⛽ PIT STRATEGY</span>
                <span className="strategy-lap">LAP {currentLap}/{totalLaps}</span>
            </header>

            <div className="strategy-grid">
                {/* Column Headers */}
                <div className="strategy-row strategy-row--header">
                    <span className="col-pos">POS</span>
                    <span className="col-driver">DRIVER</span>
                    <span className="col-tire">TIRE</span>
                    <span className="col-age">AGE</span>
                    <span className="col-window">WINDOW</span>
                    <span className="col-opp">OPP</span>
                </div>

                {pitWindows.map(pw => (
                    <div
                        key={pw.driverId}
                        className={`strategy-row ${pw.isInWindow ? 'strategy-row--in-window' : ''}`}
                    >
                        <span className="col-pos">P{pw.position}</span>
                        <span className="col-driver">{pw.driverName.split(' ').pop()}</span>
                        <span className={`col-tire tire-${pw.tireCompound}`}>
                            {pw.tireCompound.charAt(0).toUpperCase()}
                        </span>
                        <span className="col-age">{pw.tireLaps}L</span>
                        <span className="col-window">
                            L{pw.optimalWindow.start}-{pw.optimalWindow.end}
                        </span>
                        <span className="col-opp">
                            {pw.undercutOpportunity && <span className="opp-badge opp-undercut">UC</span>}
                            {pw.overcutOpportunity && <span className="opp-badge opp-overcut">OC</span>}
                        </span>
                    </div>
                ))}
            </div>

            {/* Pit Window Visualization */}
            <div className="pit-timeline">
                <div className="timeline-track">
                    <div
                        className="timeline-progress"
                        style={{ width: `${(currentLap / totalLaps) * 100}%` }}
                    />
                    <div
                        className="timeline-marker"
                        style={{ left: `${(currentLap / totalLaps) * 100}%` }}
                    />
                </div>
                <div className="timeline-labels">
                    <span>L1</span>
                    <span className="timeline-pit-window">PIT WINDOW</span>
                    <span>L{totalLaps}</span>
                </div>
            </div>
        </div>
    );
}

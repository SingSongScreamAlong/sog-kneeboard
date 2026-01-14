// =====================================================================
// Leaderboard Component
// Right panel with full timing data - auto-scrolls to selected driver
// =====================================================================

import { useEffect, useRef } from 'react';
import { useDriverStore } from '../../stores/driver.store';
import { useBroadcastStore } from '../../stores/broadcast.store';
import { useSessionStore } from '../../stores/session.store';
import './Leaderboard.css';

export function Leaderboard() {
    const { drivers } = useDriverStore();
    const { leaderboardExpanded, featuredDriverId, setFeaturedDriver } = useBroadcastStore();
    const { session } = useSessionStore();

    // Refs for row elements to enable scroll-into-view
    const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

    const sortedDrivers = [...drivers].sort((a, b) => a.position - b.position);

    // Auto-scroll to featured driver when selection changes
    useEffect(() => {
        if (featuredDriverId) {
            const row = rowRefs.current.get(featuredDriverId);
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [featuredDriverId]);

    return (
        <section className={`leaderboard ${leaderboardExpanded ? 'leaderboard--expanded' : ''}`}>
            {/* Header */}
            <header className="leaderboard__header">
                <div className="leaderboard__title">
                    <span className="title-icon">⊞</span>
                    <span>LEADERBOARD</span>
                </div>
                <div className="leaderboard__meta">
                    <span className="meta-slots">⊟⊟⊟⊟</span>
                    <span className="meta-lap">LAP {session?.currentLap ?? 0}:30</span>
                    <span className="meta-progress">●━━━━</span>
                </div>
            </header>

            {/* Table */}
            <div className="leaderboard__table">
                <table>
                    <thead>
                        <tr>
                            <th className="col-pos">#</th>
                            <th className="col-num"></th>
                            <th className="col-name">Driver</th>
                            <th className="col-tire"></th>
                            <th className="col-gap-prev">GAP</th>
                            <th className="col-class">CLASS</th>
                            <th className="col-pit">PIT</th>
                            <th className="col-gap-leader">GAP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDrivers.map(driver => (
                            <tr
                                key={driver.id}
                                ref={(el) => { if (el) rowRefs.current.set(driver.id, el); }}
                                className={`${featuredDriverId === driver.id ? 'row--selected' : ''} ${driver.isInBattle ? 'row--battle' : ''}`}
                                onClick={() => setFeaturedDriver(driver.id)}
                            >
                                <td className="col-pos">
                                    <span className={`pos-badge pos-badge--p${Math.min(driver.position, 3)}`}>
                                        {driver.position}
                                    </span>
                                </td>
                                <td className="col-num">
                                    <span className="car-num">{driver.carNumber}</span>
                                </td>
                                <td className="col-name">{driver.name}</td>
                                <td className="col-tire">
                                    <span className={`tire-badge tire-badge--${driver.tireCompound}`}>
                                        {driver.tireCompound[0].toUpperCase()}
                                    </span>
                                </td>
                                <td className="col-gap-prev">
                                    {driver.gapAhead !== null
                                        ? `${driver.gapAhead > 0 ? '-' : '+'}${Math.abs(driver.gapAhead).toFixed(1)}s`
                                        : '-'
                                    }
                                </td>
                                <td className="col-class">P{driver.position}L</td>
                                <td className="col-pit">
                                    <span className={`pit-badge ${driver.pitCount > 0 ? 'pit-badge--active' : ''}`}>
                                        <span className="pit-icon">⬚</span>
                                        {driver.pitCount}
                                    </span>
                                    {driver.pitStatus !== 'on_track' && <span className="pit-flag">⚑</span>}
                                </td>
                                <td className="col-gap-leader">
                                    {driver.position === 1
                                        ? '-'
                                        : `+${driver.gapToLeader.toFixed(1)}s`
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <footer className="leaderboard__footer">
                <span className="footer-brand">SRBN</span>
                <span className="footer-product">Broadcast66x</span>
                <span className="footer-indicator">●●</span>
            </footer>
        </section>
    );
}

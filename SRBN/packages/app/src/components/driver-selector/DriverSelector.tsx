// =====================================================================
// DriverSelector Component
// Horizontal bottom panel for driver selection
// Replaces the vertical DriverStack
// =====================================================================

import { useDriverStore } from '../../stores/driver.store';
import { useBroadcastStore } from '../../stores/broadcast.store';
import './DriverSelector.css';

export function DriverSelector() {
    const { getStackDrivers } = useDriverStore();
    const { featuredDriverId, setFeaturedDriver, pendingSuggestions } = useBroadcastStore();

    const stackDrivers = getStackDrivers();

    // Get AI suggested driver IDs
    const suggestedDriverIds = pendingSuggestions
        .filter(s => s.targetDriverId)
        .map(s => s.targetDriverId);

    return (
        <section className="driver-selector panel panel--bottom">
            <header className="selector-header">
                <span className="selector-title">ACTIVE GRID</span>
                <span className="selector-count">{stackDrivers.length} DRIVERS</span>
            </header>

            <div className="selector-list">
                {stackDrivers.map((driver) => {
                    const isSelected = featuredDriverId === driver.id;
                    const isSuggested = suggestedDriverIds.includes(driver.id);

                    return (
                        <button
                            key={driver.id}
                            className={`driver-chip ${isSelected ? 'driver-chip--selected' : ''} ${isSuggested ? 'driver-chip--suggested' : ''}`}
                            onClick={() => setFeaturedDriver(driver.id)}
                        >
                            <span className="chip-pos">P{driver.position}</span>
                            <span className="chip-num">#{driver.carNumber}</span>
                            <span className="chip-name">{driver.name.split(' ').pop()?.toUpperCase()}</span>
                            {driver.gapToLeader === 0 && <span className="chip-badge">LDR</span>}
                            {driver.isInBattle && <span className="chip-battle">⚔</span>}
                            {isSuggested && <div className="chip-glow" />}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

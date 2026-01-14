// =====================================================================
// DriverStack Component
// Left column with driver tiles
// =====================================================================

import { useDriverStore } from '../../stores/driver.store';
import { useBroadcastStore } from '../../stores/broadcast.store';
import { DriverTile } from './DriverTile';
import './DriverStack.css';

export function DriverStack() {
    const { getStackDrivers } = useDriverStore();
    const { pendingSuggestions } = useBroadcastStore();

    const stackDrivers = getStackDrivers();

    // Get AI suggested driver IDs
    const suggestedDriverIds = pendingSuggestions
        .filter(s => s.targetDriverId)
        .map(s => s.targetDriverId);

    return (
        <aside className="driver-stack panel panel--left">
            <header className="section-header">
                <span>SRBN</span>
                <span className="section-header__badge">SRBT Program</span>
            </header>

            <div className="driver-stack__list">
                {stackDrivers.length === 0 ? (
                    <div className="driver-stack__empty">
                        <p>No drivers in stack</p>
                        <p className="text-muted">Waiting for session...</p>
                    </div>
                ) : (
                    stackDrivers.map((driver, index) => (
                        <DriverTile
                            key={driver.id}
                            driver={driver}
                            index={index}
                            isAISuggested={suggestedDriverIds.includes(driver.id)}
                        />
                    ))
                )}
            </div>
        </aside>
    );
}

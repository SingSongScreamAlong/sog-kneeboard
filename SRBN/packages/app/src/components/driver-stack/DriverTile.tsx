// =====================================================================
// DriverTile Component
// Individual driver tile in the driver stack
// =====================================================================

import type { Driver, TireCompound } from '@broadcastbox/common';
import { useBroadcastStore } from '../../stores/broadcast.store';
import './DriverTile.css';

interface DriverTileProps {
    driver: Driver;
    index: number;
    isAISuggested?: boolean;
}

export function DriverTile({ driver, index, isAISuggested }: DriverTileProps) {
    const { featuredDriverId, setFeaturedDriver } = useBroadcastStore();
    const isSelected = featuredDriverId === driver.id;

    const handleClick = () => {
        setFeaturedDriver(isSelected ? null : driver.id);
    };

    return (
        <div
            className={`driver-tile ${isSelected ? 'driver-tile--selected' : ''} ${isAISuggested ? 'ai-highlight' : ''}`}
            onClick={handleClick}
            data-position={driver.position}
        >
            {/* Onboard Thumbnail */}
            <div className="driver-tile__thumbnail">
                <div className="thumbnail-placeholder">
                    <span className="thumbnail-car-num">#{driver.carNumber}</span>
                </div>
                {driver.isInBattle && (
                    <span className="battle-indicator">⚔</span>
                )}
            </div>

            {/* Driver Info */}
            <div className="driver-tile__info">
                <div className="driver-tile__header">
                    <span className={`position-badge position-badge--p${Math.min(driver.position, 3)}`}>
                        {driver.position}
                    </span>
                    <span className="driver-name">{driver.name}</span>
                    <span className="gap-value">
                        {driver.gapAhead !== null
                            ? `${driver.gapAhead > 0 ? '+' : ''}${driver.gapAhead.toFixed(1)}s`
                            : 'Leader'
                        }
                    </span>
                </div>

                <div className="driver-tile__details">
                    <TireIcon compound={driver.tireCompound} laps={driver.tireLaps} />
                    <PitStatus status={driver.pitStatus} count={driver.pitCount} />
                </div>
            </div>

            {/* Keyboard Shortcut Hint */}
            <div className="driver-tile__shortcut">
                {index + 1}
            </div>
        </div>
    );
}

function TireIcon({ compound, laps }: { compound: TireCompound; laps: number }) {
    const letter = compound[0].toUpperCase();
    return (
        <div className={`tire-info tire-info--${compound}`}>
            <span className="tire-icon">{letter}</span>
            <span className="tire-laps">{laps}L</span>
        </div>
    );
}

function PitStatus({ status, count }: { status: string; count: number }) {
    const isInPit = status !== 'on_track';
    return (
        <div className={`pit-status ${isInPit ? 'pit-status--active' : ''}`}>
            <span className="pit-icon">⬚</span>
            <span className="pit-count">{count}</span>
        </div>
    );
}

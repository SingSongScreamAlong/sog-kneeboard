// =====================================================================
// TrackMap Component
// Live track visualization with car dots
// =====================================================================

import { useDriverStore } from '../../stores/driver.store';
import './TrackMap.css';

export function TrackMap() {
    const { drivers, battles } = useDriverStore();

    // Simple track outline - Sebring inspired shape
    // In production, this would load from track_shapes data
    const trackPath = `
    M 50,20 
    L 260,20 
    Q 280,20 280,40 
    L 280,80 
    Q 280,100 260,100 
    L 180,100 
    Q 160,100 160,120 
    L 160,160 
    Q 160,180 140,180 
    L 50,180 
    Q 30,180 30,160 
    L 30,40 
    Q 30,20 50,20 
    Z
  `;

    return (
        <section className="track-map">
            <svg viewBox="0 0 300 200" className="track-map__svg">
                {/* Track Outline */}
                <path
                    d={trackPath}
                    className="track-outline"
                    fill="none"
                    strokeWidth="4"
                />

                {/* Battle Highlight Zones */}
                {battles.map((battle, i) => (
                    <circle
                        key={`battle-${i}`}
                        cx={100 + i * 50}
                        cy={100}
                        r="15"
                        className="battle-zone"
                    />
                ))}

                {/* Car Dots */}
                {drivers.slice(0, 10).map((driver, i) => {
                    // Mock positions around track
                    const angle = (driver.position / 10) * Math.PI * 2;
                    const cx = 155 + Math.cos(angle) * 80;
                    const cy = 100 + Math.sin(angle) * 60;

                    return (
                        <g key={driver.id} className="car-dot-group">
                            <circle
                                cx={cx}
                                cy={cy}
                                r="6"
                                className={`car-dot ${driver.isInBattle ? 'car-dot--battle' : ''}`}
                            />
                            <text
                                x={cx}
                                y={cy + 3}
                                className="car-number"
                            >
                                {driver.position}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </section>
    );
}

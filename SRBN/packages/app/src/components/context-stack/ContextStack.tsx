// =====================================================================
// ContextStack Component
// Right column with track map and leaderboard only
// =====================================================================

import { TrackMap } from './TrackMap';
import { Leaderboard } from '../leaderboard/Leaderboard';
import './ContextStack.css';

export function ContextStack() {
    return (
        <aside className="context-stack panel panel--right">
            <TrackMap />
            <Leaderboard />
        </aside>
    );
}

// =====================================================================
// ReplayControls Component
// UI for bookmark and instant replay controls
// =====================================================================

import { replayManager, useReplayStore } from '../../engine/ReplayManager';
import './ReplayControls.css';

export function ReplayControls() {
    const {
        isReplayMode,
        playbackSpeed,
        bookmarks,
        selectedBookmarkId
    } = useReplayStore();

    const handleBookmarkNow = () => {
        replayManager.bookmarkNow('Manual bookmark');
    };

    const handleReplay = (id: string) => {
        replayManager.replayFromBookmark(id);
    };

    const handleExitReplay = () => {
        replayManager.exitReplay();
    };

    const speeds = [0.25, 0.5, 1, 1.5, 2];

    return (
        <div className="replay-controls">
            <header className="replay-header">
                <span className="replay-title">📼 REPLAY</span>
                {isReplayMode && (
                    <span className="replay-badge">REPLAY MODE</span>
                )}
            </header>

            {/* Quick Actions */}
            <div className="replay-actions">
                <button
                    className="btn btn--primary btn--full"
                    onClick={handleBookmarkNow}
                >
                    🔖 Bookmark Now
                </button>

                {isReplayMode && (
                    <button
                        className="btn btn--secondary btn--full"
                        onClick={handleExitReplay}
                    >
                        ↩ Exit Replay
                    </button>
                )}
            </div>

            {/* Speed Controls (when in replay mode) */}
            {isReplayMode && (
                <div className="replay-speed">
                    <span className="speed-label">Speed:</span>
                    <div className="speed-buttons">
                        {speeds.map(speed => (
                            <button
                                key={speed}
                                className={`speed-btn ${playbackSpeed === speed ? 'speed-btn--active' : ''}`}
                                onClick={() => replayManager.setSpeed(speed)}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Bookmarks */}
            <div className="bookmark-list">
                <div className="bookmark-header">Recent</div>
                {bookmarks.length === 0 ? (
                    <div className="bookmark-empty">No bookmarks yet</div>
                ) : (
                    bookmarks.slice(0, 5).map(bookmark => (
                        <div
                            key={bookmark.id}
                            className={`bookmark-item ${selectedBookmarkId === bookmark.id ? 'bookmark-item--active' : ''} bookmark-item--${bookmark.priority}`}
                            onClick={() => handleReplay(bookmark.id)}
                        >
                            <span className="bookmark-icon">
                                {bookmark.type === 'incident' ? '⚠️' :
                                    bookmark.type === 'overtake' ? '🏎️' :
                                        bookmark.type === 'battle' ? '⚔️' :
                                            bookmark.type === 'pit_stop' ? '🔧' : '🔖'}
                            </span>
                            <span className="bookmark-desc">{bookmark.description}</span>
                            <span className="bookmark-time">
                                {formatTimestamp(bookmark.timestamp)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

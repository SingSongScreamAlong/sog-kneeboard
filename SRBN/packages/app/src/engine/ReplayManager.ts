// =====================================================================
// ReplayManager
// Handles instant replay with timestamp bookmarks and playback control
// =====================================================================

import { create } from 'zustand';

export interface ReplayBookmark {
    id: string;
    timestamp: number;
    description: string;
    type: 'incident' | 'battle' | 'overtake' | 'pit_stop' | 'manual';
    driverIds: string[];
    priority: 'low' | 'medium' | 'high';
}

export interface ReplayState {
    // Replay mode
    isReplayMode: boolean;
    currentTimestamp: number;
    playbackSpeed: number;

    // Bookmarks
    bookmarks: ReplayBookmark[];
    selectedBookmarkId: string | null;

    // Buffer info
    bufferStartTime: number;
    bufferEndTime: number;
    bufferDurationMs: number;

    // Actions
    setReplayMode: (enabled: boolean) => void;
    setCurrentTimestamp: (timestamp: number) => void;
    setPlaybackSpeed: (speed: number) => void;
    addBookmark: (bookmark: ReplayBookmark) => void;
    removeBookmark: (id: string) => void;
    selectBookmark: (id: string | null) => void;
    clearBookmarks: () => void;
}

export const useReplayStore = create<ReplayState>((set, get) => ({
    isReplayMode: false,
    currentTimestamp: Date.now(),
    playbackSpeed: 1,
    bookmarks: [],
    selectedBookmarkId: null,
    bufferStartTime: Date.now() - 120000, // Last 2 minutes
    bufferEndTime: Date.now(),
    bufferDurationMs: 120000,

    setReplayMode: (enabled) => set({ isReplayMode: enabled }),
    setCurrentTimestamp: (timestamp) => set({ currentTimestamp: timestamp }),
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

    addBookmark: (bookmark) => set((state) => ({
        bookmarks: [...state.bookmarks, bookmark]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50) // Keep last 50
    })),

    removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter(b => b.id !== id)
    })),

    selectBookmark: (id) => set({ selectedBookmarkId: id }),

    clearBookmarks: () => set({ bookmarks: [] }),
}));

// =====================================================================
// ReplayManager Class
// =====================================================================

class ReplayManager {
    private bufferDurationMs: number = 120000; // 2 minutes
    private autoBookmarkEnabled: boolean = true;

    // Mark current moment as a bookmark
    bookmarkNow(description: string, type: ReplayBookmark['type'] = 'manual', driverIds: string[] = []): void {
        const bookmark: ReplayBookmark = {
            id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            description,
            type,
            driverIds,
            priority: this.getPriorityForType(type),
        };

        useReplayStore.getState().addBookmark(bookmark);
        console.log('📼 Bookmark added:', description);
    }

    // Auto-bookmark events based on telemetry
    autoBookmarkIncident(driverIds: string[], description: string): void {
        if (!this.autoBookmarkEnabled) return;
        this.bookmarkNow(description, 'incident', driverIds);
    }

    autoBookmarkOvertake(overtakingDriverId: string, overtakenDriverId: string): void {
        if (!this.autoBookmarkEnabled) return;
        this.bookmarkNow(
            `Overtake: ${overtakingDriverId} passes ${overtakenDriverId}`,
            'overtake',
            [overtakingDriverId, overtakenDriverId]
        );
    }

    autoBookmarkBattle(driverIds: string[], intensity: number): void {
        if (!this.autoBookmarkEnabled) return;
        if (intensity > 0.7) {
            this.bookmarkNow(
                `Intense battle between ${driverIds.length} drivers`,
                'battle',
                driverIds
            );
        }
    }

    // Enter replay mode at a specific bookmark
    replayFromBookmark(bookmarkId: string): void {
        const { bookmarks } = useReplayStore.getState();
        const bookmark = bookmarks.find(b => b.id === bookmarkId);

        if (bookmark) {
            useReplayStore.getState().setReplayMode(true);
            useReplayStore.getState().setCurrentTimestamp(bookmark.timestamp);
            useReplayStore.getState().selectBookmark(bookmarkId);
            console.log('📼 Replaying:', bookmark.description);
        }
    }

    // Exit replay mode
    exitReplay(): void {
        useReplayStore.getState().setReplayMode(false);
        useReplayStore.getState().selectBookmark(null);
        console.log('📼 Exited replay mode');
    }

    // Playback speed control
    setSpeed(speed: number): void {
        // Clamp to valid speeds
        const validSpeeds = [0.25, 0.5, 1, 1.5, 2];
        const closest = validSpeeds.reduce((prev, curr) =>
            Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
        );
        useReplayStore.getState().setPlaybackSpeed(closest);
    }

    // Get recent bookmarks
    getRecentBookmarks(count: number = 10): ReplayBookmark[] {
        return useReplayStore.getState().bookmarks.slice(0, count);
    }

    // Get high priority bookmarks only
    getHighlights(): ReplayBookmark[] {
        return useReplayStore.getState().bookmarks
            .filter(b => b.priority === 'high');
    }

    private getPriorityForType(type: ReplayBookmark['type']): 'low' | 'medium' | 'high' {
        switch (type) {
            case 'incident': return 'high';
            case 'overtake': return 'medium';
            case 'battle': return 'medium';
            case 'pit_stop': return 'low';
            case 'manual': return 'medium';
            default: return 'low';
        }
    }

    setAutoBookmark(enabled: boolean): void {
        this.autoBookmarkEnabled = enabled;
    }
}

// Singleton export
export const replayManager = new ReplayManager();

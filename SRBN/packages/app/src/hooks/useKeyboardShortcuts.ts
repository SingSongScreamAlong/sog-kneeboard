// =====================================================================
// useKeyboardShortcuts Hook
// Handles keyboard shortcuts for director actions
// =====================================================================

import { useEffect, useCallback } from 'react';
import { KEYBOARD_SHORTCUTS } from '@broadcastbox/common';
import { useBroadcastStore } from '../stores/broadcast.store';
import { useDriverStore } from '../stores/driver.store';

export function useKeyboardShortcuts() {
    const {
        setFeaturedDriver,
        toggleCameraLock,
        setCameraMode,
        cameraMode,
        toggleAdvancedOptions,
        toggleLeaderboard,
        nextSuggestion,
        prevSuggestion,
        pendingSuggestions,
        acceptSuggestion,
        selectedSuggestionIndex,
        replayLastEvent,
    } = useBroadcastStore();

    const { stackDriverIds, getDriverById } = useDriverStore();

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Ignore if in input field
        if (event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement) {
            return;
        }

        const { code } = event;

        // Driver selection (1-5)
        if (code >= 'Digit1' && code <= 'Digit5') {
            const index = parseInt(code.replace('Digit', '')) - 1;
            const driverId = stackDriverIds[index];
            if (driverId) {
                setFeaturedDriver(driverId);
                event.preventDefault();
            }
            return;
        }

        switch (code) {
            // Camera controls
            case 'Space':
                toggleCameraLock();
                event.preventDefault();
                break;

            case 'Tab':
                event.preventDefault();
                const modes: Array<'world' | 'onboard' | 'battle'> = ['world', 'onboard', 'battle'];
                const currentIndex = modes.indexOf(cameraMode as any);
                const nextMode = modes[(currentIndex + 1) % modes.length];
                setCameraMode(nextMode);
                break;

            case 'ArrowLeft':
                prevSuggestion();
                event.preventDefault();
                break;

            case 'ArrowRight':
                nextSuggestion();
                event.preventDefault();
                break;

            case 'Enter':
                const suggestion = pendingSuggestions[selectedSuggestionIndex];
                if (suggestion) {
                    acceptSuggestion(suggestion.id);
                }
                event.preventDefault();
                break;

            // Replay
            case 'KeyR':
                const bookmark = replayLastEvent();
                if (bookmark) {
                    console.log('📼 Replaying:', bookmark.description);
                }
                event.preventDefault();
                break;

            // UI controls
            case 'KeyL':
                toggleLeaderboard();
                event.preventDefault();
                break;

            case 'KeyA':
                toggleAdvancedOptions();
                event.preventDefault();
                break;

            case 'Escape':
                // Reset to AI direction (clears all manual overrides)
                import('../stores/broadcast.store').then(({ useBroadcastStore }) => {
                    useBroadcastStore.getState().resetToAuto();
                });
                event.preventDefault();
                break;
        }
    }, [
        stackDriverIds,
        setFeaturedDriver,
        toggleCameraLock,
        setCameraMode,
        cameraMode,
        toggleAdvancedOptions,
        toggleLeaderboard,
        nextSuggestion,
        prevSuggestion,
        pendingSuggestions,
        acceptSuggestion,
        selectedSuggestionIndex,
        replayLastEvent,
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

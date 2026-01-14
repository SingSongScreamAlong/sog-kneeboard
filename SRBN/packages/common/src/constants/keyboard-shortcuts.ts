// =====================================================================
// Keyboard Shortcuts
// Keyboard shortcut definitions for director actions
// =====================================================================

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
    key: string;
    code: string;
    description: string;
    category: 'driver' | 'camera' | 'replay' | 'ui' | 'navigation';
    requiresModifier?: boolean;
    modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
}

/**
 * All keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS: Record<string, KeyboardShortcut> = {
    // Driver selection
    SELECT_DRIVER_1: {
        key: '1',
        code: 'Digit1',
        description: 'Select driver 1 from stack',
        category: 'driver',
    },
    SELECT_DRIVER_2: {
        key: '2',
        code: 'Digit2',
        description: 'Select driver 2 from stack',
        category: 'driver',
    },
    SELECT_DRIVER_3: {
        key: '3',
        code: 'Digit3',
        description: 'Select driver 3 from stack',
        category: 'driver',
    },
    SELECT_DRIVER_4: {
        key: '4',
        code: 'Digit4',
        description: 'Select driver 4 from stack',
        category: 'driver',
    },
    SELECT_DRIVER_5: {
        key: '5',
        code: 'Digit5',
        description: 'Select driver 5 from stack',
        category: 'driver',
    },

    // Camera controls
    LOCK_CAMERA: {
        key: ' ',
        code: 'Space',
        description: 'Lock/unlock current camera',
        category: 'camera',
    },
    CYCLE_CAMERA_MODE: {
        key: 'Tab',
        code: 'Tab',
        description: 'Cycle camera mode (world/onboard/battle)',
        category: 'camera',
    },
    PREV_SUGGESTION: {
        key: 'ArrowLeft',
        code: 'ArrowLeft',
        description: 'Previous AI suggestion',
        category: 'camera',
    },
    NEXT_SUGGESTION: {
        key: 'ArrowRight',
        code: 'ArrowRight',
        description: 'Next AI suggestion',
        category: 'camera',
    },
    ACCEPT_SUGGESTION: {
        key: 'Enter',
        code: 'Enter',
        description: 'Accept current AI suggestion',
        category: 'camera',
    },

    // Replay controls
    REPLAY_LAST_EVENT: {
        key: 'r',
        code: 'KeyR',
        description: 'Replay last event',
        category: 'replay',
    },

    // UI controls
    TOGGLE_LEADERBOARD: {
        key: 'l',
        code: 'KeyL',
        description: 'Toggle leaderboard expansion',
        category: 'ui',
    },
    TOGGLE_ADVANCED: {
        key: 'a',
        code: 'KeyA',
        description: 'Toggle advanced options panel',
        category: 'ui',
    },
    CLEAR_SELECTION: {
        key: 'Escape',
        code: 'Escape',
        description: 'Clear selection / exit mode',
        category: 'navigation',
    },
};

/**
 * Get shortcuts by category
 */
export function getShortcutsByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
    return Object.values(KEYBOARD_SHORTCUTS).filter(s => s.category === category);
}

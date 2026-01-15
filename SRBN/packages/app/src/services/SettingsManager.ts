// =====================================================================
// SettingsManager
// Persists user settings, scene configurations, and preferences
// =====================================================================

const STORAGE_KEYS = {
    SCENES: 'broadcastbox:scenes',
    AUDIO: 'broadcastbox:audio',
    PREFERENCES: 'broadcastbox:preferences',
    SHORTCUTS: 'broadcastbox:shortcuts',
};

export interface SceneConfig {
    id: string;
    name: string;
    layout: string;
    overlays: string[];
    sources: string[];
}

export interface AudioSettings {
    masterVolume: number;
    youtubeUrl: string | null;
    driverAudioMuted: Record<string, boolean>;
    activeSource: string;
}

export interface UserPreferences {
    theme: 'dark' | 'light';
    showAdvancedOptions: boolean;
    aiAggressiveness: number;
    overlayVerbosity: 'minimal' | 'standard' | 'detailed';
    leaderboardExpanded: boolean;
    autoSwitchBattles: boolean;
}

export interface ShortcutConfig {
    action: string;
    key: string;
    modifiers: string[];
}

class SettingsManager {
    // Scene Configurations
    saveScenes(scenes: SceneConfig[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.SCENES, JSON.stringify(scenes));
            console.log('💾 Scenes saved');
        } catch (error) {
            console.error('Failed to save scenes:', error);
        }
    }

    loadScenes(): SceneConfig[] {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SCENES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load scenes:', error);
            return [];
        }
    }

    // Audio Settings
    saveAudioSettings(settings: AudioSettings): void {
        try {
            localStorage.setItem(STORAGE_KEYS.AUDIO, JSON.stringify(settings));
            console.log('💾 Audio settings saved');
        } catch (error) {
            console.error('Failed to save audio settings:', error);
        }
    }

    loadAudioSettings(): AudioSettings | null {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.AUDIO);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load audio settings:', error);
            return null;
        }
    }

    // User Preferences
    savePreferences(prefs: UserPreferences): void {
        try {
            localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
            console.log('💾 Preferences saved');
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }

    loadPreferences(): UserPreferences {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }

        // Return defaults
        return {
            theme: 'dark',
            showAdvancedOptions: false,
            aiAggressiveness: 50,
            overlayVerbosity: 'standard',
            leaderboardExpanded: false,
            autoSwitchBattles: true,
        };
    }

    // Keyboard Shortcuts
    saveShortcuts(shortcuts: ShortcutConfig[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.SHORTCUTS, JSON.stringify(shortcuts));
            console.log('💾 Shortcuts saved');
        } catch (error) {
            console.error('Failed to save shortcuts:', error);
        }
    }

    loadShortcuts(): ShortcutConfig[] {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SHORTCUTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load shortcuts:', error);
            return [];
        }
    }

    // Export all settings
    exportSettings(): string {
        const allSettings = {
            scenes: this.loadScenes(),
            audio: this.loadAudioSettings(),
            preferences: this.loadPreferences(),
            shortcuts: this.loadShortcuts(),
            exportDate: new Date().toISOString(),
        };
        return JSON.stringify(allSettings, null, 2);
    }

    // Import settings from JSON
    importSettings(json: string): boolean {
        try {
            const data = JSON.parse(json);

            if (data.scenes) this.saveScenes(data.scenes);
            if (data.audio) this.saveAudioSettings(data.audio);
            if (data.preferences) this.savePreferences(data.preferences);
            if (data.shortcuts) this.saveShortcuts(data.shortcuts);

            console.log('📥 Settings imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }

    // Clear all settings
    clearAll(): void {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🗑️ All settings cleared');
    }
}

// Singleton export
export const settingsManager = new SettingsManager();

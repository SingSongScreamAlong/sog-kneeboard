// =====================================================================
// Scene Manager
// Manages broadcast scenes, layouts, and transitions
// =====================================================================

import { create } from 'zustand';
import type {
    Scene,
    SceneType,
    SceneLayout,
    TransitionType,
    OverlayConfig
} from './types';

// Default layouts for each scene type
const DEFAULT_LAYOUTS: Record<SceneType, SceneLayout> = {
    world: {
        type: 'single',
        primary: { x: 0, y: 0, width: 1, height: 1 },
    },
    onboard: {
        type: 'single',
        primary: { x: 0, y: 0, width: 1, height: 1 },
    },
    split: {
        type: 'split-h',
        primary: { x: 0, y: 0, width: 0.5, height: 1 },
        secondary: { x: 0.5, y: 0, width: 0.5, height: 1 },
    },
    replay: {
        type: 'single',
        primary: { x: 0, y: 0, width: 1, height: 1 },
    },
    standings: {
        type: 'single',
        primary: { x: 0, y: 0, width: 1, height: 1 },
    },
    custom: {
        type: 'single',
        primary: { x: 0, y: 0, width: 1, height: 1 },
    },
};

// Default overlays (timing-tower disabled since Leaderboard is visible on right)
const DEFAULT_OVERLAYS: OverlayConfig[] = [
    { type: 'timing-tower', enabled: false, position: { x: 0.02, y: 0.1 }, opacity: 1, zIndex: 10 },
    { type: 'lower-third', enabled: true, position: { x: 0.1, y: 0.85 }, opacity: 1, zIndex: 20 },
    { type: 'battle-box', enabled: false, position: { x: 0.7, y: 0.1 }, opacity: 1, zIndex: 15 },
    { type: 'incident-banner', enabled: false, position: { x: 0.5, y: 0.05 }, opacity: 1, zIndex: 30 },
];

interface SceneManagerState {
    scenes: Scene[];
    activeSceneId: string | null;
    previewSceneId: string | null;
    isTransitioning: boolean;
    transitionProgress: number;
    defaultTransition: TransitionType;
    transitionDuration: number;

    // Actions
    createScene: (name: string, type: SceneType) => Scene;
    deleteScene: (sceneId: string) => void;
    updateScene: (sceneId: string, updates: Partial<Scene>) => void;
    setActiveScene: (sceneId: string, transition?: TransitionType) => void;
    setPreviewScene: (sceneId: string | null) => void;
    quickSwitch: (sceneId: string) => void; // Cut transition
    setTransitionDuration: (ms: number) => void;
    setDefaultTransition: (type: TransitionType) => void;
}

export const useSceneManager = create<SceneManagerState>((set, get) => {
    // Create default scenes
    const defaultScenes: Scene[] = [
        {
            id: 'scene-world',
            name: 'World Feed',
            type: 'world',
            layout: DEFAULT_LAYOUTS.world,
            sources: [],
            overlays: [...DEFAULT_OVERLAYS],
            transition: 'fade',
        },
        {
            id: 'scene-onboard',
            name: 'Onboard',
            type: 'onboard',
            layout: DEFAULT_LAYOUTS.onboard,
            sources: [],
            overlays: DEFAULT_OVERLAYS.map(o => ({ ...o, enabled: o.type === 'lower-third' })),
            transition: 'cut',
        },
        {
            id: 'scene-battle',
            name: 'Battle View',
            type: 'split',
            layout: DEFAULT_LAYOUTS.split,
            sources: [],
            overlays: [
                ...DEFAULT_OVERLAYS.filter(o => o.type !== 'timing-tower'),
                { type: 'battle-box', enabled: true, position: { x: 0.45, y: 0.02 }, opacity: 1, zIndex: 25 },
            ],
            transition: 'wipe-left',
        },
        {
            id: 'scene-replay',
            name: 'Replay',
            type: 'replay',
            layout: DEFAULT_LAYOUTS.replay,
            sources: [],
            overlays: [
                { type: 'lower-third', enabled: true, position: { x: 0.1, y: 0.85 }, opacity: 1, zIndex: 20 },
            ],
            transition: 'dissolve',
        },
    ];

    return {
        scenes: defaultScenes,
        activeSceneId: 'scene-world',
        previewSceneId: null,
        isTransitioning: false,
        transitionProgress: 0,
        defaultTransition: 'fade',
        transitionDuration: 300,

        createScene: (name, type) => {
            const scene: Scene = {
                id: `scene-${Date.now()}`,
                name,
                type,
                layout: DEFAULT_LAYOUTS[type],
                sources: [],
                overlays: [...DEFAULT_OVERLAYS],
                transition: get().defaultTransition,
            };
            set(state => ({ scenes: [...state.scenes, scene] }));
            return scene;
        },

        deleteScene: (sceneId) => {
            set(state => ({
                scenes: state.scenes.filter(s => s.id !== sceneId),
                activeSceneId: state.activeSceneId === sceneId ? state.scenes[0]?.id || null : state.activeSceneId,
            }));
        },

        updateScene: (sceneId, updates) => {
            set(state => ({
                scenes: state.scenes.map(s => s.id === sceneId ? { ...s, ...updates } : s),
            }));
        },

        setActiveScene: (sceneId, transition) => {
            const { scenes, transitionDuration, defaultTransition } = get();
            const scene = scenes.find(s => s.id === sceneId);
            if (!scene) return;

            const transitionType = transition || scene.transition || defaultTransition;

            if (transitionType === 'cut') {
                // Instant switch
                set({ activeSceneId: sceneId });
            } else {
                // Animated transition
                set({ isTransitioning: true, transitionProgress: 0 });

                const startTime = performance.now();
                const animate = () => {
                    const elapsed = performance.now() - startTime;
                    const progress = Math.min(elapsed / transitionDuration, 1);

                    if (progress < 1) {
                        set({ transitionProgress: progress });
                        requestAnimationFrame(animate);
                    } else {
                        set({
                            activeSceneId: sceneId,
                            isTransitioning: false,
                            transitionProgress: 0
                        });
                    }
                };
                requestAnimationFrame(animate);
            }
        },

        setPreviewScene: (sceneId) => {
            set({ previewSceneId: sceneId });
        },

        quickSwitch: (sceneId) => {
            set({ activeSceneId: sceneId });
        },

        setTransitionDuration: (ms) => {
            set({ transitionDuration: ms });
        },

        setDefaultTransition: (type) => {
            set({ defaultTransition: type });
        },
    };
});

// Selector hooks
export const useActiveScene = () => {
    const { scenes, activeSceneId } = useSceneManager();
    return scenes.find(s => s.id === activeSceneId) || null;
};

export const usePreviewScene = () => {
    const { scenes, previewSceneId } = useSceneManager();
    return previewSceneId ? scenes.find(s => s.id === previewSceneId) || null : null;
};

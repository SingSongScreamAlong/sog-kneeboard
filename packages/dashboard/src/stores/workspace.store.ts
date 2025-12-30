// =====================================================================
// Workspace Store
// Manage workspace layouts and panel configurations
// =====================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Panel type definitions
export type PanelType =
    | 'live_timing'
    | 'race_control'
    | 'incidents'
    | 'penalties'
    | 'messaging'
    | 'flag_history'
    | 'telemetry_timeline'
    | 'driver_comparison'
    | 'track_map'
    | 'standings'
    | 'session_info'
    | 'driver_cameras';

export interface WorkspacePanel {
    id: string;
    type: PanelType;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isMinimized?: boolean;
    isLocked?: boolean;
    title?: string;
}

export interface WorkspaceLayout {
    id: string;
    name: string;
    description?: string;
    isDefault?: boolean;
    panels: WorkspacePanel[];
    createdAt: Date;
    updatedAt: Date;
}

interface WorkspaceState {
    currentLayoutId: string;
    layouts: WorkspaceLayout[];
    theme: 'dark' | 'light';
    snapToGrid: boolean;
    gridSize: number;

    // Actions
    setCurrentLayout: (layoutId: string) => void;
    createLayout: (name: string, panels: WorkspacePanel[]) => string;
    updateLayout: (layoutId: string, updates: Partial<WorkspaceLayout>) => void;
    deleteLayout: (layoutId: string) => void;
    duplicateLayout: (layoutId: string, newName: string) => string;

    // Panel actions
    addPanel: (panel: Omit<WorkspacePanel, 'id'>) => void;
    updatePanel: (panelId: string, updates: Partial<WorkspacePanel>) => void;
    removePanel: (panelId: string) => void;
    movePanel: (panelId: string, position: { x: number; y: number }) => void;
    resizePanel: (panelId: string, size: { width: number; height: number }) => void;
    toggleMinimize: (panelId: string) => void;

    // Settings
    setTheme: (theme: 'dark' | 'light') => void;
    toggleSnapToGrid: () => void;
    setGridSize: (size: number) => void;
}

// Default layouts
const defaultLayouts: WorkspaceLayout[] = [
    {
        id: 'race-control-default',
        name: 'Race Control',
        description: 'Standard race control layout with timing, flags, and incidents',
        isDefault: true,
        panels: [
            { id: 'p1', type: 'live_timing', position: { x: 0, y: 0 }, size: { width: 4, height: 12 }, title: 'Live Timing' },
            { id: 'p2', type: 'race_control', position: { x: 4, y: 0 }, size: { width: 4, height: 6 }, title: 'Race Control' },
            { id: 'p3', type: 'flag_history', position: { x: 4, y: 6 }, size: { width: 4, height: 6 }, title: 'Flag History' },
            { id: 'p4', type: 'incidents', position: { x: 8, y: 0 }, size: { width: 4, height: 6 }, title: 'Incidents' },
            { id: 'p5', type: 'penalties', position: { x: 8, y: 6 }, size: { width: 4, height: 6 }, title: 'Penalties' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'incident-review',
        name: 'Incident Review',
        description: 'Focused layout for reviewing incidents with telemetry',
        panels: [
            { id: 'p1', type: 'incidents', position: { x: 0, y: 0 }, size: { width: 3, height: 12 }, title: 'Incident Queue' },
            { id: 'p2', type: 'telemetry_timeline', position: { x: 3, y: 0 }, size: { width: 6, height: 6 }, title: 'Timeline' },
            { id: 'p3', type: 'driver_comparison', position: { x: 3, y: 6 }, size: { width: 6, height: 6 }, title: 'Driver Comparison' },
            { id: 'p4', type: 'penalties', position: { x: 9, y: 0 }, size: { width: 3, height: 12 }, title: 'Penalties' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'broadcast-view',
        name: 'Broadcast',
        description: 'Clean layout for broadcast overlay',
        panels: [
            { id: 'p1', type: 'live_timing', position: { x: 0, y: 0 }, size: { width: 3, height: 12 }, title: 'Standings' },
            { id: 'p2', type: 'session_info', position: { x: 9, y: 0 }, size: { width: 3, height: 4 }, title: 'Session Info' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            currentLayoutId: 'race-control-default',
            layouts: defaultLayouts,
            theme: 'dark',
            snapToGrid: true,
            gridSize: 50,

            setCurrentLayout: (layoutId) => set({ currentLayoutId: layoutId }),

            createLayout: (name, panels) => {
                const id = `layout-${Date.now()}`;
                const newLayout: WorkspaceLayout = {
                    id,
                    name,
                    panels,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set(state => ({
                    layouts: [...state.layouts, newLayout],
                    currentLayoutId: id,
                }));
                return id;
            },

            updateLayout: (layoutId, updates) => set(state => ({
                layouts: state.layouts.map(layout =>
                    layout.id === layoutId
                        ? { ...layout, ...updates, updatedAt: new Date() }
                        : layout
                ),
            })),

            deleteLayout: (layoutId) => set(state => {
                const filtered = state.layouts.filter(l => l.id !== layoutId);
                return {
                    layouts: filtered,
                    currentLayoutId: state.currentLayoutId === layoutId
                        ? (filtered[0]?.id || 'race-control-default')
                        : state.currentLayoutId,
                };
            }),

            duplicateLayout: (layoutId, newName) => {
                const source = get().layouts.find(l => l.id === layoutId);
                if (!source) return '';

                const id = `layout-${Date.now()}`;
                const newLayout: WorkspaceLayout = {
                    ...source,
                    id,
                    name: newName,
                    isDefault: false,
                    panels: source.panels.map(p => ({ ...p, id: `panel-${Date.now()}-${Math.random()}` })),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set(state => ({
                    layouts: [...state.layouts, newLayout],
                    currentLayoutId: id,
                }));
                return id;
            },

            addPanel: (panel) => set(state => {
                const currentLayout = state.layouts.find(l => l.id === state.currentLayoutId);
                if (!currentLayout) return state;

                const newPanel: WorkspacePanel = {
                    ...panel,
                    id: `panel-${Date.now()}`,
                };

                return {
                    layouts: state.layouts.map(layout =>
                        layout.id === state.currentLayoutId
                            ? { ...layout, panels: [...layout.panels, newPanel], updatedAt: new Date() }
                            : layout
                    ),
                };
            }),

            updatePanel: (panelId, updates) => set(state => ({
                layouts: state.layouts.map(layout =>
                    layout.id === state.currentLayoutId
                        ? {
                            ...layout,
                            panels: layout.panels.map(p =>
                                p.id === panelId ? { ...p, ...updates } : p
                            ),
                            updatedAt: new Date(),
                        }
                        : layout
                ),
            })),

            removePanel: (panelId) => set(state => ({
                layouts: state.layouts.map(layout =>
                    layout.id === state.currentLayoutId
                        ? {
                            ...layout,
                            panels: layout.panels.filter(p => p.id !== panelId),
                            updatedAt: new Date(),
                        }
                        : layout
                ),
            })),

            movePanel: (panelId, position) => {
                const state = get();
                const gridSize = state.snapToGrid ? state.gridSize : 1;
                const snappedPosition = {
                    x: Math.round(position.x / gridSize) * gridSize,
                    y: Math.round(position.y / gridSize) * gridSize,
                };
                get().updatePanel(panelId, { position: snappedPosition });
            },

            resizePanel: (panelId, size) => {
                const state = get();
                const gridSize = state.snapToGrid ? state.gridSize : 1;
                const snappedSize = {
                    width: Math.max(1, Math.round(size.width / gridSize) * gridSize),
                    height: Math.max(1, Math.round(size.height / gridSize) * gridSize),
                };
                get().updatePanel(panelId, { size: snappedSize });
            },

            toggleMinimize: (panelId) => set(state => ({
                layouts: state.layouts.map(layout =>
                    layout.id === state.currentLayoutId
                        ? {
                            ...layout,
                            panels: layout.panels.map(p =>
                                p.id === panelId ? { ...p, isMinimized: !p.isMinimized } : p
                            ),
                        }
                        : layout
                ),
            })),

            setTheme: (theme) => set({ theme }),
            toggleSnapToGrid: () => set(state => ({ snapToGrid: !state.snapToGrid })),
            setGridSize: (gridSize) => set({ gridSize }),
        }),
        {
            name: 'controlbox-workspace',
            partialize: (state) => ({
                currentLayoutId: state.currentLayoutId,
                layouts: state.layouts,
                theme: state.theme,
                snapToGrid: state.snapToGrid,
            }),
        }
    )
);

// =====================================================================
// Workspace Settings Panel
// UI for managing workspace layouts and settings
// =====================================================================

import { useState } from 'react';
import { useWorkspaceStore, type PanelType } from '../../stores/workspace.store';

export function WorkspaceSettings() {
    const {
        currentLayoutId,
        layouts,
        theme,
        snapToGrid,
        gridSize,
        setCurrentLayout,
        createLayout,
        deleteLayout,
        duplicateLayout,
        setTheme,
        toggleSnapToGrid,
        setGridSize,
        addPanel,
    } = useWorkspaceStore();

    const [showNewLayout, setShowNewLayout] = useState(false);
    const [newLayoutName, setNewLayoutName] = useState('');
    const [showAddPanel, setShowAddPanel] = useState(false);

    const currentLayout = layouts.find(l => l.id === currentLayoutId);

    const panelTypes: { type: PanelType; label: string; icon: string }[] = [
        { type: 'live_timing', label: 'Live Timing', icon: '⏱️' },
        { type: 'race_control', label: 'Race Control', icon: '🏁' },
        { type: 'incidents', label: 'Incidents', icon: '⚠️' },
        { type: 'penalties', label: 'Penalties', icon: '🚩' },
        { type: 'messaging', label: 'Messaging', icon: '💬' },
        { type: 'flag_history', label: 'Flag History', icon: '📋' },
        { type: 'telemetry_timeline', label: 'Timeline', icon: '📊' },
        { type: 'driver_comparison', label: 'Driver Compare', icon: '📈' },
        { type: 'track_map', label: 'Track Map', icon: '🗺️' },
        { type: 'standings', label: 'Standings', icon: '🏆' },
        { type: 'session_info', label: 'Session Info', icon: 'ℹ️' },
    ];

    const handleCreateLayout = () => {
        if (!newLayoutName.trim()) return;
        createLayout(newLayoutName, []);
        setNewLayoutName('');
        setShowNewLayout(false);
    };

    const handleAddPanel = (type: PanelType) => {
        addPanel({
            type,
            position: { x: 0, y: 0 },
            size: { width: 4, height: 6 },
            title: panelTypes.find(p => p.type === type)?.label,
        });
        setShowAddPanel(false);
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">⚙️</span>
                    Workspace Settings
                </h2>
            </div>

            {/* Layout Selection */}
            <div className="p-4 border-b border-slate-700">
                <label className="text-sm text-slate-400 block mb-2">Current Layout</label>
                <div className="flex gap-2">
                    <select
                        value={currentLayoutId}
                        onChange={(e) => setCurrentLayout(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                    >
                        {layouts.map(layout => (
                            <option key={layout.id} value={layout.id}>
                                {layout.name} {layout.isDefault ? '(Default)' : ''}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowNewLayout(true)}
                        className="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg"
                        title="New Layout"
                    >
                        +
                    </button>
                </div>

                {/* Layout info */}
                {currentLayout && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                            {currentLayout.panels.length} panels
                        </span>
                        <button
                            onClick={() => duplicateLayout(currentLayoutId, `${currentLayout.name} Copy`)}
                            className="text-xs text-slate-400 hover:text-white"
                        >
                            Duplicate
                        </button>
                        {!currentLayout.isDefault && (
                            <button
                                onClick={() => deleteLayout(currentLayoutId)}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* New Layout Form */}
            {showNewLayout && (
                <div className="p-4 border-b border-slate-700 bg-slate-700/30">
                    <label className="text-sm text-slate-400 block mb-2">New Layout Name</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newLayoutName}
                            onChange={(e) => setNewLayoutName(e.target.value)}
                            placeholder="My Custom Layout"
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                            autoFocus
                        />
                        <button
                            onClick={handleCreateLayout}
                            disabled={!newLayoutName.trim()}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white rounded-lg"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => setShowNewLayout(false)}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Add Panel */}
            <div className="p-4 border-b border-slate-700">
                <button
                    onClick={() => setShowAddPanel(!showAddPanel)}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                    <span>+</span>
                    <span>Add Panel</span>
                </button>

                {showAddPanel && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {panelTypes.map(panel => (
                            <button
                                key={panel.type}
                                onClick={() => handleAddPanel(panel.type)}
                                className="p-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg text-left flex items-center gap-2"
                            >
                                <span className="text-lg">{panel.icon}</span>
                                <span className="text-sm text-white">{panel.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Theme Toggle */}
            <div className="p-4 border-b border-slate-700">
                <label className="text-sm text-slate-400 block mb-2">Theme</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTheme('dark')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium ${theme === 'dark'
                                ? 'bg-slate-900 text-white border-2 border-primary-500'
                                : 'bg-slate-700 text-slate-300 border-2 border-transparent'
                            }`}
                    >
                        🌙 Dark
                    </button>
                    <button
                        onClick={() => setTheme('light')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium ${theme === 'light'
                                ? 'bg-white text-slate-900 border-2 border-primary-500'
                                : 'bg-slate-700 text-slate-300 border-2 border-transparent'
                            }`}
                    >
                        ☀️ Light
                    </button>
                </div>
            </div>

            {/* Grid Settings */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={snapToGrid}
                            onChange={toggleSnapToGrid}
                            className="w-4 h-4 bg-slate-700 border-slate-600 rounded accent-primary-500"
                        />
                        <span className="text-sm text-white">Snap to Grid</span>
                    </label>
                </div>

                {snapToGrid && (
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Grid Size: {gridSize}px</label>
                        <input
                            type="range"
                            min="25"
                            max="100"
                            step="25"
                            value={gridSize}
                            onChange={(e) => setGridSize(parseInt(e.target.value))}
                            className="w-full accent-primary-500"
                        />
                    </div>
                )}
            </div>

            {/* Current Panels List */}
            {currentLayout && currentLayout.panels.length > 0 && (
                <div className="p-4 border-t border-slate-700">
                    <label className="text-sm text-slate-400 block mb-2">Active Panels</label>
                    <div className="space-y-1">
                        {currentLayout.panels.map(panel => {
                            const panelInfo = panelTypes.find(p => p.type === panel.type);
                            return (
                                <div
                                    key={panel.id}
                                    className="flex items-center justify-between p-2 bg-slate-700/30 rounded"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{panelInfo?.icon}</span>
                                        <span className="text-sm text-white">{panel.title || panelInfo?.label}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {panel.size.width}×{panel.size.height}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

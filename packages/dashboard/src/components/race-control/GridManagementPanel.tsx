// =====================================================================
// Grid Management Panel
// Field sorting and grid position management
// =====================================================================

import { useState } from 'react';
import { useRosterStore } from '../../stores/roster.store';
import { useSessionStore } from '../../stores/session.store';
import type { GridSortOption, GridEntry } from '@controlbox/common';

export function GridManagementPanel() {
    const { grid, setGrid, sortGrid, moveDriverInGrid } = useRosterStore();
    const { timing } = useSessionStore();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Initialize grid from timing if empty
    const displayGrid: GridEntry[] = grid.length > 0 ? grid : timing.map((t, i) => ({
        position: i + 1,
        driverId: t.driverId,
        driverName: t.driverName,
        carNumber: t.carNumber,
        carClass: t.carName,
        iRating: 5000 + Math.random() * 3000,
    }));

    const sortOptions: { value: GridSortOption; label: string }[] = [
        { value: 'qualifying', label: 'Qualifying Time' },
        { value: 'irating', label: 'iRating (High to Low)' },
        { value: 'car_number', label: 'Car Number' },
        { value: 'alphabetical', label: 'Alphabetical' },
    ];

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            const entry = displayGrid[draggedIndex];
            if (entry) {
                moveDriverInGrid(entry.driverId, index + 1);
            }
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSort = (option: GridSortOption) => {
        // If grid is empty, initialize it first
        if (grid.length === 0) {
            setGrid(displayGrid);
        }
        sortGrid(option);
    };

    const handleInvertGrid = () => {
        if (grid.length === 0) {
            setGrid(displayGrid);
        }
        const inverted = [...(grid.length > 0 ? grid : displayGrid)].reverse();
        inverted.forEach((entry, i) => { entry.position = i + 1; });
        setGrid(inverted);
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Grid Management
                </h2>
                <span className="text-slate-400 text-sm">
                    {displayGrid.length} drivers
                </span>
            </div>

            {/* Sort Options */}
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Sort Grid By
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleSort(option.value)}
                            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleInvertGrid}
                    className="w-full mt-2 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 text-sm rounded-lg transition-colors"
                >
                    🔄 Invert Grid
                </button>
            </div>

            {/* Grid Display */}
            <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Starting Grid (Drag to Reorder)
                </h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                    {displayGrid.map((entry, index) => (
                        <div
                            key={entry.driverId}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-move transition-colors ${draggedIndex === index
                                ? 'bg-primary-600/30 border-2 border-primary-500'
                                : 'bg-slate-700/30 hover:bg-slate-700/50'
                                }`}
                        >
                            <span className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg font-mono font-bold text-white">
                                {entry.position}
                            </span>
                            <span className="font-mono font-bold text-primary-400">#{entry.carNumber}</span>
                            <span className="text-white flex-1">{entry.driverName}</span>
                            {entry.qualifyingTime && (
                                <span className="text-slate-400 font-mono text-sm">
                                    {formatTime(entry.qualifyingTime)}
                                </span>
                            )}
                            <span className="text-slate-500 text-sm">⋮⋮</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-700">
                <button
                    onClick={() => {
                        if (grid.length === 0) {
                            setGrid(displayGrid);
                        }
                        // TODO: Apply grid to race
                    }}
                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                >
                    <span>✓</span>
                    Apply Grid
                </button>
            </div>
        </div>
    );
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
}

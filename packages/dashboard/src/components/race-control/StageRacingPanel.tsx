// =====================================================================
// Stage Racing Panel
// Configure and manage stage racing with points and breaks
// =====================================================================

import { useState } from 'react';
import { useSessionStore } from '../../stores/session.store';

interface Stage {
    stageNumber: number;
    name: string;
    endLap: number;
    points: number[];
    playoffPoints: number[];
    isComplete: boolean;
    winnerId?: string;
    winnerName?: string;
}

interface StageConfiguration {
    stages: Stage[];
    playoffPointsEnabled: boolean;
}

const NASCAR_STAGE_POINTS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const NASCAR_PLAYOFF_POINTS = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export function StageRacingPanel() {
    const { timing } = useSessionStore();

    const [config, setConfig] = useState<StageConfiguration>({
        stages: [
            { stageNumber: 1, name: 'Stage 1', endLap: 80, points: [...NASCAR_STAGE_POINTS], playoffPoints: [...NASCAR_PLAYOFF_POINTS], isComplete: false },
            { stageNumber: 2, name: 'Stage 2', endLap: 160, points: [...NASCAR_STAGE_POINTS], playoffPoints: [...NASCAR_PLAYOFF_POINTS], isComplete: false },
            { stageNumber: 3, name: 'Final Stage', endLap: 267, points: [], playoffPoints: [], isComplete: false },
        ],
        playoffPointsEnabled: true,
    });

    const [editingStage, setEditingStage] = useState<number | null>(null);
    const [showAddStage, setShowAddStage] = useState(false);

    // Get current lap from session
    const currentLap = timing[0]?.currentLap || 0;

    // Determine current stage
    const getCurrentStage = (): Stage | null => {
        return config.stages.find(s => !s.isComplete && currentLap < s.endLap) || null;
    };

    const currentStage = getCurrentStage();

    // Calculate laps remaining in current stage
    const lapsToStageEnd = currentStage ? currentStage.endLap - currentLap : 0;

    const handleCompleteStage = (stageNumber: number) => {
        // Get top 10 positions from timing
        const stageResults = timing.slice(0, 10);
        const winner = stageResults[0];

        setConfig(prev => ({
            ...prev,
            stages: prev.stages.map(stage =>
                stage.stageNumber === stageNumber
                    ? {
                        ...stage,
                        isComplete: true,
                        winnerId: winner?.driverId,
                        winnerName: winner?.driverName,
                    }
                    : stage
            ),
        }));
    };

    const handleUpdateStage = (stageNumber: number, updates: Partial<Stage>) => {
        setConfig(prev => ({
            ...prev,
            stages: prev.stages.map(stage =>
                stage.stageNumber === stageNumber
                    ? { ...stage, ...updates }
                    : stage
            ),
        }));
    };

    const handleAddStage = () => {
        const lastStage = config.stages[config.stages.length - 1];
        const newStage: Stage = {
            stageNumber: config.stages.length + 1,
            name: `Stage ${config.stages.length + 1}`,
            endLap: lastStage ? lastStage.endLap + 50 : 50,
            points: [...NASCAR_STAGE_POINTS],
            playoffPoints: config.playoffPointsEnabled ? [...NASCAR_PLAYOFF_POINTS] : [],
            isComplete: false,
        };

        setConfig(prev => ({
            ...prev,
            stages: [...prev.stages, newStage],
        }));
        setShowAddStage(false);
    };

    const handleRemoveStage = (stageNumber: number) => {
        setConfig(prev => ({
            ...prev,
            stages: prev.stages
                .filter(s => s.stageNumber !== stageNumber)
                .map((s, i) => ({ ...s, stageNumber: i + 1 })),
        }));
    };

    const handleResetStages = () => {
        setConfig(prev => ({
            ...prev,
            stages: prev.stages.map(s => ({
                ...s,
                isComplete: false,
                winnerId: undefined,
                winnerName: undefined,
            })),
        }));
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🏁</span>
                    Stage Racing
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleResetStages}
                        className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded"
                    >
                        Reset All
                    </button>
                    <button
                        onClick={() => setShowAddStage(true)}
                        className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-500 text-white rounded"
                    >
                        + Add Stage
                    </button>
                </div>
            </div>

            {/* Current Stage Banner */}
            {currentStage && (
                <div className="bg-gradient-to-r from-green-600/20 to-primary-600/20 border-b border-slate-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm text-slate-400">Current Stage:</span>
                            <span className="ml-2 font-bold text-white">{currentStage.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-sm text-slate-400">Laps to Stage End:</span>
                                <span className="ml-2 font-mono font-bold text-white">{lapsToStageEnd}</span>
                            </div>
                            <button
                                onClick={() => handleCompleteStage(currentStage.stageNumber)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium"
                            >
                                Complete Stage
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stages List */}
            <div className="p-4 space-y-3">
                {config.stages.map((stage) => (
                    <div
                        key={stage.stageNumber}
                        className={`p-3 rounded-lg border ${stage.isComplete
                            ? 'bg-slate-700/30 border-slate-600'
                            : currentStage?.stageNumber === stage.stageNumber
                                ? 'bg-green-900/20 border-green-500/30'
                                : 'bg-slate-700/50 border-slate-600'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${stage.isComplete
                                    ? 'bg-green-600 text-white'
                                    : currentStage?.stageNumber === stage.stageNumber
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-slate-600 text-slate-300'
                                    }`}>
                                    {stage.isComplete ? '✓' : stage.stageNumber}
                                </span>
                                <div>
                                    <h4 className="font-medium text-white">{stage.name}</h4>
                                    <p className="text-xs text-slate-400">
                                        Ends: Lap {stage.endLap}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {stage.isComplete && stage.winnerName && (
                                    <div className="text-right mr-4">
                                        <span className="text-xs text-slate-400">Winner:</span>
                                        <span className="ml-1 text-sm font-medium text-white">{stage.winnerName}</span>
                                    </div>
                                )}
                                {editingStage === stage.stageNumber ? (
                                    <button
                                        onClick={() => setEditingStage(null)}
                                        className="text-xs text-green-400 hover:text-green-300"
                                    >
                                        Done
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setEditingStage(stage.stageNumber)}
                                        className="text-xs text-slate-400 hover:text-white"
                                    >
                                        Edit
                                    </button>
                                )}
                                {config.stages.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveStage(stage.stageNumber)}
                                        className="text-xs text-red-400 hover:text-red-300"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Editing section */}
                        {editingStage === stage.stageNumber && (
                            <div className="mt-3 pt-3 border-t border-slate-600 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Stage Name</label>
                                        <input
                                            type="text"
                                            value={stage.name}
                                            onChange={(e) => handleUpdateStage(stage.stageNumber, { name: e.target.value })}
                                            className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">End Lap</label>
                                        <input
                                            type="number"
                                            value={stage.endLap}
                                            onChange={(e) => handleUpdateStage(stage.stageNumber, { endLap: parseInt(e.target.value) || 0 })}
                                            className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Stage Points (Top 10)</label>
                                    <div className="flex gap-1">
                                        {stage.points.slice(0, 10).map((pts, i) => (
                                            <input
                                                key={i}
                                                type="number"
                                                value={pts}
                                                onChange={(e) => {
                                                    const newPoints = [...stage.points];
                                                    newPoints[i] = parseInt(e.target.value) || 0;
                                                    handleUpdateStage(stage.stageNumber, { points: newPoints });
                                                }}
                                                className="w-10 px-1 py-1 bg-slate-900 border border-slate-600 rounded text-white text-xs text-center"
                                                title={`P${i + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Points preview */}
                        {!editingStage && stage.points.length > 0 && (
                            <div className="mt-2 flex gap-1 flex-wrap">
                                {stage.points.slice(0, 10).map((pts, i) => (
                                    <span key={i} className="text-xs bg-slate-600 px-1.5 py-0.5 rounded">
                                        P{i + 1}: {pts}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Playoff Points Toggle */}
            <div className="px-4 py-3 border-t border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.playoffPointsEnabled}
                        onChange={() => setConfig(prev => ({ ...prev, playoffPointsEnabled: !prev.playoffPointsEnabled }))}
                        className="w-4 h-4 bg-slate-700 border-slate-600 rounded accent-primary-500"
                    />
                    <span className="text-sm text-white">Enable Playoff Points</span>
                    <span className="text-xs text-slate-400">(Winners earn playoff points)</span>
                </label>
            </div>

            {/* Add Stage Modal */}
            {showAddStage && (
                <div className="px-4 py-3 border-t border-slate-700 bg-slate-700/30">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-white">Add new stage after lap:</span>
                        <button
                            onClick={handleAddStage}
                            className="px-4 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded text-sm"
                        >
                            Add Default Stage
                        </button>
                        <button
                            onClick={() => setShowAddStage(false)}
                            className="text-sm text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

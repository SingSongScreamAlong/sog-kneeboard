// =====================================================================
// Race Control Panel
// Main control interface for race management
// =====================================================================

import { useState } from 'react';
import { useRaceControlStore } from '../../stores/race-control.store';
import type { RaceControlFlag, RestartType } from '@controlbox/common';

export function RaceControlPanel() {
    const { state, deployGlobalFlag, deployCaution, endCaution, pauseSession, resumeSession, advanceStage, endSession, completeRestart } = useRaceControlStore();
    const [showCautionModal, setShowCautionModal] = useState(false);
    const [cautionReason, setCautionReason] = useState('');

    const flagButtons: { flag: RaceControlFlag; label: string; color: string; icon: string }[] = [
        { flag: 'green', label: 'Green', color: 'bg-green-600 hover:bg-green-500', icon: '🟢' },
        { flag: 'yellow', label: 'Yellow', color: 'bg-yellow-500 hover:bg-yellow-400 text-black', icon: '🟡' },
        { flag: 'red', label: 'Red', color: 'bg-red-600 hover:bg-red-500', icon: '🔴' },
        { flag: 'white', label: 'White', color: 'bg-white hover:bg-gray-100 text-black', icon: '⚪' },
        { flag: 'checkered', label: 'Checkered', color: 'bg-gradient-to-r from-black to-white text-gray-600', icon: '🏁' },
    ];

    const handleDeployCaution = () => {
        if (cautionReason.trim()) {
            deployCaution('full_course', cautionReason);
            setCautionReason('');
            setShowCautionModal(false);
        }
    };

    const handleEndCaution = (type: RestartType) => {
        endCaution(type);
    };

    const isUnderCaution = state?.isUnderCaution ?? false;
    const isPaused = state?.isPaused ?? false;
    const restartPending = state?.restartPending ?? false;

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🏎️</span>
                    Race Control
                </h2>
                <div className="flex items-center gap-2">
                    {/* Status indicators */}
                    {isUnderCaution && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full animate-pulse">
                            ⚠️ CAUTION
                        </span>
                    )}
                    {isPaused && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                            ⏸️ PAUSED
                        </span>
                    )}
                    {restartPending && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                            🔄 RESTART PENDING
                        </span>
                    )}
                </div>
            </div>

            {/* Flag Controls */}
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Track Flags
                </h3>
                <div className="grid grid-cols-5 gap-2">
                    {flagButtons.map(({ flag, label, color, icon }) => (
                        <button
                            key={flag}
                            onClick={() => deployGlobalFlag(flag, `Manual ${label} flag`)}
                            className={`${color} px-3 py-3 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 flex flex-col items-center gap-1 shadow-lg`}
                        >
                            <span className="text-xl">{icon}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Caution Controls */}
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Caution Management
                </h3>
                {!isUnderCaution ? (
                    <button
                        onClick={() => setShowCautionModal(true)}
                        className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">🚨</span>
                        Deploy Full Course Caution
                    </button>
                ) : (
                    <div className="space-y-3">
                        <div className="text-center py-2 bg-yellow-500/20 rounded-lg text-yellow-400 font-medium">
                            Caution Active: {state?.activeCaution?.reason}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleEndCaution('single_file')}
                                className="py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg"
                            >
                                Single File Restart
                            </button>
                            <button
                                onClick={() => handleEndCaution('double_file')}
                                className="py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg"
                            >
                                Double File Restart
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Restart Controls */}
            {restartPending && (
                <div className="p-4 border-b border-slate-700 bg-blue-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                                Restart Pending
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                {state?.pendingRestart?.type.replace('_', ' ')} restart on Lap {state?.pendingRestart?.lap}
                            </p>
                        </div>
                        <button
                            onClick={completeRestart}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center gap-2"
                        >
                            <span>🟢</span>
                            Go Green
                        </button>
                    </div>
                </div>
            )}

            {/* Session Controls */}
            <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Session Control
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {!isPaused ? (
                        <button
                            onClick={pauseSession}
                            className="py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                        >
                            <span>⏸️</span> Pause Session
                        </button>
                    ) : (
                        <button
                            onClick={resumeSession}
                            className="py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                        >
                            <span>▶️</span> Resume Session
                        </button>
                    )}
                    <button
                        onClick={advanceStage}
                        className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                    >
                        <span>⏭️</span> Advance Stage
                    </button>
                    <button
                        onClick={endSession}
                        className="col-span-2 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                    >
                        <span>🏁</span> End Session
                    </button>
                </div>
            </div>

            {/* Caution Modal */}
            {showCautionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Deploy Caution</h3>
                        <input
                            type="text"
                            value={cautionReason}
                            onChange={(e) => setCautionReason(e.target.value)}
                            placeholder="Reason for caution..."
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500 mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCautionModal(false)}
                                className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeployCaution}
                                disabled={!cautionReason.trim()}
                                className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-600 text-white font-bold rounded-lg"
                            >
                                Deploy Caution
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

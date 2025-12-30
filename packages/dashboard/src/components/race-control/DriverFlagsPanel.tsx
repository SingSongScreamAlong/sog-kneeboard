// =====================================================================
// Driver Flags Panel
// Interface for issuing driver-specific flags
// =====================================================================

import { useState } from 'react';
import { useRaceControlStore } from '../../stores/race-control.store';
import { useSessionStore } from '../../stores/session.store';
import type { RaceControlDriverFlag } from '@controlbox/common';

export function DriverFlagsPanel() {
    const { state, deployDriverFlag, clearDriverFlag } = useRaceControlStore();
    const { drivers, timing } = useSessionStore();
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [flagReason, setFlagReason] = useState('');
    const [selectedFlag, setSelectedFlag] = useState<RaceControlDriverFlag>('black');

    const flagOptions: { flag: RaceControlDriverFlag; label: string; color: string; description: string }[] = [
        { flag: 'black', label: 'Black Flag', color: 'bg-black border-white', description: 'Disqualification - Pit immediately' },
        { flag: 'black_white', label: 'Black & White', color: 'bg-gradient-to-r from-black to-white', description: 'Warning for unsportsmanlike conduct' },
        { flag: 'blue', label: 'Blue Flag', color: 'bg-blue-600', description: 'Faster car approaching - let them pass' },
        { flag: 'meatball', label: 'Meatball', color: 'bg-orange-500', description: 'Mechanical issue - pit for inspection' },
        { flag: 'penalty', label: 'Penalty', color: 'bg-purple-600', description: 'Penalty notification' },
    ];

    const handleIssueFlag = () => {
        if (selectedDriver && selectedFlag) {
            const driver = drivers.find(d => d.driverId === selectedDriver);
            deployDriverFlag(
                selectedDriver,
                driver?.driverName || 'Unknown',
                selectedFlag,
                flagReason || `${selectedFlag} flag issued`
            );
            setShowModal(false);
            setFlagReason('');
            setSelectedDriver(null);
        }
    };

    // Get active driver flags
    const activeFlags = Object.entries(state?.flags.driverFlags || {}).filter(
        ([_, flag]) => flag !== 'none'
    );

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🏴</span>
                    Driver Flags
                </h2>
                {activeFlags.length > 0 && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                        {activeFlags.length} Active
                    </span>
                )}
            </div>

            {/* Active Flags */}
            {activeFlags.length > 0 && (
                <div className="p-4 border-b border-slate-700 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Active Flags
                    </h3>
                    {activeFlags.map(([driverId, flag]) => {
                        const driver = drivers.find(d => d.driverId === driverId);
                        const timingEntry = timing.find(t => t.driverId === driverId);
                        return (
                            <div
                                key={driverId}
                                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-white">
                                        #{timingEntry?.carNumber || '?'}
                                    </span>
                                    <span className="text-white">{driver?.driverName || 'Unknown'}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${flag === 'black' ? 'bg-black text-white border border-white' :
                                            flag === 'blue' ? 'bg-blue-600 text-white' :
                                                flag === 'meatball' ? 'bg-orange-500 text-white' :
                                                    'bg-purple-600 text-white'
                                        }`}>
                                        {flag.replace('_', ' ')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => clearDriverFlag(driverId)}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded"
                                >
                                    Clear
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Driver List */}
            <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Issue Flag to Driver
                </h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                    {timing.slice(0, 20).map((entry) => {
                        const hasFlag = state?.flags.driverFlags[entry.driverId] && state.flags.driverFlags[entry.driverId] !== 'none';
                        return (
                            <button
                                key={entry.driverId}
                                onClick={() => {
                                    setSelectedDriver(entry.driverId);
                                    setShowModal(true);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${hasFlag
                                        ? 'bg-red-500/20 hover:bg-red-500/30'
                                        : 'bg-slate-700/30 hover:bg-slate-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 text-center font-mono text-slate-400">
                                        P{entry.position}
                                    </span>
                                    <span className="font-mono font-bold text-white">#{entry.carNumber}</span>
                                    <span className="text-slate-300">{entry.driverName}</span>
                                </div>
                                <span className="text-slate-500 text-sm">→</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Flag Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Issue Flag to {timing.find(t => t.driverId === selectedDriver)?.driverName}
                        </h3>

                        {/* Flag Selection */}
                        <div className="space-y-2 mb-4">
                            {flagOptions.map(({ flag, label, color, description }) => (
                                <button
                                    key={flag}
                                    onClick={() => setSelectedFlag(flag)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${selectedFlag === flag
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-transparent bg-slate-700/50 hover:bg-slate-700'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded ${color}`} />
                                    <div className="text-left">
                                        <div className="font-semibold text-white">{label}</div>
                                        <div className="text-xs text-slate-400">{description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Reason */}
                        <input
                            type="text"
                            value={flagReason}
                            onChange={(e) => setFlagReason(e.target.value)}
                            placeholder="Reason (optional)..."
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 mb-4"
                        />

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedDriver(null);
                                }}
                                className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleIssueFlag}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg"
                            >
                                Issue Flag
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

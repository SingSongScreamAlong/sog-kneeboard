// =====================================================================
// Recommendation Panel
// Displays pending recommendations for steward review
// Uses honest language — RECOMMENDS only, never controls iRacing
// =====================================================================

import { useState } from 'react';
import { useRecommendationStore } from '../../stores/recommendation.store';

type RaceStatus = 'GREEN' | 'LOCAL_YELLOW' | 'FULL_COURSE_YELLOW' | 'REVIEW' | 'POST_RACE_REVIEW' | 'NO_ACTION';

const STATUS_DISPLAY: Record<RaceStatus, { label: string; color: string; icon: string }> = {
    GREEN: { label: 'Green (Normal Racing)', color: 'bg-green-500', icon: '🟢' },
    LOCAL_YELLOW: { label: 'Local Yellow', color: 'bg-yellow-400', icon: '🟡' },
    FULL_COURSE_YELLOW: { label: 'Full Course Yellow', color: 'bg-yellow-500', icon: '🟨' },
    REVIEW: { label: 'Under Review', color: 'bg-orange-500', icon: '🔍' },
    POST_RACE_REVIEW: { label: 'Post-Race Review', color: 'bg-purple-500', icon: '⏳' },
    NO_ACTION: { label: 'No Action Required', color: 'bg-slate-500', icon: '✓' },
};

export function RecommendationPanel() {
    const {
        pendingRecommendations,
        acceptRecommendation,
        overrideRecommendation,
        dismissRecommendation,
        deferToPostRace,
    } = useRecommendationStore();

    const [showOverride, setShowOverride] = useState<string | null>(null);
    const [overrideStatus, setOverrideStatus] = useState<RaceStatus>('GREEN');
    const [notes, setNotes] = useState('');

    const handleAccept = (id: string) => {
        acceptRecommendation(id, notes || undefined);
        setNotes('');
    };

    const handleOverride = (id: string) => {
        overrideRecommendation(id, overrideStatus, notes || undefined);
        setShowOverride(null);
        setNotes('');
    };

    const handleDismiss = (id: string) => {
        dismissRecommendation(id, notes || undefined);
        setNotes('');
    };

    const handleDefer = (id: string) => {
        deferToPostRace(id, notes || undefined);
        setNotes('');
    };

    const getConfidenceBars = (confidence: string) => {
        const bars = confidence === 'HIGH' ? 8 : confidence === 'MEDIUM' ? 5 : 2;
        return (
            <div className="flex gap-0.5">
                {Array.from({ length: 10 }, (_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-4 rounded-sm ${i < bars
                                ? confidence === 'HIGH' ? 'bg-green-500' :
                                    confidence === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'
                                : 'bg-slate-600'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (pendingRecommendations.length === 0) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="text-center text-slate-500">
                    <span className="text-4xl block mb-2">✅</span>
                    <p>No pending recommendations</p>
                    <p className="text-xs mt-2">Recommendations will appear when incidents are detected</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {pendingRecommendations.map(rec => {
                const statusInfo = STATUS_DISPLAY[rec.recommendedStatus];

                return (
                    <div
                        key={rec.id}
                        className={`bg-slate-800 rounded-xl border-2 overflow-hidden ${rec.confidence === 'HIGH'
                                ? 'border-orange-500 animate-pulse'
                                : 'border-slate-700'
                            }`}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🚨</span>
                                <span className="font-bold text-white uppercase tracking-wider text-sm">
                                    Recommended Status
                                </span>
                            </div>
                            <span className="text-xs text-slate-400">
                                #{rec.id.split('-').pop()}
                            </span>
                        </div>

                        {/* Recommended Status */}
                        <div className="p-4 border-b border-slate-700">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${statusInfo.color} text-white font-bold text-lg`}>
                                <span>{statusInfo.icon}</span>
                                <span>{statusInfo.label}</span>
                            </div>

                            {/* Confidence */}
                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-sm text-slate-400">Confidence:</span>
                                {getConfidenceBars(rec.confidence)}
                                <span className="text-sm text-white font-medium">{rec.confidence}</span>
                            </div>
                        </div>

                        {/* Reasoning */}
                        <div className="p-4 border-b border-slate-700">
                            <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Reasoning</h4>
                            <p className="text-white text-sm">{rec.reasoning}</p>
                        </div>

                        {/* Context */}
                        <div className="p-4 border-b border-slate-700 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-400">Affected Drivers:</span>
                                <div className="text-white mt-1">
                                    {rec.affectedDrivers.map(d => `#${d.carNumber} ${d.driverName}`).join(', ') || 'Unknown'}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-400">Location:</span>
                                <div className="text-white mt-1">
                                    Lap {rec.lapNumber} • {Math.floor(rec.sessionTimeMs / 60000)}:{String(Math.floor((rec.sessionTimeMs % 60000) / 1000)).padStart(2, '0')}
                                </div>
                            </div>
                        </div>

                        {/* Analysis Facts */}
                        <div className="p-4 border-b border-slate-700">
                            <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Analysis Factors</h4>
                            <div className="flex flex-wrap gap-2">
                                {rec.analysisFacts.map((fact, i) => (
                                    <span
                                        key={i}
                                        className={`px-2 py-1 rounded text-xs ${fact.weight === 'CRITICAL' ? 'bg-red-600 text-white' :
                                                fact.weight === 'HIGH' ? 'bg-orange-600 text-white' :
                                                    fact.weight === 'MEDIUM' ? 'bg-yellow-600 text-black' :
                                                        'bg-slate-600 text-white'
                                            }`}
                                        title={fact.description}
                                    >
                                        {fact.description}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Override Form */}
                        {showOverride === rec.id && (
                            <div className="p-4 border-b border-slate-700 bg-slate-700/30">
                                <h4 className="text-sm font-medium text-white mb-2">Override with different status:</h4>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {(Object.entries(STATUS_DISPLAY) as [RaceStatus, typeof STATUS_DISPLAY[RaceStatus]][]).map(([status, info]) => (
                                        <button
                                            key={status}
                                            onClick={() => setOverrideStatus(status)}
                                            className={`px-2 py-1 rounded text-xs text-left ${overrideStatus === status
                                                    ? `${info.color} text-white`
                                                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                                }`}
                                        >
                                            {info.icon} {info.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOverride(rec.id)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium"
                                    >
                                        Confirm Override
                                    </button>
                                    <button
                                        onClick={() => setShowOverride(null)}
                                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="p-4 border-b border-slate-700">
                            <input
                                type="text"
                                placeholder="Optional notes for audit log..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm placeholder-slate-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="p-4 flex gap-2">
                            <button
                                onClick={() => handleAccept(rec.id)}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                ✓ Accept
                            </button>
                            <button
                                onClick={() => setShowOverride(showOverride === rec.id ? null : rec.id)}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
                            >
                                Override
                            </button>
                            <button
                                onClick={() => handleDismiss(rec.id)}
                                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={() => handleDefer(rec.id)}
                                className="py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                                title="Defer to Post-Race Review"
                            >
                                ⏳
                            </button>
                        </div>

                        {/* Disclaimer */}
                        <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700">
                            <p className="text-xs text-slate-500 text-center">
                                ⓘ This is an internal recommendation. It does not control iRacing flags.
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

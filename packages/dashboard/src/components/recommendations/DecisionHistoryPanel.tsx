// =====================================================================
// Decision History Panel
// Audit log of all steward decisions on recommendations
// =====================================================================

import { useRecommendationStore } from '../../stores/recommendation.store';

type RaceStatus = 'GREEN' | 'LOCAL_YELLOW' | 'FULL_COURSE_YELLOW' | 'REVIEW' | 'POST_RACE_REVIEW' | 'NO_ACTION';

const STATUS_COLORS: Record<RaceStatus, string> = {
    GREEN: 'bg-green-500',
    LOCAL_YELLOW: 'bg-yellow-400',
    FULL_COURSE_YELLOW: 'bg-yellow-500',
    REVIEW: 'bg-orange-500',
    POST_RACE_REVIEW: 'bg-purple-500',
    NO_ACTION: 'bg-slate-500',
};

const ACTION_DISPLAY: Record<string, { label: string; color: string }> = {
    ACCEPT: { label: 'Accepted', color: 'text-green-400' },
    OVERRIDE: { label: 'Overridden', color: 'text-blue-400' },
    DISMISS: { label: 'Dismissed', color: 'text-slate-400' },
    DEFER_TO_POST_RACE: { label: 'Deferred', color: 'text-purple-400' },
};

export function DecisionHistoryPanel() {
    const { decidedRecommendations } = useRecommendationStore();

    // Sort by decision time, most recent first
    const sortedDecisions = [...decidedRecommendations].sort((a, b) => {
        const aTime = a.decision?.decidedAt ? new Date(a.decision.decidedAt).getTime() : 0;
        const bTime = b.decision?.decidedAt ? new Date(b.decision.decidedAt).getTime() : 0;
        return bTime - aTime;
    });

    // Calculate statistics
    const stats = {
        total: decidedRecommendations.length,
        accepted: decidedRecommendations.filter(r => r.decision?.action === 'ACCEPT').length,
        overridden: decidedRecommendations.filter(r => r.decision?.action === 'OVERRIDE').length,
        dismissed: decidedRecommendations.filter(r => r.decision?.action === 'DISMISS').length,
        deferred: decidedRecommendations.filter(r => r.decision?.action === 'DEFER_TO_POST_RACE').length,
    };

    const formatTime = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    Decision History
                </h2>
                <span className="text-sm text-slate-400">
                    {stats.total} decisions
                </span>
            </div>

            {/* Statistics */}
            <div className="px-4 py-3 border-b border-slate-700 grid grid-cols-4 gap-2">
                <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{stats.accepted}</div>
                    <div className="text-xs text-slate-500">Accepted</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{stats.overridden}</div>
                    <div className="text-xs text-slate-500">Overridden</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-slate-400">{stats.dismissed}</div>
                    <div className="text-xs text-slate-500">Dismissed</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{stats.deferred}</div>
                    <div className="text-xs text-slate-500">Deferred</div>
                </div>
            </div>

            {/* Decision List */}
            <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                {sortedDecisions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                        <span className="text-4xl block mb-2">📝</span>
                        No decisions recorded yet
                    </div>
                ) : (
                    sortedDecisions.map(rec => {
                        const decision = rec.decision;
                        if (!decision) return null;

                        const actionInfo = ACTION_DISPLAY[decision.action];
                        const statusColor = STATUS_COLORS[rec.recommendedStatus];

                        return (
                            <div key={rec.id} className="p-3 hover:bg-slate-700/30">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {/* Recommended status */}
                                        <span className={`w-3 h-3 rounded-full ${statusColor}`} />
                                        <span className="text-white font-medium text-sm">
                                            {rec.recommendedStatus.replace(/_/g, ' ')}
                                        </span>

                                        {/* Arrow for override */}
                                        {decision.action === 'OVERRIDE' && decision.overrideStatus && (
                                            <>
                                                <span className="text-slate-500">→</span>
                                                <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[decision.overrideStatus]}`} />
                                                <span className="text-white font-medium text-sm">
                                                    {decision.overrideStatus.replace(/_/g, ' ')}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Action badge */}
                                    <span className={`text-xs font-medium ${actionInfo.color}`}>
                                        {actionInfo.label}
                                    </span>
                                </div>

                                {/* Drivers involved */}
                                {rec.affectedDrivers.length > 0 && (
                                    <div className="text-xs text-slate-400 mb-1">
                                        {rec.affectedDrivers.map(d => `#${d.carNumber}`).join(', ')}
                                    </div>
                                )}

                                {/* Notes */}
                                {decision.notes && (
                                    <div className="text-xs text-slate-500 italic mb-1">
                                        "{decision.notes}"
                                    </div>
                                )}

                                {/* Meta */}
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>Lap {rec.lapNumber}</span>
                                    <span>•</span>
                                    <span>{decision.stewardName}</span>
                                    <span>•</span>
                                    <span>{formatTime(decision.decidedAt)}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Export */}
            {sortedDecisions.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-700">
                    <button
                        onClick={() => {
                            const data = JSON.stringify(sortedDecisions, null, 2);
                            const blob = new Blob([data], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `decision-history-${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                        }}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                    >
                        Export Audit Log (JSON)
                    </button>
                </div>
            )}
        </div>
    );
}

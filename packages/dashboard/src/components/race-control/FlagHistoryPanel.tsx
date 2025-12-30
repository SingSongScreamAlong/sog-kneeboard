// =====================================================================
// Flag History Panel
// Display historical flag events for the session
// =====================================================================

import { useRaceControlStore } from '../../stores/race-control.store';

export function FlagHistoryPanel() {
    const { flagHistory } = useRaceControlStore();

    const getFlagColor = (flag: string): string => {
        const colors: Record<string, string> = {
            green: 'bg-green-500',
            yellow: 'bg-yellow-500',
            red: 'bg-red-500',
            white: 'bg-white',
            checkered: 'bg-gradient-to-r from-black to-white',
            black: 'bg-black border border-white',
            blue: 'bg-blue-500',
            meatball: 'bg-orange-500',
            debris: 'bg-yellow-600',
        };
        return colors[flag] || 'bg-slate-500';
    };

    const getFlagIcon = (flag: string): string => {
        const icons: Record<string, string> = {
            green: '🟢',
            yellow: '🟡',
            red: '🔴',
            white: '⚪',
            checkered: '🏁',
            black: '⬛',
            blue: '🔵',
            meatball: '🟠',
            debris: '⚠️',
        };
        return icons[flag] || '🏴';
    };

    const sortedHistory = [...flagHistory].sort((a, b) =>
        new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    Flag History
                    <span className="ml-auto text-sm font-normal px-2 py-0.5 bg-slate-700 rounded-full">
                        {flagHistory.length} events
                    </span>
                </h2>
            </div>

            <div className="max-h-80 overflow-y-auto">
                {sortedHistory.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                        <span className="text-4xl block mb-2">🏁</span>
                        No flags deployed yet
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700/50">
                        {sortedHistory.map((event) => (
                            <div
                                key={event.id}
                                className="p-3 hover:bg-slate-700/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Flag indicator */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFlagColor(event.flag)}`}>
                                        <span className="text-lg">{getFlagIcon(event.flag)}</span>
                                    </div>

                                    {/* Event details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white capitalize">
                                                {event.flag.replace(/_/g, ' ')} Flag
                                            </span>
                                            {event.type === 'driver' && event.targetDriverName && (
                                                <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                                                    #{event.targetDriverName}
                                                </span>
                                            )}
                                        </div>
                                        {event.reason && (
                                            <p className="text-sm text-slate-400 truncate">
                                                {event.reason}
                                            </p>
                                        )}
                                    </div>

                                    {/* Timestamp and lap */}
                                    <div className="text-right text-sm">
                                        <div className="text-slate-300 font-mono">
                                            Lap {event.lapNumber}
                                        </div>
                                        <div className="text-slate-500 text-xs">
                                            {new Date(event.issuedAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Previous flag indicator */}
                                {event.previousFlag && event.previousFlag !== 'none' && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                        <span>Changed from:</span>
                                        <span className="capitalize">{event.previousFlag}</span>
                                        <span>→</span>
                                        <span className="capitalize">{event.flag}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

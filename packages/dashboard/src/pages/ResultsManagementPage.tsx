// =====================================================================
// Results Management Page
// Race results with penalties and standings
// =====================================================================

import { useState, useRef } from 'react';
import { useResultsStore } from '../stores/results.store';

export function ResultsManagementPage() {
    const {
        sessionResults,
        standings,
        generateSampleResults,
        importIRacingResults,
        exportResults,
    } = useResultsStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'results' | 'standings'>('results');

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    importIRacingResults(json);
                } catch (error) {
                    console.error('Failed to parse JSON file:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleExport = () => {
        const data = exportResults();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `race_results_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-3xl">🏆</span>
                            Results & Standings
                        </h1>
                        <p className="text-slate-400 mt-1">Manage race results, apply penalties, calculate points</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".json"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2"
                        >
                            <span>📥</span>
                            Import Results
                        </button>
                        <button
                            onClick={generateSampleResults}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2"
                        >
                            <span>🎲</span>
                            Generate Sample
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={sessionResults.length === 0}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-600 text-white rounded-lg flex items-center gap-2"
                        >
                            <span>📤</span>
                            Export
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4">
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'results'
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        Race Results
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-slate-600">
                            {sessionResults.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('standings')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'standings'
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        Standings
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
                {sessionResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className="text-6xl mb-4">📊</span>
                        <h2 className="text-xl font-bold text-white mb-2">No Results Loaded</h2>
                        <p className="text-slate-400 mb-6 max-w-md">
                            Import an iRacing results JSON file or generate sample results to get started.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium"
                            >
                                Import iRacing Results
                            </button>
                            <button
                                onClick={generateSampleResults}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                            >
                                Generate Sample Data
                            </button>
                        </div>
                    </div>
                ) : activeTab === 'results' ? (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Pos</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">#</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Driver</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Team</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Laps</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Gap</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Best Lap</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Inc</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Penalties</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Points</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {sessionResults.map(result => (
                                    <tr key={result.driverId} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3">
                                            <span className={`font-mono font-bold text-lg ${result.position === 1 ? 'text-yellow-400' :
                                                result.position === 2 ? 'text-slate-300' :
                                                    result.position === 3 ? 'text-orange-400' :
                                                        'text-white'
                                                }`}>
                                                {result.finishStatus === 'disqualified' ? 'DSQ' : result.position}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono font-bold text-primary-400">
                                                {result.carNumber}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-white font-medium">{result.driverName}</td>
                                        <td className="px-4 py-3 text-slate-400">{result.teamName || '—'}</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-300">{result.lapsCompleted}</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-300">{result.gap}</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-300">
                                            {formatLapTime(result.bestLapTime)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`font-mono ${result.incidentCount > 4 ? 'text-red-400' : 'text-slate-400'}`}>
                                                {result.incidentCount}x
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {result.appliedPenalties.length > 0 ? (
                                                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                                                    {result.appliedPenalties.length} penalty
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="font-bold text-white">{result.totalPoints}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => {
                                                    // TODO: Implement penalty modal
                                                    console.log('Apply penalty for:', result.driverName);
                                                }}
                                                className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
                                            >
                                                Apply Penalty
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Pos</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Driver</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Team</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Points</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Wins</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Podiums</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Laps Led</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Incidents</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {standings.map(entry => (
                                    <tr key={entry.driverId} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3">
                                            <span className={`font-mono font-bold text-lg ${entry.position === 1 ? 'text-yellow-400' :
                                                entry.position === 2 ? 'text-slate-300' :
                                                    entry.position === 3 ? 'text-orange-400' :
                                                        'text-white'
                                                }`}>
                                                {entry.position}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-white font-medium">{entry.driverName}</td>
                                        <td className="px-4 py-3 text-slate-400">{entry.teamName || '—'}</td>
                                        <td className="px-4 py-3 text-right font-bold text-white">{entry.totalPoints}</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-300">{entry.wins}</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-300">{entry.podiums}</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-300">{entry.lapsLed}</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-400">{entry.incidents}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatLapTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
}

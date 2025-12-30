// =====================================================================
// Reports Page
// Advanced reporting with PDF export and trend analysis
// =====================================================================

import { useState } from 'react';
import { useIncidentStore } from '../stores/incident.store';
import { useSessionStore } from '../stores/session.store';

type ReportType = 'post_race' | 'incident_summary' | 'driver_stats' | 'season_trend';

interface Report {
    id: string;
    type: ReportType;
    name: string;
    generatedAt: Date;
    sessionId?: string;
    format: 'pdf' | 'csv' | 'json';
}

export function ReportsPage() {
    const { incidents } = useIncidentStore();
    const { currentSession, timing } = useSessionStore();

    const [selectedType, setSelectedType] = useState<ReportType>('post_race');
    const [generatedReports] = useState<Report[]>([
        { id: 'r1', type: 'post_race', name: 'Race Report - Phoenix 300', generatedAt: new Date('2024-03-10'), sessionId: 'session-1', format: 'pdf' },
        { id: 'r2', type: 'incident_summary', name: 'Incident Summary - March 2024', generatedAt: new Date('2024-03-01'), format: 'pdf' },
    ]);

    const reportTypes: { id: ReportType; label: string; icon: string; description: string }[] = [
        { id: 'post_race', label: 'Post-Race Report', icon: '📄', description: 'Complete race summary with results, incidents, and penalties' },
        { id: 'incident_summary', label: 'Incident Summary', icon: '⚠️', description: 'All incidents with steward decisions and statistics' },
        { id: 'driver_stats', label: 'Driver Statistics', icon: '👤', description: 'Individual driver performance and incident history' },
        { id: 'season_trend', label: 'Season Trends', icon: '📈', description: 'Championship trends and progression analysis' },
    ];

    const handleGenerateReport = () => {
        // In a real implementation, this would call a backend service
        alert(`Generating ${selectedType} report...`);
    };

    const handleExport = (format: 'pdf' | 'csv' | 'json') => {
        alert(`Exporting as ${format.toUpperCase()}...`);
    };

    // Calculate statistics for preview
    const totalIncidents = incidents.length;
    const reviewedIncidents = incidents.filter(i => i.status === 'reviewed').length;
    const driversCount = timing.length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Reports</h1>
                    <p className="text-slate-400">Generate and export race reports</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Type Selection */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Generate New Report</h3>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {reportTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`p-4 rounded-lg border text-left transition-colors ${selectedType === type.id
                                            ? 'bg-primary-600/20 border-primary-500/50'
                                            : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{type.icon}</span>
                                        <span className="font-medium text-white">{type.label}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">{type.description}</p>
                                </button>
                            ))}
                        </div>

                        {/* Report Preview */}
                        <div className="bg-slate-900 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-slate-400 mb-3">Report Preview</h4>

                            {selectedType === 'post_race' && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Session:</span>
                                        <span className="text-white">{currentSession?.trackName || 'Demo Session'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Drivers:</span>
                                        <span className="text-white">{driversCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Incidents:</span>
                                        <span className="text-white">{totalIncidents}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Reviewed:</span>
                                        <span className="text-white">{reviewedIncidents} / {totalIncidents}</span>
                                    </div>
                                </div>
                            )}

                            {selectedType === 'incident_summary' && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Total Incidents:</span>
                                        <span className="text-white">{totalIncidents}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">By Severity:</span>
                                        <span className="text-white">
                                            Heavy: {incidents.filter(i => i.severity === 'heavy').length},
                                            Medium: {incidents.filter(i => i.severity === 'medium').length},
                                            Light: {incidents.filter(i => i.severity === 'light').length}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {selectedType === 'driver_stats' && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Drivers in Session:</span>
                                        <span className="text-white">{driversCount}</span>
                                    </div>
                                    <div className="text-slate-400 text-xs">
                                        Select specific drivers after generating
                                    </div>
                                </div>
                            )}

                            {selectedType === 'season_trend' && (
                                <div className="space-y-2 text-sm">
                                    <div className="text-slate-400">
                                        Analyzes championship progression, incident trends, and driver performance over multiple sessions.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Export Options */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGenerateReport}
                                className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium"
                            >
                                Generate Report
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="px-4 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium"
                                >
                                    PDF
                                </button>
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="px-4 py-3 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg text-sm font-medium"
                                >
                                    CSV
                                </button>
                                <button
                                    onClick={() => handleExport('json')}
                                    className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-sm font-medium"
                                >
                                    JSON
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Snippets */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Social Media Snippets</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-700/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-400">🐦</span>
                                    <span className="text-sm font-medium text-white">Twitter/X</span>
                                </div>
                                <p className="text-sm text-slate-300">
                                    🏁 Race Complete! {timing[0]?.driverName || 'Driver'} takes the win at {currentSession?.trackName || 'the track'}!
                                    {totalIncidents} incidents reviewed by our steward panel.
                                    Full results: [link] #SimRacing #iRacing
                                </p>
                                <button className="mt-2 text-xs text-primary-400 hover:text-primary-300">
                                    Copy to clipboard
                                </button>
                            </div>
                            <div className="p-3 bg-slate-700/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-indigo-400">💬</span>
                                    <span className="text-sm font-medium text-white">Discord</span>
                                </div>
                                <p className="text-sm text-slate-300">
                                    **Race Results - {currentSession?.trackName || 'Session'}**
                                    🥇 {timing[0]?.driverName || 'P1'}
                                    🥈 {timing[1]?.driverName || 'P2'}
                                    🥉 {timing[2]?.driverName || 'P3'}
                                </p>
                                <button className="mt-2 text-xs text-primary-400 hover:text-primary-300">
                                    Copy to clipboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Reports */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Reports</h3>
                    <div className="space-y-3">
                        {generatedReports.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">No reports generated yet</p>
                        ) : (
                            generatedReports.map(report => (
                                <div key={report.id} className="p-3 bg-slate-700/50 rounded-lg">
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="font-medium text-white text-sm">{report.name}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${report.format === 'pdf' ? 'bg-red-600/20 text-red-400' :
                                                report.format === 'csv' ? 'bg-green-600/20 text-green-400' :
                                                    'bg-blue-600/20 text-blue-400'
                                            }`}>
                                            {report.format}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {report.generatedAt.toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button className="text-xs text-primary-400 hover:text-primary-300">
                                            Download
                                        </button>
                                        <button className="text-xs text-slate-400 hover:text-white">
                                            View
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

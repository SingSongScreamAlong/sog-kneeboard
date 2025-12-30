// =====================================================================
// Driver History Panel
// View driver's incident and penalty history across sessions
// =====================================================================

import { useState } from 'react';
import type { Driver } from '@controlbox/common';

// Mock historical data - in production this would come from the backend
interface DriverHistory {
    driverId: string;
    driverName: string;
    sessionsParticipated: number;
    totalIncidents: number;
    totalPenalties: number;
    warningsReceived: number;
    incidentHistory: {
        sessionId: string;
        sessionName: string;
        date: Date;
        incidentCount: number;
        penaltiesReceived: number;
        notes?: string;
    }[];
    penaltyHistory: {
        id: string;
        sessionName: string;
        date: Date;
        type: string;
        reason: string;
        severity: 'minor' | 'moderate' | 'major';
    }[];
}

interface DriverHistoryPanelProps {
    driver: Driver;
    onClose: () => void;
}

export function DriverHistoryPanel({ driver, onClose }: DriverHistoryPanelProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'penalties'>('overview');

    // Generate sample history data for demonstration
    const history: DriverHistory = generateSampleHistory(driver);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="text-2xl">📊</span>
                            Driver History: {driver.name}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Car #{driver.carNumber} • {history.sessionsParticipated} sessions
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6 pt-4">
                    {(['overview', 'incidents', 'penalties'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${activeTab === tab
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-4">
                                <StatCard
                                    label="Sessions"
                                    value={history.sessionsParticipated}
                                    color="primary"
                                />
                                <StatCard
                                    label="Total Incidents"
                                    value={history.totalIncidents}
                                    color={history.totalIncidents > 10 ? 'red' : 'slate'}
                                />
                                <StatCard
                                    label="Penalties"
                                    value={history.totalPenalties}
                                    color={history.totalPenalties > 3 ? 'red' : 'slate'}
                                />
                                <StatCard
                                    label="Warnings"
                                    value={history.warningsReceived}
                                    color={history.warningsReceived > 2 ? 'yellow' : 'slate'}
                                />
                            </div>

                            {/* Driver Risk Level */}
                            <div className="bg-slate-700/50 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                    Risk Assessment
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className={`px-4 py-2 rounded-lg font-bold ${getRiskLevel(history).color
                                        }`}>
                                        {getRiskLevel(history).label}
                                    </div>
                                    <p className="text-slate-300 text-sm">
                                        {getRiskLevel(history).description}
                                    </p>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                    Recent Sessions
                                </h3>
                                <div className="space-y-2">
                                    {history.incidentHistory.slice(0, 3).map((session, i) => (
                                        <div
                                            key={i}
                                            className="p-3 bg-slate-700/30 rounded-lg flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="font-medium text-white">{session.sessionName}</div>
                                                <div className="text-sm text-slate-400">
                                                    {session.date.toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-300">
                                                    {session.incidentCount} incidents
                                                </div>
                                                {session.penaltiesReceived > 0 && (
                                                    <div className="text-red-400 text-sm">
                                                        {session.penaltiesReceived} penalties
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'incidents' && (
                        <div className="space-y-3">
                            {history.incidentHistory.map((session, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-slate-700/30 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium text-white">{session.sessionName}</div>
                                        <div className="text-sm text-slate-400">
                                            {session.date.toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className={`font-mono ${session.incidentCount > 4 ? 'text-red-400' : 'text-slate-300'}`}>
                                            {session.incidentCount}x incidents
                                        </span>
                                        {session.penaltiesReceived > 0 && (
                                            <span className="text-red-400">
                                                {session.penaltiesReceived} penalties issued
                                            </span>
                                        )}
                                    </div>
                                    {session.notes && (
                                        <p className="mt-2 text-slate-400 text-sm italic">
                                            "{session.notes}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'penalties' && (
                        <div className="space-y-3">
                            {history.penaltyHistory.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <span className="text-4xl block mb-2">✅</span>
                                    No penalties on record
                                </div>
                            ) : (
                                history.penaltyHistory.map((penalty) => (
                                    <div
                                        key={penalty.id}
                                        className="p-4 bg-slate-700/30 rounded-lg border-l-4"
                                        style={{
                                            borderLeftColor: penalty.severity === 'major' ? '#ef4444' :
                                                penalty.severity === 'moderate' ? '#f59e0b' : '#64748b'
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-white">{penalty.type}</div>
                                            <div className="text-sm text-slate-400">
                                                {penalty.date.toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="text-slate-300 text-sm">{penalty.reason}</p>
                                        <div className="mt-2 text-xs text-slate-500">
                                            {penalty.sessionName}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper Components
interface StatCardProps {
    label: string;
    value: number;
    color: 'primary' | 'red' | 'yellow' | 'slate';
}

function StatCard({ label, value, color }: StatCardProps) {
    const colorClasses = {
        primary: 'bg-primary-500/20 text-primary-400',
        red: 'bg-red-500/20 text-red-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
        slate: 'bg-slate-700/50 text-slate-300',
    };

    return (
        <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm opacity-75">{label}</div>
        </div>
    );
}

function getRiskLevel(history: DriverHistory): { label: string; color: string; description: string } {
    const score = history.totalPenalties * 5 + history.warningsReceived * 2 + (history.totalIncidents / history.sessionsParticipated) * 3;

    if (score > 15) {
        return {
            label: 'HIGH RISK',
            color: 'bg-red-500/20 text-red-400',
            description: 'This driver has a significant history of incidents and penalties. Consider monitoring closely.',
        };
    } else if (score > 8) {
        return {
            label: 'MODERATE',
            color: 'bg-yellow-500/20 text-yellow-400',
            description: 'Some history of incidents. Standard monitoring recommended.',
        };
    }
    return {
        label: 'LOW RISK',
        color: 'bg-green-500/20 text-green-400',
        description: 'Clean driving record with minimal incidents.',
    };
}

function generateSampleHistory(driver: Driver): DriverHistory {
    const sessionsCount = 5 + Math.floor(Math.random() * 10);
    const totalIncidents = Math.floor(Math.random() * 15);
    const totalPenalties = Math.floor(Math.random() * 4);

    return {
        driverId: driver.id,
        driverName: driver.name,
        sessionsParticipated: sessionsCount,
        totalIncidents,
        totalPenalties,
        warningsReceived: Math.floor(Math.random() * 3),
        incidentHistory: Array.from({ length: sessionsCount }, (_, i) => ({
            sessionId: `session-${i}`,
            sessionName: `Round ${sessionsCount - i} - ${['Daytona', 'Talladega', 'Charlotte', 'Watkins Glen', 'Road America'][i % 5]}`,
            date: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)),
            incidentCount: Math.floor(Math.random() * 5),
            penaltiesReceived: Math.random() > 0.7 ? 1 : 0,
            notes: Math.random() > 0.8 ? 'Racing incident in T1' : undefined,
        })),
        penaltyHistory: Array.from({ length: totalPenalties }, (_, i) => ({
            id: `penalty-${i}`,
            sessionName: `Round ${sessionsCount - i} - Track`,
            date: new Date(Date.now() - (i * 14 * 24 * 60 * 60 * 1000)),
            type: ['Time Penalty', 'Position Penalty', 'Warning'][Math.floor(Math.random() * 3)],
            reason: ['Avoidable contact', 'Corner cutting', 'Unsafe rejoin', 'Blocking'][Math.floor(Math.random() * 4)],
            severity: ['minor', 'moderate', 'major'][Math.floor(Math.random() * 3)] as 'minor' | 'moderate' | 'major',
        })),
    };
}

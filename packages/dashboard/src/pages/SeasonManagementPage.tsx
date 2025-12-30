// =====================================================================
// Season Management Page
// Manage championship seasons and standings
// =====================================================================

import { useState } from 'react';

// Local types
interface Season {
    id: string;
    name: string;
    leagueName: string;
    status: 'upcoming' | 'active' | 'completed';
    rounds: SeasonRound[];
    createdAt: Date;
}

interface SeasonRound {
    roundNumber: number;
    name: string;
    trackName: string;
    scheduledDate: Date;
    status: 'scheduled' | 'in_progress' | 'completed';
}

interface DriverStanding {
    position: number;
    driverId: string;
    driverName: string;
    carNumber: string;
    teamName?: string;
    totalPoints: number;
    wins: number;
    podiums: number;
    top5s: number;
    top10s: number;
    dnfs: number;
    lastFiveResults: number[];
}

// Sample data
const sampleSeason: Season = {
    id: 'season-2024',
    name: '2024 Championship',
    leagueName: 'ControlBox Racing League',
    status: 'active',
    rounds: [
        { roundNumber: 1, name: 'Daytona 500', trackName: 'Daytona International Speedway', scheduledDate: new Date('2024-02-18'), status: 'completed' },
        { roundNumber: 2, name: 'Atlanta 500', trackName: 'Atlanta Motor Speedway', scheduledDate: new Date('2024-02-25'), status: 'completed' },
        { roundNumber: 3, name: 'Las Vegas 400', trackName: 'Las Vegas Motor Speedway', scheduledDate: new Date('2024-03-03'), status: 'completed' },
        { roundNumber: 4, name: 'Phoenix 300', trackName: 'Phoenix Raceway', scheduledDate: new Date('2024-03-10'), status: 'in_progress' },
        { roundNumber: 5, name: 'Bristol 500', trackName: 'Bristol Motor Speedway', scheduledDate: new Date('2024-03-17'), status: 'scheduled' },
    ],
    createdAt: new Date('2024-01-01'),
};

const sampleStandings: DriverStanding[] = [
    { position: 1, driverId: 'd1', driverName: 'Max Velocity', carNumber: '1', teamName: 'Prime Racing', totalPoints: 156, wins: 2, podiums: 3, top5s: 3, top10s: 3, dnfs: 0, lastFiveResults: [1, 2, 1, 0, 0] },
    { position: 2, driverId: 'd2', driverName: 'Chase Leader', carNumber: '24', teamName: 'Thunder Motorsports', totalPoints: 142, wins: 1, podiums: 2, top5s: 3, top10s: 3, dnfs: 0, lastFiveResults: [2, 1, 3, 0, 0] },
    { position: 3, driverId: 'd3', driverName: 'Kyle Driver', carNumber: '18', teamName: 'Speed Team', totalPoints: 128, wins: 0, podiums: 2, top5s: 3, top10s: 3, dnfs: 0, lastFiveResults: [3, 4, 2, 0, 0] },
    { position: 4, driverId: 'd4', driverName: 'Joey Racer', carNumber: '22', teamName: 'Thunder Motorsports', totalPoints: 115, wins: 0, podiums: 1, top5s: 2, top10s: 3, dnfs: 0, lastFiveResults: [5, 3, 4, 0, 0] },
    { position: 5, driverId: 'd5', driverName: 'Denny Speed', carNumber: '11', teamName: 'Prime Racing', totalPoints: 108, wins: 0, podiums: 0, top5s: 2, top10s: 3, dnfs: 0, lastFiveResults: [4, 5, 5, 0, 0] },
];

export function SeasonManagementPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'rounds' | 'standings' | 'statistics'>('overview');
    const [season] = useState<Season>(sampleSeason);
    const [standings] = useState<DriverStanding[]>(sampleStandings);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📋' },
        { id: 'rounds', label: 'Rounds', icon: '🏁' },
        { id: 'standings', label: 'Standings', icon: '🏆' },
        { id: 'statistics', label: 'Statistics', icon: '📊' },
    ] as const;

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'active':
            case 'in_progress': return 'bg-green-500';
            case 'completed': return 'bg-blue-500';
            case 'scheduled':
            case 'upcoming': return 'bg-yellow-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">{season.name}</h1>
                    <p className="text-slate-400">{season.leagueName}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(season.status)}`}>
                        {season.status.toUpperCase()}
                    </span>
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${activeTab === tab.id
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Season Progress */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Season Progress</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-400">Rounds Completed</span>
                                    <span className="text-white font-medium">
                                        {season.rounds.filter(r => r.status === 'completed').length} / {season.rounds.length}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 rounded-full"
                                        style={{ width: `${(season.rounds.filter(r => r.status === 'completed').length / season.rounds.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                                <div>
                                    <span className="text-2xl font-bold text-white">{standings.length}</span>
                                    <span className="text-sm text-slate-400 block">Drivers</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white">{standings.reduce((a, b) => a + b.wins, 0)}</span>
                                    <span className="text-sm text-slate-400 block">Races Won</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Leader */}
                    <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl border border-yellow-500/30 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Points Leader</h3>
                        {standings[0] && (
                            <div className="text-center">
                                <div className="text-4xl mb-2">🏆</div>
                                <div className="text-2xl font-bold text-white">{standings[0].driverName}</div>
                                <div className="text-slate-400">#{standings[0].carNumber} - {standings[0].teamName}</div>
                                <div className="text-3xl font-bold text-yellow-400 mt-4">{standings[0].totalPoints} pts</div>
                                <div className="text-sm text-slate-400 mt-2">
                                    {standings[0].wins} wins • {standings[0].podiums} podiums
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Next Race */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Next Race</h3>
                        {season.rounds.find(r => r.status === 'scheduled') && (
                            <div>
                                <div className="text-xl font-bold text-white">
                                    {season.rounds.find(r => r.status === 'scheduled')?.name}
                                </div>
                                <div className="text-slate-400 mb-4">
                                    {season.rounds.find(r => r.status === 'scheduled')?.trackName}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-yellow-400">📅</span>
                                    <span className="text-white">
                                        {season.rounds.find(r => r.status === 'scheduled')?.scheduledDate.toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'rounds' && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider font-medium">
                        <span>Round</span>
                        <span className="col-span-2">Event</span>
                        <span>Track</span>
                        <span>Date</span>
                        <span>Status</span>
                    </div>
                    <div className="divide-y divide-slate-700">
                        {season.rounds.map(round => (
                            <div key={round.roundNumber} className="grid grid-cols-6 gap-4 px-4 py-3 items-center hover:bg-slate-700/30">
                                <span className="text-white font-bold">R{round.roundNumber}</span>
                                <span className="col-span-2 text-white">{round.name}</span>
                                <span className="text-slate-400">{round.trackName}</span>
                                <span className="text-slate-400">{round.scheduledDate.toLocaleDateString()}</span>
                                <span className={`w-fit px-2 py-0.5 rounded text-xs font-medium text-white ${getStatusColor(round.status)}`}>
                                    {round.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'standings' && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider font-medium">
                        <span>Pos</span>
                        <span className="col-span-3">Driver</span>
                        <span>Points</span>
                        <span>Wins</span>
                        <span>Podiums</span>
                        <span>Top 5</span>
                        <span>Top 10</span>
                        <span>DNFs</span>
                        <span className="col-span-2">Last 5</span>
                    </div>
                    <div className="divide-y divide-slate-700">
                        {standings.map(driver => (
                            <div key={driver.driverId} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-700/30">
                                <span className={`font-bold ${driver.position <= 3 ? 'text-yellow-400' : 'text-white'}`}>
                                    {driver.position}
                                </span>
                                <div className="col-span-3">
                                    <div className="text-white font-medium">#{driver.carNumber} {driver.driverName}</div>
                                    <div className="text-xs text-slate-400">{driver.teamName}</div>
                                </div>
                                <span className="text-white font-bold">{driver.totalPoints}</span>
                                <span className="text-white">{driver.wins}</span>
                                <span className="text-white">{driver.podiums}</span>
                                <span className="text-white">{driver.top5s}</span>
                                <span className="text-white">{driver.top10s}</span>
                                <span className={driver.dnfs > 0 ? 'text-red-400' : 'text-white'}>{driver.dnfs}</span>
                                <div className="col-span-2 flex gap-1">
                                    {driver.lastFiveResults.map((result, i) => (
                                        <span
                                            key={i}
                                            className={`w-6 h-6 flex items-center justify-center rounded text-xs font-medium ${result === 0 ? 'bg-slate-700 text-slate-500' :
                                                    result === 1 ? 'bg-yellow-500 text-black' :
                                                        result <= 3 ? 'bg-blue-500 text-white' :
                                                            result <= 5 ? 'bg-green-600 text-white' :
                                                                'bg-slate-600 text-white'
                                                }`}
                                        >
                                            {result || '-'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'statistics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Most Wins */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Most Wins</h3>
                        <div className="space-y-3">
                            {standings
                                .sort((a, b) => b.wins - a.wins)
                                .slice(0, 5)
                                .map((driver, i) => (
                                    <div key={driver.driverId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-white'
                                                }`}>{i + 1}</span>
                                            <span className="text-white">{driver.driverName}</span>
                                        </div>
                                        <span className="font-bold text-yellow-400">{driver.wins}</span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Best Average Finish */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Points Per Race</h3>
                        <div className="space-y-3">
                            {standings
                                .sort((a, b) => (b.totalPoints / 3) - (a.totalPoints / 3))
                                .slice(0, 5)
                                .map((driver, i) => (
                                    <div key={driver.driverId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-green-500 text-black' : 'bg-slate-700 text-white'
                                                }`}>{i + 1}</span>
                                            <span className="text-white">{driver.driverName}</span>
                                        </div>
                                        <span className="font-bold text-green-400">{(driver.totalPoints / 3).toFixed(1)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

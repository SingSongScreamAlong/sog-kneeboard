// =====================================================================
// Driver Roster Page
// Driver and team management interface
// =====================================================================

import { useState } from 'react';
import { useRosterStore } from '../stores/roster.store';
import { DriverHistoryPanel } from '../components/drivers/DriverHistoryPanel';
import type { Driver } from '@controlbox/common';

type TabType = 'drivers' | 'teams' | 'classes';

export function DriverRosterPage() {
    const { drivers, teams, classes, addDriver, updateDriver, removeDriver, removeTeam, removeClass } = useRosterStore();
    const [activeTab, setActiveTab] = useState<TabType>('drivers');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDriverForHistory, setSelectedDriverForHistory] = useState<Driver | null>(null);

    // Form states
    const [driverForm, setDriverForm] = useState({
        name: '',
        carNumber: '',
        carClass: '',
        teamId: '',
        iRating: 0,
        safetyRating: 0,
    });

    const handleAddDriver = () => {
        const newDriver: Driver = {
            id: `d-${Date.now()}`,
            name: driverForm.name,
            carNumber: driverForm.carNumber,
            carClass: driverForm.carClass || undefined,
            teamId: driverForm.teamId || undefined,
            iRating: driverForm.iRating || undefined,
            safetyRating: driverForm.safetyRating || undefined,
            isActive: true,
            isRegistered: true,
            isCheckedIn: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        addDriver(newDriver);
        setShowAddModal(false);
        resetForm();
    };

    const resetForm = () => {
        setDriverForm({
            name: '',
            carNumber: '',
            carClass: '',
            teamId: '',
            iRating: 0,
            safetyRating: 0,
        });
    };

    const tabs: { id: TabType; label: string; count: number }[] = [
        { id: 'drivers', label: 'Drivers', count: drivers.length },
        { id: 'teams', label: 'Teams', count: teams.length },
        { id: 'classes', label: 'Classes', count: classes.length },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-3xl">👥</span>
                            Driver & Team Management
                        </h1>
                        <p className="text-slate-400 mt-1">Manage drivers, teams, and car classes</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg flex items-center gap-2"
                    >
                        <span>+</span>
                        Add {activeTab === 'drivers' ? 'Driver' : activeTab === 'teams' ? 'Team' : 'Class'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            {tab.label}
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-slate-600">
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
                {activeTab === 'drivers' && (
                    <div className="grid gap-4">
                        {/* Drivers Table */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">#</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Team</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Class</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">iRating</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">SR</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {drivers.map(driver => {
                                        const team = teams.find(t => t.id === driver.teamId);
                                        return (
                                            <tr key={driver.id} className="hover:bg-slate-700/30">
                                                <td className="px-4 py-3">
                                                    <span className="font-mono font-bold text-white bg-slate-700 px-2 py-1 rounded">
                                                        {driver.carNumber}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-white font-medium">{driver.name}</td>
                                                <td className="px-4 py-3">
                                                    {team ? (
                                                        <span
                                                            className="px-2 py-1 rounded text-sm"
                                                            style={{ backgroundColor: `${team.primaryColor}30`, color: team.primaryColor }}
                                                        >
                                                            {team.shortName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">{driver.carClass || '—'}</td>
                                                <td className="px-4 py-3 font-mono text-slate-300">{driver.iRating?.toLocaleString() || '—'}</td>
                                                <td className="px-4 py-3 font-mono text-slate-300">{driver.safetyRating?.toFixed(2) || '—'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {driver.isCheckedIn ? (
                                                            <span className="w-2 h-2 rounded-full bg-green-500" title="Checked In" />
                                                        ) : driver.isRegistered ? (
                                                            <span className="w-2 h-2 rounded-full bg-yellow-500" title="Registered" />
                                                        ) : (
                                                            <span className="w-2 h-2 rounded-full bg-slate-500" title="Not Registered" />
                                                        )}
                                                        <span className="text-sm text-slate-400">
                                                            {driver.isCheckedIn ? 'Ready' : driver.isRegistered ? 'Registered' : 'Not Registered'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedDriverForHistory(driver)}
                                                            className="px-2 py-1 bg-primary-600/50 hover:bg-primary-600 text-white text-xs rounded"
                                                        >
                                                            History
                                                        </button>
                                                        <button
                                                            onClick={() => updateDriver(driver.id, { isCheckedIn: !driver.isCheckedIn })}
                                                            className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
                                                        >
                                                            {driver.isCheckedIn ? 'Uncheck' : 'Check In'}
                                                        </button>
                                                        <button
                                                            onClick={() => removeDriver(driver.id)}
                                                            className="px-2 py-1 bg-red-600/50 hover:bg-red-600 text-white text-xs rounded"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'teams' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map(team => {
                            const teamDrivers = drivers.filter(d => d.teamId === team.id);
                            return (
                                <div
                                    key={team.id}
                                    className="bg-slate-800 rounded-xl border border-slate-700 p-4"
                                    style={{ borderLeftColor: team.primaryColor, borderLeftWidth: 4 }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-white">{team.name}</h3>
                                        <span className="px-2 py-1 rounded text-sm font-bold" style={{ backgroundColor: team.primaryColor }}>
                                            {team.shortName}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {teamDrivers.map(driver => (
                                            <div key={driver.id} className="flex items-center gap-2 text-sm">
                                                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white">
                                                    #{driver.carNumber}
                                                </span>
                                                <span className="text-slate-300">{driver.name}</span>
                                            </div>
                                        ))}
                                        {teamDrivers.length === 0 && (
                                            <p className="text-slate-500 text-sm">No drivers assigned</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeTeam(team.id)}
                                        className="mt-3 text-xs text-red-400 hover:text-red-300"
                                    >
                                        Remove Team
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map(carClass => {
                            const classDrivers = drivers.filter(d => d.carClass === carClass.name);
                            return (
                                <div
                                    key={carClass.id}
                                    className="bg-slate-800 rounded-xl border border-slate-700 p-4"
                                    style={{ borderLeftColor: carClass.color, borderLeftWidth: 4 }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-white">{carClass.name}</h3>
                                        <span
                                            className="px-2 py-1 rounded text-sm font-bold"
                                            style={{ backgroundColor: carClass.color }}
                                        >
                                            {carClass.shortName}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-2">
                                        {classDrivers.length} driver{classDrivers.length !== 1 ? 's' : ''} • Priority {carClass.priority}
                                    </p>
                                    <button
                                        onClick={() => removeClass(carClass.id)}
                                        className="text-xs text-red-400 hover:text-red-300"
                                    >
                                        Remove Class
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && activeTab === 'drivers' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Add Driver</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-400 block mb-1">Name</label>
                                <input
                                    type="text"
                                    value={driverForm.name}
                                    onChange={(e) => setDriverForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    placeholder="Driver name..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-400 block mb-1">Car Number</label>
                                    <input
                                        type="text"
                                        value={driverForm.carNumber}
                                        onChange={(e) => setDriverForm(f => ({ ...f, carNumber: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        placeholder="#"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-400 block mb-1">Class</label>
                                    <select
                                        value={driverForm.carClass}
                                        onChange={(e) => setDriverForm(f => ({ ...f, carClass: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    >
                                        <option value="">Select class...</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-400 block mb-1">Team</label>
                                <select
                                    value={driverForm.teamId}
                                    onChange={(e) => setDriverForm(f => ({ ...f, teamId: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                >
                                    <option value="">No team</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-400 block mb-1">iRating</label>
                                    <input
                                        type="number"
                                        value={driverForm.iRating || ''}
                                        onChange={(e) => setDriverForm(f => ({ ...f, iRating: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-400 block mb-1">Safety Rating</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={driverForm.safetyRating || ''}
                                        onChange={(e) => setDriverForm(f => ({ ...f, safetyRating: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddDriver}
                                disabled={!driverForm.name.trim() || !driverForm.carNumber.trim()}
                                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-600 text-white font-bold rounded-lg"
                            >
                                Add Driver
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Driver History Modal */}
            {selectedDriverForHistory && (
                <DriverHistoryPanel
                    driver={selectedDriverForHistory}
                    onClose={() => setSelectedDriverForHistory(null)}
                />
            )}
        </div>
    );
}

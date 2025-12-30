// =====================================================================
// Steward Panel
// Display and manage active stewards in collaborative session
// =====================================================================

import { useCollaborationStore } from '../../stores/collaboration.store';

export function StewardPanel() {
    const {
        currentSession,
        activeStewards,
        myId,
        myRole,
        isConnected,
        joinSession,
        leaveSession,
        hostSession,
        updateStewardRole,
    } = useCollaborationStore();

    const canManageStewards = myRole === 'head_steward';

    const getRoleColor = (role: string): string => {
        switch (role) {
            case 'head_steward': return 'bg-yellow-500 text-black';
            case 'senior_steward': return 'bg-blue-500 text-white';
            case 'steward': return 'bg-green-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getRoleLabel = (role: string): string => {
        return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Steward Panel
                    {isConnected && (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                </h2>
                {currentSession && (
                    <div className="text-sm text-slate-400 font-mono bg-slate-700 px-2 py-1 rounded">
                        {currentSession.shareCode}
                    </div>
                )}
            </div>

            {/* Connection Status */}
            {!isConnected ? (
                <div className="p-4 space-y-4">
                    <p className="text-slate-400 text-sm text-center">
                        Join or host a collaborative session
                    </p>

                    <div className="space-y-2">
                        <button
                            onClick={() => hostSession('demo-session', 'Head Steward')}
                            className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium"
                        >
                            🎯 Host Session
                        </button>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter share code..."
                                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                            />
                            <button
                                onClick={() => joinSession('ABC123', 'Steward')}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Active Stewards List */}
                    <div className="p-4 space-y-2">
                        {activeStewards.map(steward => (
                            <div
                                key={steward.id}
                                className={`p-3 rounded-lg flex items-center justify-between ${steward.id === myId
                                        ? 'bg-primary-600/20 border border-primary-500/30'
                                        : 'bg-slate-700/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Online indicator */}
                                    <div className={`w-2 h-2 rounded-full ${steward.isOnline ? 'bg-green-500' : 'bg-slate-500'
                                        }`} />

                                    {/* Steward info */}
                                    <div>
                                        <div className="font-medium text-white flex items-center gap-2">
                                            {steward.name}
                                            {steward.id === myId && (
                                                <span className="text-xs text-primary-400">(You)</span>
                                            )}
                                        </div>
                                        {steward.assignedIncidents.length > 0 && (
                                            <span className="text-xs text-slate-400">
                                                {steward.assignedIncidents.length} assigned
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Role badge & controls */}
                                <div className="flex items-center gap-2">
                                    {canManageStewards && steward.id !== myId ? (
                                        <select
                                            value={steward.role}
                                            onChange={(e) => updateStewardRole(steward.id, e.target.value as 'head_steward' | 'senior_steward' | 'steward' | 'observer')}
                                            className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-xs"
                                        >
                                            <option value="head_steward">Head Steward</option>
                                            <option value="senior_steward">Senior Steward</option>
                                            <option value="steward">Steward</option>
                                            <option value="observer">Observer</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(steward.role)}`}>
                                            {getRoleLabel(steward.role)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Leave Session */}
                    <div className="px-4 py-3 border-t border-slate-700">
                        <button
                            onClick={leaveSession}
                            className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm"
                        >
                            Leave Session
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// =====================================================================
// Voting Panel
// Decision voting system for penalty approval
// =====================================================================

import { useState } from 'react';
import { useCollaborationStore } from '../../stores/collaboration.store';

export function VotingPanel() {
    const {
        activeVotes,
        activeStewards,
        myId,
        myRole,
        castVote,
        resolveVote,
        startVote,
    } = useCollaborationStore();

    const [showPropose, setShowPropose] = useState(false);
    const [proposedPenalty, setProposedPenalty] = useState('');
    const [proposedIncidentId, setProposedIncidentId] = useState('');

    const pendingVotes = activeVotes.filter(v => v.status === 'pending');
    const completedVotes = activeVotes.filter(v => v.status !== 'pending');
    const canVote = myRole !== 'observer';
    const canStartVote = myRole === 'head_steward' || myRole === 'senior_steward';

    const handleStartVote = () => {
        if (!proposedPenalty.trim() || !proposedIncidentId.trim()) return;
        startVote(proposedIncidentId, proposedPenalty);
        setProposedPenalty('');
        setProposedIncidentId('');
        setShowPropose(false);
    };

    const getVoteStats = (vote: typeof activeVotes[0]) => {
        const approves = vote.votes.filter(v => v.vote === 'approve').length;
        const rejects = vote.votes.filter(v => v.vote === 'reject').length;
        const abstains = vote.votes.filter(v => v.vote === 'abstain').length;
        const eligible = activeStewards.filter(s => s.role !== 'observer').length;
        const hasVoted = vote.votes.some(v => v.stewardId === myId);

        return { approves, rejects, abstains, eligible, hasVoted };
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🗳️</span>
                    Decision Voting
                    {pendingVotes.length > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full font-bold">
                            {pendingVotes.length}
                        </span>
                    )}
                </h2>
                {canStartVote && (
                    <button
                        onClick={() => setShowPropose(!showPropose)}
                        className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded"
                    >
                        + Propose
                    </button>
                )}
            </div>

            {/* Propose New Vote */}
            {showPropose && (
                <div className="p-4 border-b border-slate-700 bg-slate-700/30 space-y-3">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Incident ID</label>
                        <input
                            type="text"
                            value={proposedIncidentId}
                            onChange={(e) => setProposedIncidentId(e.target.value)}
                            placeholder="e.g., INC-001"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Proposed Penalty</label>
                        <select
                            value={proposedPenalty}
                            onChange={(e) => setProposedPenalty(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm"
                        >
                            <option value="">Select penalty...</option>
                            <option value="No Further Action">No Further Action</option>
                            <option value="Warning">Warning</option>
                            <option value="5 Second Penalty">5 Second Time Penalty</option>
                            <option value="10 Second Penalty">10 Second Time Penalty</option>
                            <option value="Drive Through">Drive Through Penalty</option>
                            <option value="Stop and Go 10s">Stop and Go (10s)</option>
                            <option value="Disqualification">Disqualification</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleStartVote}
                            disabled={!proposedPenalty || !proposedIncidentId}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white rounded text-sm font-medium"
                        >
                            Start Vote
                        </button>
                        <button
                            onClick={() => setShowPropose(false)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Pending Votes */}
            <div className="p-4">
                {pendingVotes.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">
                        <span className="text-4xl block mb-2">✅</span>
                        No pending votes
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingVotes.map(vote => {
                            const stats = getVoteStats(vote);
                            const myVote = vote.votes.find(v => v.stewardId === myId);

                            return (
                                <div key={vote.id} className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="font-medium text-white">{vote.proposedPenalty}</div>
                                            <div className="text-xs text-slate-400">
                                                Incident: {vote.incidentId} • Proposed by: {vote.proposedByName}
                                            </div>
                                        </div>
                                        <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-medium">
                                            {stats.approves}/{vote.requiredVotes} needed
                                        </span>
                                    </div>

                                    {/* Vote counts */}
                                    <div className="flex gap-4 mb-3 text-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="text-green-400">✓</span>
                                            <span className="text-slate-300">{stats.approves}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-red-400">✗</span>
                                            <span className="text-slate-300">{stats.rejects}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-400">○</span>
                                            <span className="text-slate-300">{stats.abstains}</span>
                                        </div>
                                        <span className="text-slate-500">
                                            ({stats.eligible - vote.votes.length} pending)
                                        </span>
                                    </div>

                                    {/* Vote buttons */}
                                    {canVote && !stats.hasVoted && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => castVote(vote.id, 'approve')}
                                                className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => castVote(vote.id, 'reject')}
                                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium"
                                            >
                                                ✗ Reject
                                            </button>
                                            <button
                                                onClick={() => castVote(vote.id, 'abstain')}
                                                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"
                                            >
                                                Abstain
                                            </button>
                                        </div>
                                    )}

                                    {stats.hasVoted && myVote && (
                                        <div className="text-sm text-slate-400">
                                            You voted: <span className={
                                                myVote.vote === 'approve' ? 'text-green-400' :
                                                    myVote.vote === 'reject' ? 'text-red-400' : 'text-slate-400'
                                            }>{myVote.vote}</span>
                                        </div>
                                    )}

                                    {/* Resolve button for head steward */}
                                    {myRole === 'head_steward' && stats.approves >= vote.requiredVotes && (
                                        <button
                                            onClick={() => resolveVote(vote.id)}
                                            className="mt-2 w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded text-sm font-medium"
                                        >
                                            Finalize Decision
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Completed Votes */}
            {completedVotes.length > 0 && (
                <div className="px-4 pb-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Recent Decisions</div>
                    <div className="space-y-2">
                        {completedVotes.slice(-3).map(vote => (
                            <div
                                key={vote.id}
                                className={`p-2 rounded text-sm flex items-center justify-between ${vote.status === 'approved'
                                        ? 'bg-green-900/20 border border-green-500/30'
                                        : 'bg-red-900/20 border border-red-500/30'
                                    }`}
                            >
                                <span className="text-white">{vote.proposedPenalty}</span>
                                <span className={`text-xs font-medium ${vote.status === 'approved' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {vote.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

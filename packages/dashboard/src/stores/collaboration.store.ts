// =====================================================================
// Collaboration Store
// Manage multi-steward session sharing and collaboration features
// =====================================================================

import { create } from 'zustand';

// Types (local definitions to avoid import issues during build)
type StewardRole = 'head_steward' | 'senior_steward' | 'steward' | 'observer';

interface ActiveSteward {
    id: string;
    name: string;
    role: StewardRole;
    joinedAt: Date;
    lastActivity: Date;
    isOnline: boolean;
    assignedIncidents: string[];
    currentView?: string;
}

interface DiscussionMessage {
    id: string;
    threadId: string;
    authorId: string;
    authorName: string;
    authorRole: StewardRole;
    content: string;
    createdAt: Date;
}

interface DiscussionThread {
    id: string;
    incidentId: string;
    messages: DiscussionMessage[];
    isResolved: boolean;
    createdAt: Date;
}

interface Vote {
    stewardId: string;
    stewardName: string;
    vote: 'approve' | 'reject' | 'abstain';
    comment?: string;
    votedAt: Date;
}

interface DecisionVote {
    id: string;
    incidentId: string;
    proposedPenalty: string;
    proposedBy: string;
    proposedByName: string;
    votes: Vote[];
    status: 'pending' | 'approved' | 'rejected' | 'timed_out';
    requiredVotes: number;
    deadline?: Date;
    createdAt: Date;
}

interface AuditEntry {
    id: string;
    sessionId: string;
    timestamp: Date;
    action: string;
    actorId: string;
    actorName: string;
    actorRole: StewardRole;
    targetType: string;
    targetId: string;
    previousValue?: unknown;
    newValue?: unknown;
    reason?: string;
}

interface SharedSession {
    sessionId: string;
    shareCode: string;
    hostId: string;
    hostName: string;
    maxStewards: number;
    isAcceptingJoins: boolean;
    createdAt: Date;
}

interface CollaborationState {
    // State
    currentSession: SharedSession | null;
    activeStewards: ActiveSteward[];
    discussions: DiscussionThread[];
    activeVotes: DecisionVote[];
    auditLog: AuditEntry[];
    myId: string | null;
    myRole: StewardRole;
    isConnected: boolean;

    // Actions
    joinSession: (shareCode: string, name: string) => void;
    leaveSession: () => void;
    hostSession: (sessionId: string, name: string) => string;

    // Steward management
    updateStewardRole: (stewardId: string, role: StewardRole) => void;
    assignIncident: (stewardId: string, incidentId: string) => void;
    unassignIncident: (stewardId: string, incidentId: string) => void;

    // Discussion
    startDiscussion: (incidentId: string) => string;
    addMessage: (threadId: string, content: string) => void;
    resolveDiscussion: (threadId: string) => void;

    // Voting
    startVote: (incidentId: string, proposedPenalty: string) => string;
    castVote: (voteId: string, vote: 'approve' | 'reject' | 'abstain', comment?: string) => void;
    resolveVote: (voteId: string) => void;

    // Audit
    logAction: (action: string, targetType: string, targetId: string, reason?: string) => void;
    getAuditLog: (targetId?: string) => AuditEntry[];
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateShareCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
    currentSession: null,
    activeStewards: [],
    discussions: [],
    activeVotes: [],
    auditLog: [],
    myId: null,
    myRole: 'observer',
    isConnected: false,

    joinSession: (_shareCode, name) => {
        const myId = generateId();
        const steward: ActiveSteward = {
            id: myId,
            name,
            role: 'steward',
            joinedAt: new Date(),
            lastActivity: new Date(),
            isOnline: true,
            assignedIncidents: [],
        };

        set(state => ({
            activeStewards: [...state.activeStewards, steward],
            myId,
            myRole: 'steward',
            isConnected: true,
        }));

        get().logAction('steward_joined', 'steward', myId);
    },

    leaveSession: () => {
        const myId = get().myId;
        if (myId) {
            get().logAction('steward_left', 'steward', myId);
        }

        set(state => ({
            activeStewards: state.activeStewards.filter(s => s.id !== state.myId),
            myId: null,
            myRole: 'observer',
            isConnected: false,
        }));
    },

    hostSession: (sessionId, name) => {
        const shareCode = generateShareCode();
        const myId = generateId();

        const session: SharedSession = {
            sessionId,
            shareCode,
            hostId: myId,
            hostName: name,
            maxStewards: 10,
            isAcceptingJoins: true,
            createdAt: new Date(),
        };

        const steward: ActiveSteward = {
            id: myId,
            name,
            role: 'head_steward',
            joinedAt: new Date(),
            lastActivity: new Date(),
            isOnline: true,
            assignedIncidents: [],
        };

        set({
            currentSession: session,
            activeStewards: [steward],
            myId,
            myRole: 'head_steward',
            isConnected: true,
        });

        get().logAction('session_started', 'session', sessionId);

        return shareCode;
    },

    updateStewardRole: (stewardId, role) => {
        set(state => ({
            activeStewards: state.activeStewards.map(s =>
                s.id === stewardId ? { ...s, role } : s
            ),
        }));
        get().logAction('steward_role_changed', 'steward', stewardId);
    },

    assignIncident: (stewardId, incidentId) => {
        set(state => ({
            activeStewards: state.activeStewards.map(s =>
                s.id === stewardId
                    ? { ...s, assignedIncidents: [...s.assignedIncidents, incidentId] }
                    : s
            ),
        }));
        get().logAction('incident_assigned', 'incident', incidentId);
    },

    unassignIncident: (stewardId, incidentId) => {
        set(state => ({
            activeStewards: state.activeStewards.map(s =>
                s.id === stewardId
                    ? { ...s, assignedIncidents: s.assignedIncidents.filter(id => id !== incidentId) }
                    : s
            ),
        }));
    },

    startDiscussion: (incidentId) => {
        const id = generateId();
        const thread: DiscussionThread = {
            id,
            incidentId,
            messages: [],
            isResolved: false,
            createdAt: new Date(),
        };

        set(state => ({
            discussions: [...state.discussions, thread],
        }));

        get().logAction('discussion_started', 'incident', incidentId);
        return id;
    },

    addMessage: (threadId, content) => {
        const state = get();
        const steward = state.activeStewards.find(s => s.id === state.myId);
        if (!steward) return;

        const message: DiscussionMessage = {
            id: generateId(),
            threadId,
            authorId: steward.id,
            authorName: steward.name,
            authorRole: steward.role,
            content,
            createdAt: new Date(),
        };

        set(state => ({
            discussions: state.discussions.map(d =>
                d.id === threadId
                    ? { ...d, messages: [...d.messages, message] }
                    : d
            ),
        }));
    },

    resolveDiscussion: (threadId) => {
        set(state => ({
            discussions: state.discussions.map(d =>
                d.id === threadId ? { ...d, isResolved: true } : d
            ),
        }));
    },

    startVote: (incidentId, proposedPenalty) => {
        const state = get();
        const steward = state.activeStewards.find(s => s.id === state.myId);
        if (!steward) return '';

        const id = generateId();
        const vote: DecisionVote = {
            id,
            incidentId,
            proposedPenalty,
            proposedBy: steward.id,
            proposedByName: steward.name,
            votes: [],
            status: 'pending',
            requiredVotes: Math.ceil(state.activeStewards.filter(s => s.role !== 'observer').length / 2),
            createdAt: new Date(),
        };

        set(state => ({
            activeVotes: [...state.activeVotes, vote],
        }));

        get().logAction('vote_started', 'incident', incidentId);
        return id;
    },

    castVote: (voteId, vote, comment) => {
        const state = get();
        const steward = state.activeStewards.find(s => s.id === state.myId);
        if (!steward) return;

        const voteEntry: Vote = {
            stewardId: steward.id,
            stewardName: steward.name,
            vote,
            comment,
            votedAt: new Date(),
        };

        set(state => ({
            activeVotes: state.activeVotes.map(v =>
                v.id === voteId
                    ? { ...v, votes: [...v.votes.filter(vt => vt.stewardId !== steward.id), voteEntry] }
                    : v
            ),
        }));

        get().logAction('vote_cast', 'vote', voteId);
    },

    resolveVote: (voteId) => {
        const vote = get().activeVotes.find(v => v.id === voteId);
        if (!vote) return;

        const approves = vote.votes.filter(v => v.vote === 'approve').length;
        const rejects = vote.votes.filter(v => v.vote === 'reject').length;
        const status = approves >= vote.requiredVotes ? 'approved' : rejects >= vote.requiredVotes ? 'rejected' : 'pending';

        set(state => ({
            activeVotes: state.activeVotes.map(v =>
                v.id === voteId ? { ...v, status } : v
            ),
        }));

        get().logAction('vote_resolved', 'vote', voteId);
    },

    logAction: (action, targetType, targetId, reason) => {
        const state = get();
        const steward = state.activeStewards.find(s => s.id === state.myId);

        const entry: AuditEntry = {
            id: generateId(),
            sessionId: state.currentSession?.sessionId || 'unknown',
            timestamp: new Date(),
            action,
            actorId: steward?.id || 'system',
            actorName: steward?.name || 'System',
            actorRole: steward?.role || 'observer',
            targetType,
            targetId,
            reason,
        };

        set(state => ({
            auditLog: [...state.auditLog, entry],
        }));
    },

    getAuditLog: (targetId) => {
        const log = get().auditLog;
        if (!targetId) return log;
        return log.filter(e => e.targetId === targetId);
    },
}));

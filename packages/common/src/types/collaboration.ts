// =====================================================================
// Collaboration Types
// Types for multi-steward collaboration features
// =====================================================================

// Steward roles and permissions
export type StewardRole = 'head_steward' | 'senior_steward' | 'steward' | 'observer';

export interface StewardPermissions {
    canIssuePenalties: boolean;
    canDismissIncidents: boolean;
    canModifyFlags: boolean;
    canManageSession: boolean;
    canVoteOnDecisions: boolean;
    canOverrideDecisions: boolean;
    canViewAuditLog: boolean;
    canManageStewards: boolean;
    canExportReports: boolean;
}

export const ROLE_PERMISSIONS: Record<StewardRole, StewardPermissions> = {
    head_steward: {
        canIssuePenalties: true,
        canDismissIncidents: true,
        canModifyFlags: true,
        canManageSession: true,
        canVoteOnDecisions: true,
        canOverrideDecisions: true,
        canViewAuditLog: true,
        canManageStewards: true,
        canExportReports: true,
    },
    senior_steward: {
        canIssuePenalties: true,
        canDismissIncidents: true,
        canModifyFlags: true,
        canManageSession: false,
        canVoteOnDecisions: true,
        canOverrideDecisions: false,
        canViewAuditLog: true,
        canManageStewards: false,
        canExportReports: true,
    },
    steward: {
        canIssuePenalties: true,
        canDismissIncidents: false,
        canModifyFlags: false,
        canManageSession: false,
        canVoteOnDecisions: true,
        canOverrideDecisions: false,
        canViewAuditLog: false,
        canManageStewards: false,
        canExportReports: false,
    },
    observer: {
        canIssuePenalties: false,
        canDismissIncidents: false,
        canModifyFlags: false,
        canManageSession: false,
        canVoteOnDecisions: false,
        canOverrideDecisions: false,
        canViewAuditLog: false,
        canManageStewards: false,
        canExportReports: false,
    },
};

// Active steward in a session
export interface ActiveSteward {
    id: string;
    name: string;
    role: StewardRole;
    joinedAt: Date;
    lastActivity: Date;
    isOnline: boolean;
    assignedIncidents: string[];
    currentView?: string;
}

// Incident discussion thread
export interface DiscussionThread {
    id: string;
    incidentId: string;
    messages: DiscussionMessage[];
    isResolved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface DiscussionMessage {
    id: string;
    threadId: string;
    authorId: string;
    authorName: string;
    authorRole: StewardRole;
    content: string;
    attachments?: string[];
    isEdited: boolean;
    createdAt: Date;
    editedAt?: Date;
}

// Decision voting
export interface DecisionVote {
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
    resolvedAt?: Date;
}

export interface Vote {
    stewardId: string;
    stewardName: string;
    vote: 'approve' | 'reject' | 'abstain';
    comment?: string;
    votedAt: Date;
}

// Audit trail
export interface AuditEntry {
    id: string;
    sessionId: string;
    timestamp: Date;
    action: AuditAction;
    actorId: string;
    actorName: string;
    actorRole: StewardRole;
    targetType: 'incident' | 'penalty' | 'flag' | 'session' | 'steward' | 'vote';
    targetId: string;
    previousValue?: unknown;
    newValue?: unknown;
    reason?: string;
    ipAddress?: string;
}

export type AuditAction =
    | 'incident_created'
    | 'incident_reviewed'
    | 'incident_dismissed'
    | 'incident_assigned'
    | 'penalty_proposed'
    | 'penalty_approved'
    | 'penalty_rejected'
    | 'penalty_modified'
    | 'penalty_applied'
    | 'flag_deployed'
    | 'flag_cleared'
    | 'session_started'
    | 'session_paused'
    | 'session_ended'
    | 'steward_joined'
    | 'steward_left'
    | 'steward_role_changed'
    | 'vote_started'
    | 'vote_cast'
    | 'vote_resolved'
    | 'note_added'
    | 'discussion_started';

// Session sharing
export interface SharedSession {
    sessionId: string;
    shareCode: string;
    hostId: string;
    hostName: string;
    activeStewards: ActiveSteward[];
    maxStewards: number;
    isAcceptingJoins: boolean;
    createdAt: Date;
    expiresAt?: Date;
}

// Collaboration state
export interface CollaborationState {
    currentSession: SharedSession | null;
    activeStewards: ActiveSteward[];
    discussions: DiscussionThread[];
    activeVotes: DecisionVote[];
    auditLog: AuditEntry[];
    myRole: StewardRole;
    permissions: StewardPermissions;
}

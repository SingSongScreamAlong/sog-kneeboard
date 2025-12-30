// =====================================================================
// Messaging Type Definitions
// Steward-to-driver communication system
// =====================================================================

/**
 * Message types
 */
export type MessageType =
    | 'warning'           // Official warning
    | 'penalty_notice'    // Penalty notification
    | 'instruction'       // Race control instruction
    | 'announcement'      // Session-wide announcement
    | 'info'              // General information
    | 'inquiry'           // Request for response
    | 'summons';          // Called to stewards

/**
 * Message priority
 */
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Message recipient type
 */
export type RecipientType = 'driver' | 'team' | 'all' | 'stewards';

/**
 * Race control message
 */
export interface RaceControlMessage {
    id: string;
    sessionId: string;

    // Type
    type: MessageType;
    priority: MessagePriority;

    // Recipients
    recipientType: RecipientType;
    recipientIds?: string[];      // Driver or team IDs
    recipientNames?: string[];    // Display names

    // Content
    subject: string;
    body: string;
    relatedIncidentId?: string;
    relatedPenaltyId?: string;

    // Sender
    senderId: string;
    senderName: string;
    senderRole: 'race_control' | 'steward' | 'clerk' | 'system';

    // Status
    status: 'draft' | 'sent' | 'delivered' | 'read' | 'acknowledged';
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    acknowledgedAt?: Date;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Message template for quick sends
 */
export interface MessageTemplate {
    id: string;
    name: string;
    type: MessageType;
    priority: MessagePriority;
    subject: string;
    body: string;
    isActive: boolean;
    createdAt: Date;
}

/**
 * Predefined message templates
 */
export const DEFAULT_MESSAGE_TEMPLATES: Omit<MessageTemplate, 'id' | 'createdAt'>[] = [
    {
        name: 'Black Flag Warning',
        type: 'warning',
        priority: 'high',
        subject: 'Black Flag Warning',
        body: 'You have received a black flag warning. Please report to pit lane immediately.',
        isActive: true,
    },
    {
        name: 'Blue Flag Notice',
        type: 'info',
        priority: 'normal',
        subject: 'Blue Flag Notice',
        body: 'Please be aware of faster cars approaching. Allow them to pass safely.',
        isActive: true,
    },
    {
        name: 'Penalty Notification',
        type: 'penalty_notice',
        priority: 'high',
        subject: 'Penalty Issued',
        body: 'A penalty has been issued against you. Please check the stewards decision.',
        isActive: true,
    },
    {
        name: 'Steward Summons',
        type: 'summons',
        priority: 'urgent',
        subject: 'Steward Summons',
        body: 'You are summoned to the stewards. Please acknowledge this message.',
        isActive: true,
    },
    {
        name: 'Track Limits Warning',
        type: 'warning',
        priority: 'normal',
        subject: 'Track Limits Warning',
        body: 'You have exceeded track limits. Further violations may result in a penalty.',
        isActive: true,
    },
    {
        name: 'Unsafe Rejoin Warning',
        type: 'warning',
        priority: 'high',
        subject: 'Unsafe Rejoin Warning',
        body: 'Your rejoin to the track was deemed unsafe. Please exercise caution.',
        isActive: true,
    },
];

/**
 * Message history query filters
 */
export interface MessageFilter {
    sessionId?: string;
    type?: MessageType;
    priority?: MessagePriority;
    recipientId?: string;
    senderId?: string;
    status?: RaceControlMessage['status'];
    fromDate?: Date;
    toDate?: Date;
}

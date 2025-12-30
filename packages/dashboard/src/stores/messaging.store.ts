// =====================================================================
// Messaging Store
// Zustand store for steward-to-driver messaging
// =====================================================================

import { create } from 'zustand';
import type {
    RaceControlMessage,
    MessageType,
    MessagePriority,
    MessageTemplate,
} from '@controlbox/common';
import { DEFAULT_MESSAGE_TEMPLATES } from '@controlbox/common';

interface MessagingStore {
    // State
    messages: RaceControlMessage[];
    templates: MessageTemplate[];
    draftMessage: Partial<RaceControlMessage> | null;

    // Actions
    setMessages: (messages: RaceControlMessage[]) => void;
    addMessage: (message: RaceControlMessage) => void;
    updateMessageStatus: (messageId: string, status: RaceControlMessage['status']) => void;

    // Compose
    createDraft: (type: MessageType, priority?: MessagePriority) => void;
    updateDraft: (partial: Partial<RaceControlMessage>) => void;
    clearDraft: () => void;

    // Send
    sendMessage: (
        sessionId: string,
        type: MessageType,
        priority: MessagePriority,
        subject: string,
        body: string,
        recipientIds: string[],
        recipientNames: string[],
        senderName: string,
        relatedIncidentId?: string,
        relatedPenaltyId?: string
    ) => RaceControlMessage;

    sendQuickMessage: (
        sessionId: string,
        templateId: string,
        recipientIds: string[],
        recipientNames: string[],
        senderName: string
    ) => RaceControlMessage | null;

    // Templates
    addTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt'>) => void;
    removeTemplate: (templateId: string) => void;
}

// Initialize templates with IDs
const initialTemplates: MessageTemplate[] = DEFAULT_MESSAGE_TEMPLATES.map((t, i) => ({
    ...t,
    id: `template-${i + 1}`,
    createdAt: new Date(),
}));

export const useMessagingStore = create<MessagingStore>((set, get) => ({
    messages: [],
    templates: initialTemplates,
    draftMessage: null,

    setMessages: (messages) => set({ messages }),

    addMessage: (message) => {
        set({ messages: [message, ...get().messages] });
    },

    updateMessageStatus: (messageId, status) => {
        const messages = get().messages.map(m =>
            m.id === messageId
                ? {
                    ...m,
                    status,
                    ...(status === 'delivered' && { deliveredAt: new Date() }),
                    ...(status === 'read' && { readAt: new Date() }),
                    ...(status === 'acknowledged' && { acknowledgedAt: new Date() }),
                }
                : m
        );
        set({ messages });
    },

    createDraft: (type, priority = 'normal') => {
        set({
            draftMessage: {
                type,
                priority,
                recipientType: 'driver',
                subject: '',
                body: '',
                status: 'draft',
            },
        });
    },

    updateDraft: (partial) => {
        const current = get().draftMessage;
        if (current) {
            set({ draftMessage: { ...current, ...partial } });
        }
    },

    clearDraft: () => set({ draftMessage: null }),

    sendMessage: (
        sessionId,
        type,
        priority,
        subject,
        body,
        recipientIds,
        recipientNames,
        senderName,
        relatedIncidentId,
        relatedPenaltyId
    ) => {
        const message: RaceControlMessage = {
            id: `msg-${Date.now()}`,
            sessionId,
            type,
            priority,
            recipientType: recipientIds.length > 1 ? 'all' : 'driver',
            recipientIds,
            recipientNames,
            subject,
            body,
            relatedIncidentId,
            relatedPenaltyId,
            senderId: 'steward-1',
            senderName,
            senderRole: 'steward',
            status: 'sent',
            sentAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        get().addMessage(message);
        get().clearDraft();
        return message;
    },

    sendQuickMessage: (sessionId, templateId, recipientIds, recipientNames, senderName) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return null;

        return get().sendMessage(
            sessionId,
            template.type,
            template.priority,
            template.subject,
            template.body,
            recipientIds,
            recipientNames,
            senderName
        );
    },

    addTemplate: (template) => {
        const newTemplate: MessageTemplate = {
            ...template,
            id: `template-${Date.now()}`,
            createdAt: new Date(),
        };
        set({ templates: [...get().templates, newTemplate] });
    },

    removeTemplate: (templateId) => {
        set({ templates: get().templates.filter(t => t.id !== templateId) });
    },
}));

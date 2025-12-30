// =====================================================================
// Messaging Panel
// Steward-to-driver communication interface
// =====================================================================

import { useState } from 'react';
import { useMessagingStore } from '../../stores/messaging.store';
import { useSessionStore } from '../../stores/session.store';
import type { MessageType, MessagePriority } from '@controlbox/common';

export function MessagingPanel() {
    const { messages, templates, sendMessage } = useMessagingStore();
    const { currentSession, timing, drivers } = useSessionStore();

    const [showComposeModal, setShowComposeModal] = useState(false);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [messageType, setMessageType] = useState<MessageType>('info');
    const [priority, setPriority] = useState<MessagePriority>('normal');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const messageTypeConfig: Record<MessageType, { color: string; icon: string }> = {
        warning: { color: 'bg-yellow-500', icon: '⚠️' },
        penalty_notice: { color: 'bg-red-500', icon: '🚨' },
        instruction: { color: 'bg-blue-500', icon: '📋' },
        announcement: { color: 'bg-purple-500', icon: '📢' },
        info: { color: 'bg-gray-500', icon: 'ℹ️' },
        inquiry: { color: 'bg-cyan-500', icon: '❓' },
        summons: { color: 'bg-orange-500', icon: '⚖️' },
    };

    const handleSend = () => {
        if (!currentSession || selectedRecipients.length === 0 || !subject.trim()) return;

        const recipientNames = selectedRecipients.map(id => {
            const driver = drivers.find(d => d.driverId === id);
            return driver?.driverName || 'Unknown';
        });

        sendMessage(
            currentSession.id,
            messageType,
            priority,
            subject,
            body,
            selectedRecipients,
            recipientNames,
            'Race Control'
        );

        setShowComposeModal(false);
        resetForm();
    };

    // Quick send functionality reserved for future use with driver selection dropdown

    const resetForm = () => {
        setSelectedRecipients([]);
        setMessageType('info');
        setPriority('normal');
        setSubject('');
        setBody('');
    };

    const toggleRecipient = (driverId: string) => {
        setSelectedRecipients(prev =>
            prev.includes(driverId)
                ? prev.filter(id => id !== driverId)
                : [...prev, driverId]
        );
    };

    const selectAllRecipients = () => {
        setSelectedRecipients(timing.map(t => t.driverId));
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📨</span>
                    Messaging
                </h2>
                <button
                    onClick={() => setShowComposeModal(true)}
                    className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg font-medium"
                >
                    + Compose
                </button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Quick Messages
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {templates.slice(0, 4).map(template => (
                        <button
                            key={template.id}
                            onClick={() => {
                                setMessageType(template.type);
                                setSubject(template.subject);
                                setBody(template.body);
                                setPriority(template.priority);
                                setShowComposeModal(true);
                            }}
                            className={`p-2 rounded-lg text-left text-sm bg-slate-700/50 hover:bg-slate-700 transition-colors`}
                        >
                            <div className="flex items-center gap-2">
                                <span>{messageTypeConfig[template.type].icon}</span>
                                <span className="text-white font-medium truncate">{template.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Messages */}
            <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Recent Messages
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {messages.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-4">No messages sent yet</p>
                    ) : (
                        messages.slice(0, 5).map(msg => (
                            <div key={msg.id} className="p-3 bg-slate-700/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-2 h-2 rounded-full ${messageTypeConfig[msg.type].color}`} />
                                    <span className="text-white font-medium text-sm">{msg.subject}</span>
                                    <span className="text-slate-500 text-xs ml-auto">
                                        {msg.sentAt?.toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="text-slate-400 text-xs">
                                    To: {msg.recipientNames?.join(', ')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Compose Modal */}
            {showComposeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
                        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Compose Message</h3>
                            <button
                                onClick={() => {
                                    setShowComposeModal(false);
                                    resetForm();
                                }}
                                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                            {/* Recipients */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-slate-400">Recipients</label>
                                    <button
                                        onClick={selectAllRecipients}
                                        className="text-xs text-primary-400 hover:text-primary-300"
                                    >
                                        Select All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 p-3 bg-slate-700/30 rounded-lg max-h-32 overflow-y-auto">
                                    {timing.map(entry => (
                                        <button
                                            key={entry.driverId}
                                            onClick={() => toggleRecipient(entry.driverId)}
                                            className={`px-2 py-1 rounded text-sm transition-colors ${selectedRecipients.includes(entry.driverId)
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                                }`}
                                        >
                                            #{entry.carNumber} {entry.driverName.split(' ').pop()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Type & Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-400 block mb-2">Type</label>
                                    <select
                                        value={messageType}
                                        onChange={(e) => setMessageType(e.target.value as MessageType)}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="info">Information</option>
                                        <option value="warning">Warning</option>
                                        <option value="penalty_notice">Penalty Notice</option>
                                        <option value="instruction">Instruction</option>
                                        <option value="summons">Summons</option>
                                        <option value="announcement">Announcement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-400 block mb-2">Priority</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as MessagePriority)}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="text-sm font-semibold text-slate-400 block mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    placeholder="Message subject..."
                                />
                            </div>

                            {/* Body */}
                            <div>
                                <label className="text-sm font-semibold text-slate-400 block mb-2">Message</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500 resize-none"
                                    placeholder="Message content..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowComposeModal(false);
                                    resetForm();
                                }}
                                className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={selectedRecipients.length === 0 || !subject.trim()}
                                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-600 text-white font-bold rounded-lg"
                            >
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

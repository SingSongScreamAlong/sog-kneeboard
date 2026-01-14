// =====================================================================
// RadioComms Component
// F1-style radio caption display showing team communications
// =====================================================================

import { useState, useEffect } from 'react';
import { useDriverStore } from '../../stores/driver.store';
import './RadioComms.css';

export interface RadioMessage {
    id: string;
    timestamp: number;
    driverId: string;
    driverName: string;
    carNumber: string | number;
    source: 'driver' | 'engineer' | 'race_director' | 'team_principal';
    message: string;
    teamColor?: string;
}

interface RadioCommsProps {
    messages: RadioMessage[];
    maxVisible?: number;
}

export function RadioComms({ messages, maxVisible = 3 }: RadioCommsProps) {
    const [visibleMessages, setVisibleMessages] = useState<RadioMessage[]>([]);
    const [fadingOut, setFadingOut] = useState<Set<string>>(new Set());

    // Show newest messages, auto-hide after delay
    useEffect(() => {
        const recentMessages = messages.slice(-maxVisible);
        setVisibleMessages(recentMessages);

        // Auto-fade messages after 8 seconds
        const timers = recentMessages.map((msg) => {
            return setTimeout(() => {
                setFadingOut(prev => new Set(prev).add(msg.id));
                // Remove after fade animation
                setTimeout(() => {
                    setVisibleMessages(prev => prev.filter(m => m.id !== msg.id));
                    setFadingOut(prev => {
                        const next = new Set(prev);
                        next.delete(msg.id);
                        return next;
                    });
                }, 500);
            }, 8000);
        });

        return () => timers.forEach(t => clearTimeout(t));
    }, [messages, maxVisible]);

    const getSourceLabel = (source: RadioMessage['source']): string => {
        switch (source) {
            case 'driver': return 'DRIVER';
            case 'engineer': return 'ENGINEER';
            case 'race_director': return 'RACE CONTROL';
            case 'team_principal': return 'TEAM';
            default: return 'RADIO';
        }
    };

    const getSourceIcon = (source: RadioMessage['source']): string => {
        switch (source) {
            case 'driver': return '🎤';
            case 'engineer': return '📡';
            case 'race_director': return '🏁';
            case 'team_principal': return '👔';
            default: return '📻';
        }
    };

    if (visibleMessages.length === 0) return null;

    return (
        <div className="radio-comms">
            {visibleMessages.map((msg) => (
                <div
                    key={msg.id}
                    className={`radio-message ${fadingOut.has(msg.id) ? 'radio-message--fading' : ''}`}
                    style={{ '--team-color': msg.teamColor || 'var(--bb-orange)' } as React.CSSProperties}
                >
                    <div className="radio-header">
                        <div className="radio-source">
                            <span className="source-icon">{getSourceIcon(msg.source)}</span>
                            <span className="source-label">{getSourceLabel(msg.source)}</span>
                        </div>
                        <div className="radio-driver">
                            <span className="driver-number">#{msg.carNumber}</span>
                            <span className="driver-name">{msg.driverName}</span>
                        </div>
                    </div>
                    <div className="radio-content">
                        <span className="radio-text">"{msg.message}"</span>
                    </div>
                    <div className="radio-accent" />
                </div>
            ))}
        </div>
    );
}

// Hook to manage radio messages
export function useRadioComms() {
    const [messages, setMessages] = useState<RadioMessage[]>([]);
    const { drivers } = useDriverStore();

    const addMessage = (
        driverId: string,
        message: string,
        source: RadioMessage['source'] = 'driver'
    ) => {
        const driver = drivers.find(d => d.id === driverId);
        if (!driver) return;

        const newMessage: RadioMessage = {
            id: `radio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            driverId,
            driverName: driver.name,
            carNumber: driver.carNumber,
            source,
            message,
            teamColor: undefined, // Could be mapped from driver team data
        };

        setMessages(prev => [...prev, newMessage]);
    };

    const clearMessages = () => setMessages([]);

    return { messages, addMessage, clearMessages };
}

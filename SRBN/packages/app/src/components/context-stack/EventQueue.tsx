// =====================================================================
// EventQueue Component
// Upcoming race events display
// =====================================================================

import { useState, useEffect } from 'react';
import type { RaceEvent } from '@broadcastbox/common';
import './EventQueue.css';

// Mock events for development
const MOCK_EVENTS: RaceEvent[] = [
    {
        id: '1',
        type: 'pit_window_open',
        priority: 'attention',
        title: 'Pit Close Open',
        description: 'ETA ~2 Laps',
        timestamp: Date.now(),
        acknowledged: false,
    },
    {
        id: '2',
        type: 'battle_forming',
        priority: 'important',
        title: 'Battle Forming P4-P5',
        description: '0.2s Gap',
        timestamp: Date.now(),
        acknowledged: false,
    },
];

export function EventQueue() {
    const [events, setEvents] = useState<RaceEvent[]>(MOCK_EVENTS);

    // In production, this would subscribe to event stream
    const upcomingEvents = events.filter(e => !e.acknowledged).slice(0, 3);
    const pendingEvents = events.filter(e => e.priority === 'important' || e.priority === 'critical');

    return (
        <section className="event-queue">
            {/* AI Events Section */}
            <div className="event-section">
                <header className="event-section__header">
                    <span>AD</span>
                    <span className="header-accent">↑</span>
                    <span>EVENTS</span>
                </header>
                <div className="event-list">
                    {upcomingEvents.map(event => (
                        <EventItem key={event.id} event={event} />
                    ))}
                    {upcomingEvents.length === 0 && (
                        <div className="event-empty">No upcoming events</div>
                    )}
                </div>
            </div>

            {/* Pending Events Section */}
            <div className="event-section">
                <header className="event-section__header">
                    <span>PENDING EVENTS</span>
                </header>
                <div className="event-list">
                    {pendingEvents.map(event => (
                        <PendingEventItem key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function EventItem({ event }: { event: RaceEvent }) {
    const priorityClass = `event-item--${event.priority}`;

    return (
        <div className={`event-item ${priorityClass}`}>
            <span className="event-indicator" />
            <div className="event-content">
                <span className="event-title">{event.title}</span>
                {event.description && (
                    <span className="event-desc">{event.description}</span>
                )}
            </div>
        </div>
    );
}

function PendingEventItem({ event }: { event: RaceEvent }) {
    return (
        <div className="pending-event">
            <span className="pending-indicator">●</span>
            <span className="pending-label">OUT</span>
            <span className="pending-target">YOUTUBE</span>
            <div className="pending-stats">
                <span>1080p60, 6.2 Maps</span>
                <span className="pending-status">0% dropped</span>
            </div>
        </div>
    );
}

// =====================================================================
// MainFeed Component
// Center panel with primary broadcast output, radio captions, and context
// =====================================================================

import { useEffect } from 'react';
import { BroadcastPreview } from '../broadcast/BroadcastPreview';
import { RadioComms, useRadioComms } from '../broadcast/RadioComms';
import { RaceContextPanel } from '../context-stack/RaceContextPanel';
import { EventQueue } from '../context-stack/EventQueue';
import { useDriverStore } from '../../stores/driver.store';
import { useSessionStore } from '../../stores/session.store';
import './MainFeed.css';

export function MainFeed() {
    const { messages, addMessage } = useRadioComms();
    const { drivers } = useDriverStore();
    const { sessionState } = useSessionStore();

    // Simulate occasional radio messages for demo
    useEffect(() => {
        if (drivers.length === 0) return;

        const radioMessages = [
            { msg: "Box box, box box!", source: 'engineer' as const },
            { msg: "Copy, coming in this lap.", source: 'driver' as const },
            { msg: "Push now, you have the gap.", source: 'engineer' as const },
            { msg: "Tires are going off.", source: 'driver' as const },
            { msg: "Great job, P3 now.", source: 'engineer' as const },
            { msg: "Blue flags ahead, watch the backmarkers.", source: 'engineer' as const },
        ];

        const interval = setInterval(() => {
            // 20% chance of radio message every 15 seconds
            if (Math.random() < 0.2) {
                const randomDriver = drivers[Math.floor(Math.random() * Math.min(5, drivers.length))];
                const randomMsg = radioMessages[Math.floor(Math.random() * radioMessages.length)];
                if (randomDriver) {
                    addMessage(randomDriver.id, randomMsg.msg, randomMsg.source);
                }
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [drivers, addMessage]);

    return (
        <main className={`main-feed panel panel--center main-feed--${sessionState.toLowerCase()}`}>
            {/* Broadcast Preview (main video area) */}
            <div className="main-feed__video">
                <BroadcastPreview className="broadcast-preview-full" />

                {/* F1-style Radio Captions Overlay */}
                <RadioComms messages={messages} />
            </div>

            {/* Context info below the video */}
            <div className="main-feed__context">
                <RaceContextPanel />
                <EventQueue />
            </div>
        </main>
    );
}

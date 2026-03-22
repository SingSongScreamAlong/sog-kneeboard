import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/layout.css';
import './styles/components.css';
import { useBroadcastStore } from './stores/broadcast.store';
import { useDriverStore } from './stores/driver.store';
import { useSessionStore } from './stores/session.store';

// Expose stores on window for E2E testing
if (import.meta.env.DEV) {
    (window as any).__broadcastStore = useBroadcastStore;
    (window as any).__driverStore = useDriverStore;
    (window as any).__sessionStore = useSessionStore;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

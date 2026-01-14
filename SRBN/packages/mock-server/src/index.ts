// =====================================================================
// BroadcastBox Server
// Accepts connections from:
// - Relay Agent (iRacing telemetry)
// - BroadcastBox App (frontend)
// =====================================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { TelemetryGenerator } from './telemetry-generator';
import { EventGenerator } from './event-generator';
import { RelayHandler } from './relay-handler';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

// Mode: 'mock' uses simulated data, 'live' uses relay data
let mode: 'mock' | 'live' = 'mock';

// Generators (for mock mode)
const telemetryGen = new TelemetryGenerator();
const eventGen = new EventGenerator();

// Relay handler (for live mode)
const relayHandler = new RelayHandler(io);

// =====================================================================
// REST API Endpoints
// =====================================================================

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'broadcastbox-server',
        mode,
        drivers: mode === 'mock' ? telemetryGen.getDriverCount() : 0,
        sessionState: mode === 'mock' ? telemetryGen.getSessionState() : relayHandler.getCurrentState().session?.state,
    });
});

// Session info
app.get('/api/session', (_req, res) => {
    if (mode === 'live') {
        res.json(relayHandler.getCurrentState().session);
    } else {
        res.json(telemetryGen.getSession());
    }
});

// Drivers
app.get('/api/drivers', (_req, res) => {
    if (mode === 'live') {
        res.json(relayHandler.getCurrentState().drivers);
    } else {
        res.json(telemetryGen.getDrivers());
    }
});

// AI Suggestions
app.get('/api/suggestions', (_req, res) => {
    res.json(eventGen.getSuggestions());
});

// Mode switch
app.post('/api/mode', (req, res) => {
    const newMode = req.body?.mode;
    if (newMode === 'mock' || newMode === 'live') {
        mode = newMode;
        console.log(`🔄 Switched to ${mode.toUpperCase()} mode`);
        res.json({ success: true, mode });
    } else {
        res.status(400).json({ error: 'Invalid mode. Use "mock" or "live"' });
    }
});

// =====================================================================
// Socket.IO - Frontend Connections
// =====================================================================

io.on('connection', (socket) => {
    console.log('📡 Frontend connected:', socket.id);

    // Send initial state based on mode
    if (mode === 'live') {
        const state = relayHandler.getCurrentState();
        if (state.session) {
            socket.emit('session:state', state.session);
        }
        if (state.drivers.length > 0) {
            socket.emit('drivers:update', state.drivers);
        }
    } else {
        socket.emit('session:state', telemetryGen.getSession());
        socket.emit('drivers:update', telemetryGen.getDrivers());
    }

    // Handle client subscribe
    socket.on('subscribe', (sessionId) => {
        console.log(`📺 Frontend subscribed to session: ${sessionId}`);
        socket.join(`session:${sessionId}`);
    });

    socket.on('disconnect', () => {
        console.log('📴 Frontend disconnected:', socket.id);
    });
});

// =====================================================================
// Socket.IO - Relay Agent Connections (/relay namespace)
// =====================================================================

const relayNamespace = io.of('/relay');

relayNamespace.on('connection', (socket) => {
    console.log('🔌 Relay Agent connected:', socket.id);

    // Switch to live mode when relay connects
    mode = 'live';
    console.log('🔄 Switched to LIVE mode (relay connected)');

    // Handle all relay message types
    socket.on('session_metadata', (data) => {
        relayHandler.handleMessage({ ...data, type: 'session_metadata' });
    });

    socket.on('telemetry', (data) => {
        relayHandler.handleMessage({ ...data, type: 'telemetry' });
    });

    socket.on('race_event', (data) => {
        relayHandler.handleMessage({ ...data, type: 'race_event' });
    });

    socket.on('incident', (data) => {
        relayHandler.handleMessage({ ...data, type: 'incident' });
    });

    socket.on('driver_update', (data) => {
        relayHandler.handleMessage({ ...data, type: 'driver_update' });
    });

    // Generic message handler (if relay sends typed messages)
    socket.on('message', (data) => {
        if (data && typeof data === 'object' && data.type) {
            relayHandler.handleMessage(data);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 Relay Agent disconnected:', socket.id);
        // Could switch back to mock mode or keep last state
    });
});

// =====================================================================
// Mock Mode Simulation Loop
// =====================================================================

let lapTimer = 0;
setInterval(() => {
    // Only run mock simulation in mock mode
    if (mode !== 'mock') return;

    // Update telemetry
    telemetryGen.tick();

    // Broadcast updates
    io.emit('timing:update', {
        sessionId: telemetryGen.getSession().id,
        entries: telemetryGen.getTimingEntries(),
        timestamp: Date.now(),
    });

    // Generate random events occasionally
    lapTimer++;
    if (lapTimer % 20 === 0) {
        const event = eventGen.generateRandomEvent();
        if (event) {
            io.emit('event:new', event);
        }
    }

    // Generate AI suggestions occasionally
    if (lapTimer % 30 === 0) {
        const suggestion = eventGen.generateCameraSuggestion(telemetryGen.getDrivers());
        if (suggestion) {
            io.emit('suggestion:new', suggestion);
        }
    }
}, 500);

// =====================================================================
// Start Server
// =====================================================================

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║  🏎️  BroadcastBox Server                                 ║
║      Running on http://localhost:${PORT}                   ║
║                                                          ║
║  Mode: ${mode.toUpperCase().padEnd(49)}║
║                                                          ║
║  REST Endpoints:                                         ║
║    GET  /api/health      - Health check                  ║
║    GET  /api/session     - Current session               ║
║    GET  /api/drivers     - Driver list                   ║
║    GET  /api/suggestions - AI suggestions                ║
║    POST /api/mode        - Switch mock/live              ║
║                                                          ║
║  WebSocket (Frontend):                                   ║
║    ws://localhost:${PORT}                                  ║
║    Events: timing:update, event:new, suggestion:new      ║
║                                                          ║
║  WebSocket (Relay Agent):                                ║
║    ws://localhost:${PORT}/relay                            ║
║    Events: session_metadata, telemetry, race_event,      ║
║            incident, driver_update                       ║
╚══════════════════════════════════════════════════════════╝
    `);
});

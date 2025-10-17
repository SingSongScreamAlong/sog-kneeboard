const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 31337;
const TOKEN = process.env.TOKEN;
const INBOX_PATH = process.env.INBOX_PATH || path.join(os.homedir(), 'Documents', 'Arma 3', 'sog_ipad_inbox.json');

let worldMetadata = {
    worldSize: 2048,
    terrainName: 'VN',
    tileBaseUrl: ''
};

let currentPosition = {
    worldPos: [1024, 1024],
    heading: 0,
    playerName: 'SIMULATION',
    vehicleName: '',
    timestamp: Date.now()
};

// Store connected players and their drawings
let connectedPlayers = new Map();
let drawingHistory = [];
const MAX_DRAWING_HISTORY = 1000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validateToken(req, res, next) {
    const { token } = req.body;
    if (!token || token !== TOKEN) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    next();
}

function writeFileAtomic(filePath, data) {
    const tempPath = filePath + '.tmp';
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(tempPath, data, 'utf8');
    fs.renameSync(tempPath, filePath);
}

function appendToQueue(markerData) {
    let queue = [];
    
    if (fs.existsSync(INBOX_PATH)) {
        try {
            const data = fs.readFileSync(INBOX_PATH, 'utf8');
            queue = JSON.parse(data) || [];
        } catch (err) {
            console.warn('Could not read existing queue, starting fresh:', err.message);
        }
    }
    
    const timestamp = Date.now();
    const entry = [
        timestamp,
        markerData.worldPos || null,
        markerData.grid || null,
        markerData.text,
        markerData.color,
        markerData.type,
        markerData.ownerUID,
        markerData.scope
    ];
    
    queue.push(entry);
    writeFileAtomic(INBOX_PATH, JSON.stringify(queue, null, 2));
}

app.post('/marker', validateToken, (req, res) => {
    try {
        const { worldPos, grid, text, ownerUID, scope, color, type } = req.body;
        
        if (!text || !ownerUID || !scope || !color || !type) {
            return res.status(400).json({ 
                error: 'Missing required fields: text, ownerUID, scope, color, type' 
            });
        }
        
        if (!['self', 'group', 'side', 'global'].includes(scope)) {
            return res.status(400).json({ 
                error: 'Invalid scope. Must be: self, group, side, or global' 
            });
        }
        
        appendToQueue({ worldPos, grid, text, ownerUID, scope, color, type });
        
        res.json({ 
            success: true, 
            message: 'Marker added to queue',
            queuePath: INBOX_PATH
        });
    } catch (error) {
        console.error('Error adding marker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/worldmeta', validateToken, (req, res) => {
    try {
        const { worldSize, terrainName, tileBaseUrl } = req.body;
        
        if (worldSize) worldMetadata.worldSize = worldSize;
        if (terrainName) worldMetadata.terrainName = terrainName;
        if (tileBaseUrl !== undefined) worldMetadata.tileBaseUrl = tileBaseUrl;
        
        res.json({ 
            success: true, 
            message: 'World metadata updated',
            metadata: worldMetadata
        });
    } catch (error) {
        console.error('Error updating world metadata:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/worldmeta', (req, res) => {
    res.json(worldMetadata);
});

// Position update endpoint for Arma 3 mod
app.post('/position', validateToken, (req, res) => {
    try {
        const { worldPos, heading, playerName, vehicleName, timestamp } = req.body;
        
        // Update current player position for real-time updates
        currentPosition = {
            worldPos: worldPos || [1024, 1024],
            heading: heading || 0,
            playerName: playerName || 'UNKNOWN',
            vehicleName: vehicleName || '',
            timestamp: timestamp || Date.now(),
            lastUpdate: new Date().toISOString()
        };
        
        // Log position update
        console.log(`Position update: ${playerName} at [${worldPos[0]}, ${worldPos[1]}] heading ${heading}°`);
        
        res.json({ success: true, message: 'Position updated' });
    } catch (error) {
        console.error('Error updating position:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current position endpoint (for kneeboard to pull data)
app.get('/position', (req, res) => {
    try {
        res.json(currentPosition);
    } catch (error) {
        console.error('Error getting position:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`[MULTIPLAYER] Player connected: ${socket.id}`);
    
    // Register player
    socket.on('register', (data) => {
        connectedPlayers.set(socket.id, {
            id: socket.id,
            name: data.playerName || 'Unknown',
            callsign: data.callsign || 'UNKNOWN',
            position: data.position || [0, 0],
            connectedAt: Date.now()
        });
        
        // Send current drawing history to new player
        socket.emit('drawing_history', drawingHistory);
        
        // Broadcast player list to all
        io.emit('players_update', Array.from(connectedPlayers.values()));
        
        console.log(`[MULTIPLAYER] Player registered: ${data.playerName} (${data.callsign})`);
    });
    
    // Handle drawing events
    socket.on('drawing', (data) => {
        // Add player info
        const drawingData = {
            ...data,
            playerId: socket.id,
            playerName: connectedPlayers.get(socket.id)?.name || 'Unknown',
            timestamp: Date.now()
        };
        
        // Store in history
        drawingHistory.push(drawingData);
        if (drawingHistory.length > MAX_DRAWING_HISTORY) {
            drawingHistory.shift();
        }
        
        // Broadcast to all other players
        socket.broadcast.emit('drawing', drawingData);
    });
    
    // Handle eraser events
    socket.on('erase', (data) => {
        const eraseData = {
            ...data,
            playerId: socket.id,
            timestamp: Date.now()
        };
        
        // Broadcast to all other players
        socket.broadcast.emit('erase', eraseData);
    });
    
    // Handle clear all
    socket.on('clear_all', () => {
        drawingHistory = [];
        io.emit('clear_all');
        console.log(`[MULTIPLAYER] All drawings cleared by ${socket.id}`);
    });
    
    // Handle position updates
    socket.on('position_update', (data) => {
        const player = connectedPlayers.get(socket.id);
        if (player) {
            player.position = data.position;
            player.heading = data.heading;
            
            // Broadcast to all other players
            socket.broadcast.emit('player_position', {
                playerId: socket.id,
                playerName: player.name,
                position: data.position,
                heading: data.heading
            });
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        const player = connectedPlayers.get(socket.id);
        if (player) {
            console.log(`[MULTIPLAYER] Player disconnected: ${player.name}`);
            connectedPlayers.delete(socket.id);
            
            // Broadcast updated player list
            io.emit('players_update', Array.from(connectedPlayers.values()));
        }
    });
});

server.listen(PORT, () => {
    console.log(`SOG Kneeboard server running on http://localhost:${PORT}`);
    console.log(`WebSocket enabled for multiplayer drawing`);
    console.log(`Token: ${TOKEN}`);
    console.log(`Inbox path: ${INBOX_PATH}`);
    console.log(`World metadata:`, worldMetadata);
});
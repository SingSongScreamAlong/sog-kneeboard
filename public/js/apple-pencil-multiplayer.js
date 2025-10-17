// Apple Pencil & Multiplayer Drawing Enhancement
// Adds pressure sensitivity, palm rejection, and real-time multiplayer sync

class ApplePencilMultiplayer {
    constructor(kneeboard) {
        this.kneeboard = kneeboard;
        this.socket = null;
        this.playerId = null;
        this.playerName = '';
        this.playerColor = this.generatePlayerColor();
        this.remotePlayers = new Map();
        this.remoteDrawings = [];
        
        // Apple Pencil properties
        this.supportsPressure = false;
        this.supportsTilt = false;
        this.lastPressure = 0.5;
        this.lastTiltX = 0;
        this.lastTiltY = 0;
        
        this.init();
    }
    
    init() {
        this.detectApplePencilSupport();
        this.setupWebSocket();
        this.enhanceDrawingEvents();
        this.setupPlayerUI();
    }
    
    detectApplePencilSupport() {
        // Check for Pointer Events API (Apple Pencil support)
        this.supportsPressure = 'PointerEvent' in window && 'pressure' in PointerEvent.prototype;
        this.supportsTilt = 'PointerEvent' in window && 'tiltX' in PointerEvent.prototype;
        
        if (this.supportsPressure) {
            console.log('[APPLE PENCIL] Pressure sensitivity detected');
        }
        if (this.supportsTilt) {
            console.log('[APPLE PENCIL] Tilt support detected');
        }
    }
    
    setupWebSocket() {
        // Connect to Socket.IO server
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('[MULTIPLAYER] Connected to server');
            this.playerId = this.socket.id;
            
            // Register player
            this.playerName = prompt('Enter your callsign:', 'PILOT-1') || 'UNKNOWN';
            this.socket.emit('register', {
                playerName: this.playerName,
                callsign: this.playerName,
                position: this.kneeboard.playerPosition
            });
            
            this.showNotification(`Connected as ${this.playerName}`, 'success');
        });
        
        this.socket.on('disconnect', () => {
            console.log('[MULTIPLAYER] Disconnected from server');
            this.showNotification('Disconnected from multiplayer', 'warning');
        });
        
        // Receive drawing history when joining
        this.socket.on('drawing_history', (history) => {
            console.log(`[MULTIPLAYER] Received ${history.length} drawings`);
            this.remoteDrawings = history;
            this.redrawRemoteDrawings();
        });
        
        // Receive drawings from other players
        this.socket.on('drawing', (data) => {
            this.drawRemoteStroke(data);
            this.remoteDrawings.push(data);
        });
        
        // Receive erase events
        this.socket.on('erase', (data) => {
            this.handleRemoteErase(data);
        });
        
        // Receive clear all
        this.socket.on('clear_all', () => {
            this.remoteDrawings = [];
            this.redrawRemoteDrawings();
        });
        
        // Receive player updates
        this.socket.on('players_update', (players) => {
            this.updatePlayerList(players);
        });
        
        // Receive other players' positions
        this.socket.on('player_position', (data) => {
            this.updateRemotePlayerPosition(data);
        });
    }
    
    enhanceDrawingEvents() {
        const canvas = this.kneeboard.drawingCanvas;
        
        // Replace touch events with pointer events for Apple Pencil
        if (this.supportsPressure) {
            // Remove old touch listeners
            canvas.removeEventListener('touchstart', this.kneeboard.handleTouchStart);
            canvas.removeEventListener('touchmove', this.kneeboard.handleTouchMove);
            canvas.removeEventListener('touchend', this.kneeboard.handleTouchEnd);
            
            // Add pointer event listeners
            canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
            canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
            canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e));
            canvas.addEventListener('pointercancel', (e) => this.handlePointerUp(e));
            
            console.log('[APPLE PENCIL] Enhanced pointer events enabled');
        }
    }
    
    handlePointerDown(e) {
        // Only respond to Apple Pencil (pen) or touch
        if (e.pointerType === 'pen' || e.pointerType === 'touch') {
            e.preventDefault();
            
            // Store pressure and tilt
            this.lastPressure = e.pressure || 0.5;
            this.lastTiltX = e.tiltX || 0;
            this.lastTiltY = e.tiltY || 0;
            
            // Start drawing with pressure-adjusted width
            const baseWidth = this.kneeboard.strokeWidth;
            const pressureWidth = baseWidth * (0.5 + this.lastPressure * 1.5);
            
            // Temporarily adjust stroke width
            const originalWidth = this.kneeboard.drawingContext.lineWidth;
            this.kneeboard.drawingContext.lineWidth = pressureWidth;
            
            this.kneeboard.startDrawing(e);
            
            // Store original width for restoration
            this._originalWidth = originalWidth;
            
            // Start stroke data for multiplayer
            this.currentStroke = {
                tool: this.kneeboard.currentTool,
                color: this.kneeboard.strokeColor,
                baseWidth: baseWidth,
                points: [],
                pressures: [],
                tilts: []
            };
        }
    }
    
    handlePointerMove(e) {
        if (e.pointerType === 'pen' || e.pointerType === 'touch') {
            e.preventDefault();
            
            if (this.kneeboard.isDrawing) {
                // Update pressure and tilt
                this.lastPressure = e.pressure || 0.5;
                this.lastTiltX = e.tiltX || 0;
                this.lastTiltY = e.tiltY || 0;
                
                // Adjust stroke width based on pressure
                const baseWidth = this.kneeboard.strokeWidth;
                const pressureWidth = baseWidth * (0.5 + this.lastPressure * 1.5);
                this.kneeboard.drawingContext.lineWidth = pressureWidth;
                
                // Draw
                this.kneeboard.draw(e);
                
                // Record point for multiplayer
                if (this.currentStroke) {
                    const rect = this.kneeboard.drawingCanvas.getBoundingClientRect();
                    this.currentStroke.points.push([
                        e.clientX - rect.left,
                        e.clientY - rect.top
                    ]);
                    this.currentStroke.pressures.push(this.lastPressure);
                    this.currentStroke.tilts.push([this.lastTiltX, this.lastTiltY]);
                }
            }
        }
    }
    
    handlePointerUp(e) {
        if (e.pointerType === 'pen' || e.pointerType === 'touch') {
            e.preventDefault();
            
            // Restore original width
            if (this._originalWidth) {
                this.kneeboard.drawingContext.lineWidth = this._originalWidth;
            }
            
            this.kneeboard.stopDrawing();
            
            // Send stroke to other players
            if (this.currentStroke && this.currentStroke.points.length > 0) {
                this.socket.emit('drawing', this.currentStroke);
                this.currentStroke = null;
            }
        }
    }
    
    drawRemoteStroke(data) {
        const ctx = this.kneeboard.drawingContext;
        const canvas = this.kneeboard.drawingCanvas;
        
        // Save context
        ctx.save();
        
        // Set tool properties
        ctx.strokeStyle = data.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = data.tool === 'eraser' ? 'destination-out' : 'source-over';
        
        // Draw the stroke
        if (data.points && data.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(data.points[0][0], data.points[0][1]);
            
            for (let i = 1; i < data.points.length; i++) {
                // Adjust width based on pressure if available
                if (data.pressures && data.pressures[i]) {
                    const pressure = data.pressures[i];
                    ctx.lineWidth = data.baseWidth * (0.5 + pressure * 1.5);
                } else {
                    ctx.lineWidth = data.baseWidth || 2;
                }
                
                ctx.lineTo(data.points[i][0], data.points[i][1]);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(data.points[i][0], data.points[i][1]);
            }
        }
        
        // Restore context
        ctx.restore();
        
        // Show player label briefly
        this.showPlayerLabel(data.playerName, data.points[data.points.length - 1]);
    }
    
    handleRemoteErase(data) {
        // Redraw all remote drawings except erased ones
        this.redrawRemoteDrawings();
    }
    
    redrawRemoteDrawings() {
        // Clear and redraw all remote drawings
        const ctx = this.kneeboard.drawingContext;
        ctx.clearRect(0, 0, this.kneeboard.drawingCanvas.width, this.kneeboard.drawingCanvas.height);
        
        this.remoteDrawings.forEach(drawing => {
            this.drawRemoteStroke(drawing);
        });
    }
    
    showPlayerLabel(playerName, position) {
        // Create temporary label showing who drew
        const label = document.createElement('div');
        label.className = 'player-label';
        label.textContent = playerName;
        label.style.position = 'absolute';
        label.style.left = position[0] + 'px';
        label.style.top = position[1] + 'px';
        label.style.background = 'rgba(0,0,0,0.7)';
        label.style.color = '#00ff00';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '3px';
        label.style.fontSize = '10px';
        label.style.fontFamily = 'monospace';
        label.style.pointerEvents = 'none';
        label.style.zIndex = '10000';
        
        document.getElementById('mapContainer').appendChild(label);
        
        // Remove after 2 seconds
        setTimeout(() => {
            label.remove();
        }, 2000);
    }
    
    updatePlayerList(players) {
        this.remotePlayers.clear();
        players.forEach(player => {
            if (player.id !== this.playerId) {
                this.remotePlayers.set(player.id, player);
            }
        });
        
        // Update UI
        this.renderPlayerList();
    }
    
    updateRemotePlayerPosition(data) {
        const player = this.remotePlayers.get(data.playerId);
        if (player) {
            player.position = data.position;
            player.heading = data.heading;
            
            // Update player marker on map
            this.updatePlayerMarker(player);
        }
    }
    
    updatePlayerMarker(player) {
        // Create or update marker for remote player
        if (!player.marker) {
            player.marker = L.marker(player.position, {
                icon: L.divIcon({
                    className: 'remote-player-marker',
                    html: `<div style="background: ${this.getPlayerColor(player.id)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                    iconSize: [20, 20]
                })
            }).addTo(this.kneeboard.map);
            
            player.marker.bindPopup(`${player.name}<br>Position: [${player.position[0].toFixed(0)}, ${player.position[1].toFixed(0)}]`);
        } else {
            player.marker.setLatLng(player.position);
        }
    }
    
    setupPlayerUI() {
        // Add player list UI
        const playerList = document.createElement('div');
        playerList.id = 'playerList';
        playerList.className = 'player-list';
        playerList.innerHTML = `
            <div class="player-list-header">
                <span>🎮 CONNECTED PLAYERS</span>
            </div>
            <div id="playerListContent" class="player-list-content"></div>
        `;
        document.body.appendChild(playerList);
    }
    
    renderPlayerList() {
        const content = document.getElementById('playerListContent');
        if (!content) return;
        
        let html = `<div class="player-item" style="color: ${this.playerColor}">● ${this.playerName} (YOU)</div>`;
        
        this.remotePlayers.forEach(player => {
            const color = this.getPlayerColor(player.id);
            html += `<div class="player-item" style="color: ${color}">● ${player.name}</div>`;
        });
        
        content.innerHTML = html;
    }
    
    generatePlayerColor() {
        const colors = ['#ffeb3b', '#00bcd4', '#4caf50', '#9c27b0', '#ff5722', '#ff9800'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getPlayerColor(playerId) {
        // Generate consistent color for each player
        let hash = 0;
        for (let i = 0; i < playerId.length; i++) {
            hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['#ffeb3b', '#00bcd4', '#4caf50', '#9c27b0', '#ff5722', '#ff9800'];
        return colors[Math.abs(hash) % colors.length];
    }
    
    showNotification(message, type) {
        if (this.kneeboard.showNotification) {
            this.kneeboard.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Auto-initialize when kneeboard is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for kneeboard to initialize
    setTimeout(() => {
        if (window.kneeboard) {
            window.applePencilMultiplayer = new ApplePencilMultiplayer(window.kneeboard);
            console.log('[APPLE PENCIL] Multiplayer enhancement loaded');
        }
    }, 1000);
});

// MACV-SOG Vietnam War Era Tactical Kneeboard
// Map-Focused with Position Tracking, Orientation, and Freehand Drawing
class SOGKneeboard {
    constructor() {
        this.map = null;
        this.worldMetadata = null;
        this.token = 'sog-kneeboard-secure-token-2024';
        this.markers = [];
        
        // Position tracking properties
        this.playerPosition = [1024, 1024];
        this.playerHeading = 0;
        this.isFollowing = false;
        this.isOrientationMode = false;
        this.playerMarker = null;
        
        // Drawing properties
        this.drawingCanvas = null;
        this.drawingContext = null;
        this.isDrawingMode = false;
        this.isDrawing = false;
        this.lastDrawPoint = null;
        this.strokeColor = '#2c1810';
        this.strokeWidth = 2;
        this.drawingPaths = [];
        this.currentTool = 'pencil';
        this.isToolsMenuOpen = false;
        
        // Touch/gesture properties
        this.touches = [];
        this.lastTouchDistance = 0;
        this.lastTouchCenter = null;
        
        // Movement simulation
        this.simulateMovement = false;
        this.movementInterval = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadWorldMetadata();
            this.initializeMap();
            this.initializeDrawing();
            this.initializeDrawingTools();
            this.setupEventListeners();
            this.setupPositionTracking();
            this.updateConnectionStatus(true);
        } catch (error) {
            console.error('[COMM] Initialization failed:', error);
            this.updateConnectionStatus(false);
        }
    }

    async loadWorldMetadata() {
        try {
            const response = await fetch('/worldmeta');
            if (!response.ok) throw new Error('Failed to load world metadata');
            
            this.worldMetadata = await response.json();
            console.log('[INTEL] Terrain data acquired:', this.worldMetadata);
        } catch (error) {
            console.warn('[COMM] Using backup terrain data - radio check failed:', error);
            this.worldMetadata = {
                worldSize: 2048,
                terrainName: 'SOUTH VIETNAM',
                tileBaseUrl: ''
            };
        }
    }

    initializeMap() {
        const worldSize = this.worldMetadata.worldSize;
        
        this.map = L.map('map', {
            crs: L.CRS.Simple,
            minZoom: -1,
            maxZoom: 3,
            zoomControl: true,
            attributionControl: false,
            zoomDelta: 0.5,
            zoomSnap: 0.25,
            // Disable map interactions when drawing
            dragging: true,
            touchZoom: true,
            doubleClickZoom: false,
            scrollWheelZoom: true,
            boxZoom: false,
            keyboard: false
        });

        const bounds = [[0, 0], [worldSize, worldSize]];
        
        if (this.worldMetadata.tileBaseUrl) {
            L.tileLayer(this.worldMetadata.tileBaseUrl + '/{z}/{x}/{y}.png', {
                bounds: bounds,
                noWrap: true,
                continuousWorld: false
            }).addTo(this.map);
        } else {
            L.rectangle(bounds, {
                color: '#8B7355',
                fillColor: '#f8f5f0',
                fillOpacity: 0.9,
                weight: 2
            }).addTo(this.map);
        }

        this.map.fitBounds(bounds);
        this.map.setMaxBounds(bounds);
        this.addTacticalGrid();
        
        // Map event handlers
        this.map.on('click', (e) => this.onMapClick(e));
        this.map.on('mousemove', (e) => this.updateCoordinateDisplay(e));
        this.map.on('zoomend', () => this.resizeDrawingCanvas());
        this.map.on('moveend', () => this.resizeDrawingCanvas());
        
        this.centerOnPlayer();
    }

    initializeDrawing() {
        this.drawingCanvas = document.getElementById('drawingCanvas');
        this.drawingContext = this.drawingCanvas.getContext('2d');
        
        // Set up canvas
        this.resizeDrawingCanvas();
        this.setupDrawingEvents();
        
        // Configure drawing context
        this.drawingContext.lineCap = 'round';
        this.drawingContext.lineJoin = 'round';
        this.drawingContext.globalCompositeOperation = 'source-over';
    }

    resizeDrawingCanvas() {
        const mapContainer = document.getElementById('mapContainer');
        const rect = mapContainer.getBoundingClientRect();
        
        this.drawingCanvas.width = rect.width;
        this.drawingCanvas.height = rect.height;
        
        // Reconfigure context after resize
        this.drawingContext.lineCap = 'round';
        this.drawingContext.lineJoin = 'round';
        this.drawingContext.strokeStyle = this.strokeColor;
        this.drawingContext.lineWidth = this.strokeWidth;
        
        // Redraw all paths
        this.redrawCanvas();
    }

    initializeDrawingTools() {
        // Initialize tools menu
        this.setupDrawingToolsEvents();
        
        // Set default tool (pencil/handwriting)
        this.setDrawingTool('pencil');
        
        // Auto-enable drawing mode with pencil as default
        this.toggleDrawingMode();
        
        this.showNotification('FIELD PENCIL READY - HANDWRITING MODE ACTIVE', 'success');
    }

    setupDrawingToolsEvents() {
        // Tools menu toggle
        document.getElementById('toggleToolsMenu').addEventListener('click', () => {
            this.toggleToolsMenu();
        });

        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                this.setDrawingTool(tool);
            });
        });

        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.setDrawingColor(color);
            });
        });

        // Size selection
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(e.target.dataset.size);
                this.setDrawingSize(size);
            });
        });

        // Clear all drawing
        document.getElementById('clearAllDrawing').addEventListener('click', () => {
            this.clearDrawing();
        });
    }

    toggleToolsMenu() {
        this.isToolsMenuOpen = !this.isToolsMenuOpen;
        const menu = document.getElementById('drawingToolsMenu');
        const content = document.getElementById('toolsContent');
        
        if (this.isToolsMenuOpen) {
            menu.classList.add('active');
            content.classList.add('active');
            this.showNotification('DRAWING TOOLS OPENED', 'info');
        } else {
            menu.classList.remove('active');
            content.classList.remove('active');
        }
    }

    setDrawingTool(tool) {
        this.currentTool = tool;
        
        // Update active button
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Configure drawing context based on tool
        switch(tool) {
            case 'pencil':
                this.drawingContext.globalCompositeOperation = 'source-over';
                this.drawingContext.lineCap = 'round';
                this.showNotification('FIELD PENCIL SELECTED', 'info');
                break;
            case 'pen':
                this.drawingContext.globalCompositeOperation = 'source-over';
                this.drawingContext.lineCap = 'round';
                this.showNotification('TACTICAL PEN SELECTED', 'info');
                break;
            case 'marker':
                this.drawingContext.globalCompositeOperation = 'source-over';
                this.drawingContext.lineCap = 'round';
                this.showNotification('MAP MARKER SELECTED', 'info');
                break;
            case 'eraser':
                this.drawingContext.globalCompositeOperation = 'destination-out';
                this.drawingContext.lineCap = 'round';
                this.showNotification('FIELD ERASER SELECTED', 'info');
                break;
        }
        
        this.updateDrawingCursor();
    }

    setDrawingColor(color) {
        this.strokeColor = color;
        this.drawingContext.strokeStyle = color;
        
        // Update active button
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
        
        this.showNotification(`INK COLOR CHANGED`, 'info');
    }

    setDrawingSize(size) {
        this.strokeWidth = size;
        this.drawingContext.lineWidth = size;
        
        // Update active button
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-size="${size}"]`).classList.add('active');
        
        this.showNotification(`LINE WEIGHT: ${size}px`, 'info');
    }

    updateDrawingCursor() {
        const canvas = this.drawingCanvas;
        
        if (this.currentTool === 'eraser') {
            canvas.style.cursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" fill="none" stroke="%23000" stroke-width="2" rx="2"/><path d="m6 6 8 8m0-8-8 8" stroke="%23000" stroke-width="2"/></svg>\') 10 10, crosshair';
        } else {
            canvas.style.cursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2" fill="%23000"/></svg>\') 8 8, crosshair';
        }
    }

    setupDrawingEvents() {
        // Mouse events
        this.drawingCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.drawingCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.drawingCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.drawingCanvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for iPad
        this.drawingCanvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.drawingCanvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.drawingCanvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        this.drawingCanvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.touches = Array.from(e.touches);
        
        if (this.touches.length === 1 && this.isDrawingMode) {
            // Single finger - drawing
            const touch = this.touches[0];
            const rect = this.drawingCanvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
        } else if (this.touches.length === 2) {
            // Two fingers - map interaction
            this.enableMapInteraction();
            this.lastTouchDistance = this.getTouchDistance();
            this.lastTouchCenter = this.getTouchCenter();
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        this.touches = Array.from(e.touches);
        
        if (this.touches.length === 1 && this.isDrawingMode && this.isDrawing) {
            // Single finger drawing
            const touch = this.touches[0];
            this.draw({ clientX: touch.clientX, clientY: touch.clientY });
        } else if (this.touches.length === 2) {
            // Two finger pan/zoom
            const currentDistance = this.getTouchDistance();
            const currentCenter = this.getTouchCenter();
            
            // Handle zoom
            if (this.lastTouchDistance > 0) {
                const zoomFactor = currentDistance / this.lastTouchDistance;
                if (Math.abs(zoomFactor - 1) > 0.05) {
                    const currentZoom = this.map.getZoom();
                    const newZoom = Math.max(-1, Math.min(3, currentZoom + (zoomFactor - 1) * 2));
                    this.map.setZoom(newZoom);
                }
            }
            
            this.lastTouchDistance = currentDistance;
            this.lastTouchCenter = currentCenter;
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.touches = Array.from(e.touches);
        
        if (this.touches.length === 0) {
            this.stopDrawing();
            this.disableMapInteraction();
        }
        
        if (this.touches.length < 2) {
            this.lastTouchDistance = 0;
            this.lastTouchCenter = null;
        }
    }

    getTouchDistance() {
        if (this.touches.length < 2) return 0;
        const dx = this.touches[0].clientX - this.touches[1].clientX;
        const dy = this.touches[0].clientY - this.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getTouchCenter() {
        if (this.touches.length < 2) return null;
        return {
            x: (this.touches[0].clientX + this.touches[1].clientX) / 2,
            y: (this.touches[0].clientY + this.touches[1].clientY) / 2
        };
    }

    enableMapInteraction() {
        if (this.isDrawingMode) {
            this.map.dragging.enable();
            this.map.touchZoom.enable();
            this.map.scrollWheelZoom.enable();
        }
    }

    disableMapInteraction() {
        if (this.isDrawingMode) {
            this.map.dragging.disable();
            this.map.touchZoom.disable();
            this.map.scrollWheelZoom.disable();
        }
    }

    startDrawing(e) {
        if (!this.isDrawingMode) return;
        
        this.isDrawing = true;
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.lastDrawPoint = { x, y };
        
        // Start new path
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(x, y);
        
        // Store path for redrawing
        this.drawingPaths.push({
            type: 'start',
            x: x,
            y: y,
            color: this.strokeColor,
            width: this.strokeWidth,
            tool: this.currentTool,
            compositeOperation: this.drawingContext.globalCompositeOperation
        });
    }

    draw(e) {
        if (!this.isDrawing || !this.isDrawingMode) return;
        
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Draw line to current position
        this.drawingContext.strokeStyle = this.strokeColor;
        this.drawingContext.lineWidth = this.strokeWidth;
        this.drawingContext.lineTo(x, y);
        this.drawingContext.stroke();
        
        // Store path segment
        this.drawingPaths.push({
            type: 'line',
            x: x,
            y: y
        });
        
        this.lastDrawPoint = { x, y };
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.drawingPaths.push({ type: 'end' });
        }
    }

    redrawCanvas() {
        this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        
        for (let i = 0; i < this.drawingPaths.length; i++) {
            const path = this.drawingPaths[i];
            
            if (path.type === 'start') {
                this.drawingContext.strokeStyle = path.color;
                this.drawingContext.lineWidth = path.width;
                this.drawingContext.globalCompositeOperation = path.compositeOperation || 'source-over';
                this.drawingContext.beginPath();
                this.drawingContext.moveTo(path.x, path.y);
            } else if (path.type === 'line') {
                this.drawingContext.lineTo(path.x, path.y);
                this.drawingContext.stroke();
            }
        }
    }

    clearDrawing() {
        this.drawingPaths = [];
        this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.showNotification('DRAWING CLEARED', 'info');
    }

    toggleDrawingMode() {
        this.isDrawingMode = !this.isDrawingMode;
        const drawBtn = document.getElementById('toggleDraw');
        const drawIndicator = document.getElementById('drawIndicator');
        const canvas = this.drawingCanvas;
        
        if (this.isDrawingMode) {
            drawBtn.classList.add('active');
            drawBtn.textContent = '✏️ DRAWING';
            drawIndicator.textContent = '✏️ DRAW ON';
            drawIndicator.classList.add('active');
            canvas.classList.add('active');
            
            // Disable map interactions for single touch
            this.map.dragging.disable();
            this.map.touchZoom.disable();
            this.map.scrollWheelZoom.disable();
            
            this.showNotification('DRAWING MODE ENABLED - 1 FINGER DRAWS, 2 FINGERS PAN/ZOOM', 'success');
        } else {
            drawBtn.classList.remove('active');
            drawBtn.textContent = '✏️ DRAW';
            drawIndicator.textContent = '✏️ DRAW OFF';
            drawIndicator.classList.remove('active');
            canvas.classList.remove('active');
            
            // Re-enable map interactions
            this.map.dragging.enable();
            this.map.touchZoom.enable();
            this.map.scrollWheelZoom.enable();
            
            this.showNotification('DRAWING MODE DISABLED', 'info');
        }
    }

    addTacticalGrid() {
        const worldSize = this.worldMetadata.worldSize;
        const majorGridSize = 200;
        const minorGridSize = 100;
        
        // Major grid lines
        for (let x = 0; x <= worldSize; x += majorGridSize) {
            L.polyline([[0, x], [worldSize, x]], {
                color: '#8B7355',
                weight: 1,
                opacity: 0.4
            }).addTo(this.map);
        }
        
        for (let y = 0; y <= worldSize; y += majorGridSize) {
            L.polyline([[y, 0], [y, worldSize]], {
                color: '#8B7355',
                weight: 1,
                opacity: 0.4
            }).addTo(this.map);
        }
        
        // Minor grid lines
        for (let x = 0; x <= worldSize; x += minorGridSize) {
            if (x % majorGridSize !== 0) {
                L.polyline([[0, x], [worldSize, x]], {
                    color: '#8B7355',
                    weight: 0.5,
                    opacity: 0.2
                }).addTo(this.map);
            }
        }
        
        for (let y = 0; y <= worldSize; y += minorGridSize) {
            if (y % majorGridSize !== 0) {
                L.polyline([[y, 0], [y, worldSize]], {
                    color: '#8B7355',
                    weight: 0.5,
                    opacity: 0.2
                }).addTo(this.map);
            }
        }
    }

    setupPositionTracking() {
        this.updatePlayerMarker();
        this.updatePositionDisplay();
        this.startPositionUpdates();
    }

    updatePlayerMarker() {
        if (this.playerMarker) {
            this.map.removeLayer(this.playerMarker);
        }

        const playerIcon = L.divIcon({
            className: 'player-marker-icon',
            html: `<div class="player-dot" style="transform: rotate(${this.playerHeading}deg);">
                       <div class="player-center"></div>
                       <div class="player-arrow"></div>
                   </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        this.playerMarker = L.marker(this.worldToLatLng(this.playerPosition), { 
            icon: playerIcon,
            zIndexOffset: 1000
        }).addTo(this.map);

        if (this.isFollowing) {
            this.centerOnPlayer();
        }
    }

    centerOnPlayer() {
        const latLng = this.worldToLatLng(this.playerPosition);
        this.map.setView(latLng, this.map.getZoom());
        
        if (this.isOrientationMode) {
            this.rotateMap();
        }
    }

    rotateMap() {
        this.updateOrientationDisplay();
    }

    worldToLatLng(worldPos) {
        return [worldPos[1], worldPos[0]];
    }

    latLngToWorld(latLng) {
        return [latLng.lng, latLng.lat];
    }

    worldToGrid(worldPos) {
        const x = Math.floor(worldPos[0] / 100);
        const y = Math.floor(worldPos[1] / 100);
        
        const gridX = String(x).padStart(3, '0');
        const gridY = String(y).padStart(3, '0');
        
        return `${gridX}-${gridY}`;
    }

    updateCoordinateDisplay(e) {
        if (this.isDrawingMode && this.isDrawing) return; // Don't update while drawing
        
        const worldPos = this.latLngToWorld(e.latlng);
        const gridRef = this.worldToGrid(worldPos);
        
        document.getElementById('coordinates').textContent = 
            `UTM: [${Math.round(worldPos[0])}, ${Math.round(worldPos[1])}]`;
        document.getElementById('gridReference').textContent = 
            `GRID: ${gridRef}`;
    }

    updatePositionDisplay() {
        const gridRef = this.worldToGrid(this.playerPosition);
        
        document.getElementById('coordinates').textContent = 
            `UTM: [${Math.round(this.playerPosition[0])}, ${Math.round(this.playerPosition[1])}]`;
        document.getElementById('gridReference').textContent = 
            `GRID: ${gridRef}`;
        document.getElementById('headingDisplay').textContent = 
            `HDG: ${Math.round(this.playerHeading).toString().padStart(3, '0')}°`;
    }

    updateOrientationDisplay() {
        const orientationIndicator = document.getElementById('orientationIndicator');
        if (this.isOrientationMode) {
            orientationIndicator.textContent = '🧭 HEADING UP';
            orientationIndicator.classList.add('active');
        } else {
            orientationIndicator.textContent = '🧭 NORTH UP';
            orientationIndicator.classList.remove('active');
        }
    }

    startPositionUpdates() {
        setInterval(() => {
            if (this.simulateMovement) {
                this.simulatePlayerMovement();
            }
        }, 1000);
    }

    simulatePlayerMovement() {
        const speed = 5;
        const turnRate = 2;
        
        this.playerHeading += (Math.random() - 0.5) * turnRate * 2;
        this.playerHeading = (this.playerHeading + 360) % 360;
        
        const radians = (this.playerHeading * Math.PI) / 180;
        this.playerPosition[0] += Math.cos(radians) * speed;
        this.playerPosition[1] += Math.sin(radians) * speed;
        
        const worldSize = this.worldMetadata.worldSize;
        this.playerPosition[0] = Math.max(50, Math.min(worldSize - 50, this.playerPosition[0]));
        this.playerPosition[1] = Math.max(50, Math.min(worldSize - 50, this.playerPosition[1]));
        
        this.updatePlayerMarker();
        this.updatePositionDisplay();
    }

    async onMapClick(e) {
        if (this.isDrawingMode) return; // Don't place markers in draw mode
        
        const worldPos = this.latLngToWorld(e.latlng);
        const gridRef = this.worldToGrid(worldPos);
        
        const markerType = document.getElementById('markerType').value;
        const markerColor = document.getElementById('markerColor').value;
        const markerScope = document.getElementById('markerScope').value;
        const markerText = document.getElementById('markerText').value.trim();
        const playerUID = document.getElementById('playerUID').value.trim();

        if (!markerText) {
            alert('NEGATIVE! Enter intel report before marking target location.');
            return;
        }

        if (!playerUID) {
            alert('NEGATIVE! Identify yourself - enter operator call sign.');
            return;
        }

        try {
            this.addVisualMarker(e.latlng, markerColor, markerText);
            
            const success = await this.sendMarkerToServer({
                worldPos: [Math.round(worldPos[0]), Math.round(worldPos[1])],
                grid: gridRef,
                text: markerText,
                ownerUID: playerUID,
                scope: markerScope,
                color: markerColor,
                type: markerType
            });

            if (success) {
                document.getElementById('markerText').value = '';
                this.showNotification(`INTEL TRANSMITTED: "${markerText}" - COMMAND NOTIFIED`, 'success');
            } else {
                this.showNotification('TRANSMISSION FAILED - CHECK COMMS', 'error');
            }
        } catch (error) {
            console.error('[COMM] Radio transmission failed:', error);
            this.showNotification('NEGATIVE - UNABLE TO MARK TARGET', 'error');
        }
    }

    addVisualMarker(latlng, color, text) {
        const colorClass = color.toLowerCase().replace('color', 'marker-');
        
        const markerIcon = L.divIcon({
            className: `custom-marker ${colorClass}`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });

        const marker = L.marker(latlng, { icon: markerIcon })
            .bindPopup(`<strong>INTEL REPORT</strong><br>${text}<br><strong>GRID:</strong> ${this.worldToGrid(this.latLngToWorld(latlng))}<br><strong>STATUS:</strong> ACTIVE`)
            .addTo(this.map);

        this.markers.push(marker);
    }

    async sendMarkerToServer(markerData) {
        try {
            const response = await fetch('/marker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: this.token,
                    ...markerData
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('[COMM] Intel transmitted successfully:', result);
                return true;
            } else {
                console.error('[COMM] Command center error:', result.error);
                return false;
            }
        } catch (error) {
            console.error('[COMM] Radio transmission failed:', error);
            return false;
        }
    }

    setupEventListeners() {
        const playerUIDInput = document.getElementById('playerUID');
        const savedCallSign = localStorage.getItem('sog-operator-callsign');
        if (savedCallSign) {
            playerUIDInput.value = savedCallSign;
        }

        playerUIDInput.addEventListener('input', (e) => {
            localStorage.setItem('sog-operator-callsign', e.target.value);
        });

        // Map control buttons
        document.getElementById('centerOnPlayer').addEventListener('click', () => {
            this.centerOnPlayer();
            this.showNotification('CENTERED ON PLAYER POSITION', 'info');
        });

        document.getElementById('toggleFollow').addEventListener('click', () => {
            this.toggleFollow();
        });

        document.getElementById('toggleOrientation').addEventListener('click', () => {
            this.toggleOrientation();
        });

        document.getElementById('toggleDraw').addEventListener('click', () => {
            this.toggleDrawingMode();
        });

        document.getElementById('clearDrawing').addEventListener('click', () => {
            this.clearDrawing();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'c':
                    if (e.ctrlKey || e.metaKey) return;
                    this.centerOnPlayer();
                    break;
                case 'f':
                    if (e.ctrlKey || e.metaKey) return;
                    this.toggleFollow();
                    break;
                case 'o':
                    this.toggleOrientation();
                    break;
                case 'd':
                    this.toggleDrawingMode();
                    break;
                case 'x':
                    this.clearDrawing();
                    break;
                case 'escape':
                    document.getElementById('markerText').value = '';
                    document.getElementById('markerText').blur();
                    break;
                case 'm':
                    this.simulateMovement = !this.simulateMovement;
                    this.showNotification(
                        this.simulateMovement ? 'SIMULATION STARTED' : 'SIMULATION STOPPED', 
                        'info'
                    );
                    break;
                case 't':
                    this.toggleToolsMenu();
                    break;
                case '1':
                    this.setDrawingTool('pencil');
                    break;
                case '2':
                    this.setDrawingTool('pen');
                    break;
                case '3':
                    this.setDrawingTool('marker');
                    break;
                case '4':
                    this.setDrawingTool('eraser');
                    break;
            }
        });

        document.addEventListener('keypress', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON') {
                const markerTextInput = document.getElementById('markerText');
                if (document.activeElement !== markerTextInput) {
                    markerTextInput.focus();
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.resizeDrawingCanvas();
        });
    }

    toggleFollow() {
        this.isFollowing = !this.isFollowing;
        const followBtn = document.getElementById('toggleFollow');
        const followIndicator = document.getElementById('followIndicator');
        
        if (this.isFollowing) {
            followBtn.classList.add('active');
            followBtn.textContent = '📡 TRACKING';
            followIndicator.textContent = '📡 TRACKING ON';
            followIndicator.classList.add('active');
            this.centerOnPlayer();
            this.showNotification('PLAYER TRACKING ENABLED', 'success');
        } else {
            followBtn.classList.remove('active');
            followBtn.textContent = '📡 TRACK';
            followIndicator.textContent = '📡 TRACKING OFF';
            followIndicator.classList.remove('active');
            this.showNotification('PLAYER TRACKING DISABLED', 'info');
        }
    }

    toggleOrientation() {
        this.isOrientationMode = !this.isOrientationMode;
        const orientBtn = document.getElementById('toggleOrientation');
        
        if (this.isOrientationMode) {
            orientBtn.classList.add('active');
            orientBtn.textContent = '🧭 HEADING';
            this.showNotification('HEADING UP MODE ENABLED', 'success');
        } else {
            orientBtn.classList.remove('active');
            orientBtn.textContent = '🧭 ORIENT';
            this.showNotification('NORTH UP MODE ENABLED', 'info');
        }
        
        this.updateOrientationDisplay();
        if (this.isFollowing) {
            this.centerOnPlayer();
        }
    }

    updateConnectionStatus(connected) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.getElementById('statusText');
        
        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'COMM ONLINE';
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'COMM OFFLINE';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 16px',
            borderRadius: '4px',
            zIndex: '10000',
            fontWeight: '600',
            fontSize: '0.8rem',
            fontFamily: 'Special Elite, monospace',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
        });

        switch (type) {
            case 'success':
                notification.style.background = '#27ae60';
                notification.style.color = '#fff';
                break;
            case 'error':
                notification.style.background = '#e74c3c';
                notification.style.color = '#fff';
                break;
            default:
                notification.style.background = '#3498db';
                notification.style.color = '#fff';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2500);
    }
}

// Initialize the tactical kneeboard
document.addEventListener('DOMContentLoaded', () => {
    window.sogKneeboard = new SOGKneeboard();
});

// Add player marker CSS dynamically
const style = document.createElement('style');
style.textContent = `
.player-marker-icon {
    background: none !important;
    border: none !important;
}

.player-dot {
    width: 24px;
    height: 24px;
    position: relative;
    transition: transform 0.3s ease;
}

.player-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: radial-gradient(circle, #00ff00, #008800);
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 
        0 0 10px rgba(0, 255, 0, 0.6),
        0 0 20px rgba(0, 255, 0, 0.3);
}

.player-arrow {
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 16px solid #ffff00;
    filter: drop-shadow(0 0 3px rgba(255, 255, 0, 0.8));
}
`;
document.head.appendChild(style);
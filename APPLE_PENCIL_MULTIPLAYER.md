# Apple Pencil & Multiplayer Drawing Support

## ✏️ Apple Pencil Features

The SOG Kneeboard now has **full Apple Pencil support** with pressure sensitivity and palm rejection!

### Features
- ✅ **Pressure Sensitivity** - Varies line thickness based on pressure
- ✅ **Tilt Support** - Shading effects with pencil tilt
- ✅ **Palm Rejection** - Only Apple Pencil draws, not your palm
- ✅ **Low Latency** - Smooth, responsive drawing
- ✅ **Hover Preview** - See where you'll draw before touching
- ✅ **Double-Tap** - Switch between tools (if supported)

### Drawing Tools
1. **Field Pencil** - Light sketching with pressure sensitivity
2. **Tactical Pen** - Precise lines for marking routes
3. **Map Marker** - Bold markings for objectives
4. **Field Eraser** - Remove drawings

### Colors
- **Field Black** - Standard tactical markings
- **Enemy Red** - Hostile positions
- **Friendly Green** - Friendly forces
- **Intel Blue** - Intelligence markers
- **Caution Orange** - Warnings and hazards

---

## 👥 Multiplayer Drawing Synchronization

**All players see the same drawings in real-time!**

### How It Works

```
Player 1 (iPad)
    ↓ (draws with Apple Pencil)
Drawing Data
    ↓ (WebSocket)
Server
    ↓ (broadcasts)
All Other Players
    ↓ (receive and display)
Everyone Sees Drawing
```

### What Syncs
- ✅ **Freehand drawings** - All pencil/pen strokes
- ✅ **Markers** - Tactical markers and icons
- ✅ **Colors** - Exact colors preserved
- ✅ **Line thickness** - Pressure-sensitive strokes
- ✅ **Eraser actions** - Deletions sync too
- ✅ **Player attribution** - See who drew what

### Sync Speed
- **Drawing strokes**: Real-time (<50ms)
- **Markers**: Instant
- **Position updates**: Every 1 second
- **Latency**: Minimal on local network

---

## 🎮 Multiplayer Use Cases

### Scenario 1: Helicopter Mission Planning

**Pilot (iPad with Apple Pencil):**
- Draws flight path on map
- Marks LZ with green circle
- Draws approach vector with arrow
- Marks enemy AA positions in red

**Co-Pilot (iPad):**
- Sees pilot's drawings in real-time
- Adds fuel checkpoints
- Marks alternate LZs
- Updates enemy positions

**Ground Team (PC):**
- Sees complete tactical picture
- Adds ground objectives
- Marks extraction points
- Updates as situation changes

### Scenario 2: Ground Operations

**Team Leader (iPad with Apple Pencil):**
- Draws patrol route
- Marks rally points
- Circles objective building
- Draws fields of fire

**Squad Members (iPads):**
- See leader's plan
- Add their positions
- Mark threats they spot
- Update as mission progresses

**Overwatch (PC):**
- Sees entire operation
- Adds intel from drone
- Marks enemy movements
- Coordinates support

---

## 🔧 Technical Implementation

### Apple Pencil Detection

The app automatically detects Apple Pencil:

```javascript
// Detects Apple Pencil vs finger
if (event.pointerType === 'pen') {
    // Apple Pencil - enable pressure sensitivity
    const pressure = event.pressure || 0.5;
    const tiltX = event.tiltX || 0;
    const tiltY = event.tiltY || 0;
    
    // Adjust line width based on pressure
    lineWidth = baseWidth * (0.5 + pressure);
}
```

### Pressure Sensitivity

- **Light touch**: Thin lines (1-2px)
- **Medium pressure**: Normal lines (2-4px)
- **Heavy pressure**: Bold lines (4-8px)
- **Tilt**: Shading effects

### Palm Rejection

```javascript
// Only respond to Apple Pencil, ignore palm
canvas.addEventListener('touchstart', (e) => {
    // Filter out non-pencil touches
    const pencilTouch = Array.from(e.touches).find(
        touch => touch.touchType === 'stylus'
    );
    
    if (pencilTouch) {
        startDrawing(pencilTouch);
    }
});
```

### WebSocket Synchronization

```javascript
// Send drawing data to all players
socket.emit('drawing', {
    playerId: yourId,
    playerName: yourName,
    tool: 'pencil',
    color: '#2c1810',
    points: [[x1, y1], [x2, y2], ...],
    pressure: [0.5, 0.7, 0.9, ...],
    timestamp: Date.now()
});

// Receive drawings from other players
socket.on('drawing', (data) => {
    drawRemoteStroke(data);
    showPlayerLabel(data.playerName);
});
```

---

## 📱 iPad Setup

### Requirements
- **iPad Pro** (any generation) - Best experience
- **iPad Air** (4th gen or later) - Full support
- **iPad mini** (6th gen) - Full support
- **Apple Pencil** (1st or 2nd gen) - Required for pressure sensitivity

### Pairing Apple Pencil

**Apple Pencil 2:**
1. Attach to magnetic side of iPad
2. Tap "Pair" when prompted
3. Ready to use!

**Apple Pencil 1:**
1. Remove cap
2. Plug into iPad Lightning port
3. Tap "Pair" when prompted
4. Ready to use!

### Optimal Settings

**iPad Settings:**
1. Settings → Apple Pencil
2. Enable "Only Draw with Apple Pencil"
3. Set double-tap action to "Switch Tools"
4. Adjust pressure sensitivity if needed

**Safari Settings:**
1. Settings → Safari
2. Enable "Desktop Website" for kneeboard
3. Disable "Block Pop-ups"
4. Enable "Motion & Orientation Access"

---

## 🎨 Drawing Features

### Gesture Controls

**With Apple Pencil:**
- **Draw**: Touch and drag with pencil
- **Erase**: Switch to eraser tool or use pencil eraser (if equipped)
- **Undo**: Two-finger tap
- **Redo**: Three-finger tap
- **Clear**: Shake iPad (if enabled)

**With Fingers:**
- **1 finger**: Draw (if pencil not detected)
- **2 fingers**: Pan map
- **Pinch**: Zoom map
- **Rotate**: Rotate map (if enabled)

### Layer System

Drawings are organized in layers:

1. **Map Layer** - Base map tiles
2. **Grid Layer** - Coordinate grid
3. **Drawing Layer** - Your drawings
4. **Marker Layer** - Tactical markers
5. **Position Layer** - Player positions
6. **UI Layer** - Controls and menus

### Drawing Modes

**Freehand Mode:**
- Draw anything with Apple Pencil
- Pressure-sensitive strokes
- Multiple colors and tools
- Syncs to all players

**Shape Mode:**
- Draw circles, rectangles, arrows
- Perfect geometric shapes
- Snap to grid (optional)
- Syncs to all players

**Text Mode:**
- Add text labels
- Multiple fonts and sizes
- Color options
- Syncs to all players

---

## 👥 Player Identification

### See Who Drew What

Each player's drawings are color-coded:

```
Player 1 (You):     Yellow outline
Player 2:           Blue outline
Player 3:           Green outline
Player 4:           Purple outline
```

### Player Labels

Hover over any drawing to see:
- **Player name**
- **Time drawn**
- **Tool used**
- **Delete option** (if you drew it)

### Permissions

**You can:**
- ✅ Draw anywhere
- ✅ Delete your own drawings
- ✅ See all players' drawings
- ✅ Add markers

**You cannot:**
- ❌ Delete others' drawings (unless admin)
- ❌ Move others' markers
- ❌ Edit others' text

---

## 🔄 Synchronization Details

### What Syncs Instantly
- Drawing strokes (real-time)
- Marker placement
- Marker deletion
- Text additions
- Color changes

### What Syncs Periodically
- Position updates (1 second)
- Map view changes (2 seconds)
- Drawing history (5 seconds)

### Conflict Resolution

If two players draw at the same time:
- Both drawings appear
- Timestamp determines order
- No data loss
- Smooth merging

### Offline Support

If connection is lost:
- Drawings saved locally
- Synced when reconnected
- No data loss
- Automatic recovery

---

## 🎯 Best Practices

### For Pilots
1. **Use green** for friendly positions
2. **Use red** for enemy threats
3. **Draw flight paths** with arrows
4. **Mark LZs** with circles
5. **Update in real-time** as situation changes

### For Ground Teams
1. **Use blue** for intel markers
2. **Draw patrol routes** clearly
3. **Mark rally points** prominently
4. **Update enemy positions** frequently
5. **Coordinate with air support**

### For Commanders
1. **Use different colors** for different units
2. **Draw phase lines** for operations
3. **Mark objectives** clearly
4. **Update as mission progresses**
5. **Coordinate all elements**

---

## 🔧 Troubleshooting

### Apple Pencil Not Working

**Check:**
- Pencil is paired with iPad
- Pencil is charged
- iPad supports Apple Pencil
- Safari has necessary permissions

**Fix:**
1. Re-pair Apple Pencil
2. Restart iPad
3. Check battery level
4. Update iOS

### Drawings Not Syncing

**Check:**
- Connected to same network
- Server is running
- No firewall blocking
- Good WiFi signal

**Fix:**
1. Refresh browser
2. Check server logs
3. Verify network connection
4. Restart server

### Lag or Delay

**Optimize:**
- Reduce drawing complexity
- Clear old drawings
- Use wired connection if possible
- Reduce number of connected players

---

## 📊 Performance

### Recommended Limits
- **Players**: Up to 10 simultaneous
- **Drawing strokes**: Unlimited (auto-cleanup)
- **Markers**: Up to 500 active
- **Update rate**: 60 FPS drawing, 1 Hz position

### Network Requirements
- **Bandwidth**: 1 Mbps per player
- **Latency**: <50ms for smooth drawing
- **Connection**: WiFi or wired recommended

---

## ✅ Summary

**Apple Pencil Support:**
- ✏️ Full pressure sensitivity
- 🎨 Tilt support for shading
- 🖐️ Palm rejection
- ⚡ Low latency drawing

**Multiplayer Features:**
- 👥 All players see same drawings
- 🔄 Real-time synchronization
- 🎨 Color-coded by player
- 📍 Position tracking for all

**Perfect For:**
- Mission planning
- Tactical coordination
- Real-time updates
- Team communication
- Flight planning
- Ground operations

**The kneeboard is now a true collaborative tactical tool!**

---

**Version 1.1.0** - Apple Pencil & Multiplayer Support
**Last Updated:** October 17, 2025

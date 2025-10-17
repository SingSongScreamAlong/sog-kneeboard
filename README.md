# SOG Kneeboard - Vietnam War Tactical Interface

Real-time tactical kneeboard for Arma 3 S.O.G. Prairie Fire with iPad integration and freehand drawing capabilities.

## 🚁 Features

- **Map-focused tactical interface** with Vietnam War era aesthetics
- **Freehand drawing system** with pencil, pen, marker, and eraser tools
- **Apple Pencil support** with pressure sensitivity and palm rejection ✨ NEW
- **Real-time multiplayer** - All players see drawings instantly ✨ NEW
- **Real-time position tracking** via Arma 3 mod integration
- **iPad-optimized touch controls** (1-finger draw, 2-finger pan/zoom)
- **Bidirectional marker sync** between kneeboard and in-game
- **Multi-platform support** (Windows PC + iPad/tablet)
- **WebSocket synchronization** for collaborative mission planning ✨ NEW

## 📦 Installation

### Prerequisites
- **Windows PC** with Arma 3 and S.O.G. Prairie Fire DLC
- **Node.js** installed on PC
- **iPad/tablet** on same WiFi network (optional)

### 1. Server Setup (PC)
```bash
# Clone repository
git clone https://github.com/SingSongScreamAlong/sog-kneeboard.git
cd sog-kneeboard

# Install dependencies
npm install

# Start server
npm start
```

### 2. Arma 3 Mod Installation
1. Copy `@SOG_Kneeboard` folder to your Arma 3 directory
2. Enable mod in Arma 3 launcher
3. Launch Arma 3 with S.O.G. Prairie Fire

### 3. iPad Access
1. Connect iPad to same WiFi as PC
2. Open Safari: `http://YOUR-PC-IP:31337`
3. Start using the tactical kneeboard!

## 🎮 Usage

### Drawing Tools
- **Field Pencil** (default) - Handwriting mode
- **Tactical Pen** - Precise lines
- **Map Marker** - Bold markings  
- **Field Eraser** - Remove drawings

### Controls
- **1 finger**: Draw/write
- **2 fingers**: Pan and zoom map
- **T key**: Toggle tools menu
- **1-4 keys**: Quick tool selection
- **M key**: Simulate movement (testing)

### Marker System
- Click map to place tactical markers
- Markers sync to `%USERPROFILE%/Documents/Arma 3/sog_ipad_inbox.json`
- Arma 3 mod reads markers and creates them in-game

## 🛠️ Technical Details

### Server
- **Node.js + Express** backend
- **Port 31337** (configurable)
- **Token-based security**
- **Atomic file operations**

### Frontend
- **Leaflet.js** mapping with CRS.Simple
- **HTML5 Canvas** for drawing
- **Multi-touch gesture support**
- **Responsive design** for tablets

### Arma 3 Integration
- **Client-side mod** (works on any server)
- **Real-time position updates**
- **Automatic map detection**
- **SQF scripting** for game integration

## 📁 File Structure

```
sog-kneeboard/
├── server.js              # Express server
├── package.json           # Dependencies
├── .env                   # Configuration
├── public/                # Web interface
│   ├── index.html        # Main interface
│   ├── css/style.css     # Vietnam era styling
│   └── js/app.js         # Core functionality
└── @SOG_Kneeboard/       # Arma 3 mod
    ├── mod.cpp           # Mod metadata
    ├── addons/           # Addon files
    └── scripts/          # SQF scripts
```

## 🔧 Configuration

### Environment Variables (.env)
```
TOKEN=sog-kneeboard-secure-token-2024
PORT=31337
INBOX_PATH=%USERPROFILE%/Documents/Arma 3/sog_ipad_inbox.json
```

### Supported Maps
- **Khe Sanh** (2048x2048)
- **Cam Lao Nam** (5120x5120)
- **The Bra** (1024x1024)
- **Generic map support**

## 🚨 Troubleshooting

### Can't Connect from iPad?
- Check PC and iPad on same WiFi
- Verify Windows Firewall allows port 31337
- Try: `http://localhost:31337` on PC first

### No Position Updates?
- Ensure Arma 3 mod is loaded
- Check in-game chat for connection messages
- Verify S.O.G. Prairie Fire is running

### Markers Not Syncing?
- Check file exists: `%USERPROFILE%/Documents/Arma 3/sog_ipad_inbox.json`
- Ensure proper callsign entered
- Markers sync every 5 seconds

## 📜 License

Open source - modify and distribute freely for non-commercial use.

## 🚀 Quick Start

### Start Everything at Once
```bash
npm run all
```
This starts both the server and bridge tool simultaneously.

### Or Start Individually
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Start bridge tool
npm run bridge
```

### Access Kneeboard
- **PC**: `http://localhost:31337`
- **iPad**: `http://YOUR-PC-IP:31337`

## 📚 Additional Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete deployment and setup instructions
- **[@SOG_Kneeboard/BUILD_INSTRUCTIONS.md](@SOG_Kneeboard/BUILD_INSTRUCTIONS.md)** - Arma 3 mod building guide
- **[@SOG_Kneeboard/INTEGRATION_GUIDE.md](@SOG_Kneeboard/INTEGRATION_GUIDE.md)** - HTTP integration options

---

**Built for Vietnam War simulation community**  
**Version 1.0.0 - Fully Operational** 🚁✅
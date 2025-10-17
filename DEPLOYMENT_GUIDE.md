# SOG Kneeboard - Complete Deployment Guide

## Quick Start (5 Minutes)

### 1. Server Setup
```bash
# Install dependencies (already done if you ran npm install)
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env if needed (default values work for most setups)

# Start the server
npm start
```

Server will run on `http://localhost:31337`

### 2. Start Bridge Tool
```bash
# In a new terminal
node bridge.js
```

The bridge tool connects Arma 3 to the server.

### 3. Access Kneeboard
- **On PC**: Open browser to `http://localhost:31337`
- **On iPad**: Open Safari to `http://YOUR-PC-IP:31337`

### 4. Install Arma 3 Mod (Optional)
For real-time position tracking from the game:
1. Copy `@SOG_Kneeboard` folder to Arma 3 directory
2. Enable mod in Arma 3 launcher
3. Launch Arma 3

## Detailed Setup

### Prerequisites
- **Node.js** v14 or higher
- **Windows PC** (for Arma 3 integration)
- **Arma 3** with S.O.G. Prairie Fire DLC (optional)
- **iPad/Tablet** on same WiFi (optional)

### Server Configuration

**Environment Variables** (`.env`):
```env
TOKEN=sog-kneeboard-secure-token-2024
PORT=31337
INBOX_PATH=%USERPROFILE%/Documents/Arma 3/sog_ipad_inbox.json
```

**Custom Configuration**:
- Change `TOKEN` for security
- Change `PORT` if 31337 is in use
- Adjust `INBOX_PATH` for custom Arma 3 location

### Network Setup

#### For iPad Access

1. **Find PC IP Address**:
   ```bash
   # Windows
   ipconfig
   
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   ```

2. **Configure Windows Firewall**:
   - Open Windows Defender Firewall
   - Click "Advanced settings"
   - Click "Inbound Rules" → "New Rule"
   - Select "Port" → Next
   - Enter port `31337` → Next
   - Allow the connection → Next
   - Apply to all profiles → Next
   - Name: "SOG Kneeboard" → Finish

3. **Connect from iPad**:
   - Ensure iPad is on same WiFi network
   - Open Safari
   - Navigate to `http://YOUR-PC-IP:31337`
   - Add to Home Screen for app-like experience

### Arma 3 Integration

#### Option A: Without Building (Development Mode)

1. Copy `@SOG_Kneeboard` to Arma 3 directory
2. Launch Arma 3 with parameters:
   ```
   -filePatching -mod=@SOG_Kneeboard
   ```

#### Option B: Build PBO (Production)

1. Install **Arma 3 Tools** from Steam
2. Open **Addon Builder**
3. Build `@SOG_Kneeboard/addons` folder
4. Copy built mod to Arma 3 directory
5. Enable in launcher

See `@SOG_Kneeboard/BUILD_INSTRUCTIONS.md` for details.

### File-Based Communication

The mod uses file-based communication with the bridge tool:

**Files in** `%USERPROFILE%\Documents\Arma 3\`:
- `sog_position.json` - Player position (written by mod)
- `sog_worldmeta.json` - Map info (written by mod)
- `sog_ipad_inbox.json` - Markers (written by server, read by mod)

**Bridge tool** (`bridge.js`):
- Monitors position and metadata files
- Sends updates to server via HTTP
- Runs continuously in background

## Running Everything

### Terminal 1: Server
```bash
cd /path/to/sog-kneeboard
npm start
```

### Terminal 2: Bridge Tool
```bash
cd /path/to/sog-kneeboard
node bridge.js
```

### Terminal 3: Development (Optional)
```bash
cd /path/to/sog-kneeboard
npm run dev  # Auto-restart on changes
```

## Testing Without Arma 3

You can test the kneeboard without the game:

### 1. Start Server and Bridge
```bash
npm start
# In another terminal:
node bridge.js
```

### 2. Simulate Position Updates
The bridge tool creates an example position file. Edit it to simulate movement:

**Edit** `%USERPROFILE%\Documents\Arma 3\sog_position.json`:
```json
{
  "worldPos": [1500, 2000],
  "heading": 90,
  "playerName": "TEST_PILOT",
  "vehicleName": "UH-1H Huey",
  "timestamp": 1234567890
}
```

Save the file and watch the bridge tool send updates!

### 3. Test Marker Creation
Open kneeboard in browser:
1. Enter a callsign (e.g., "ALPHA-1")
2. Click on the map
3. Enter marker text
4. Click "ADD MARKER"

Check `%USERPROFILE%\Documents\Arma 3\sog_ipad_inbox.json` to see the marker data.

## Production Deployment

### For Personal Use
1. Run server and bridge on your gaming PC
2. Access from iPad on same network
3. Keep terminals running while playing

### For Team/Server Use
1. Deploy server on dedicated machine
2. Configure firewall for team access
3. Share server URL with team members
4. Each player runs bridge tool locally (if using Arma 3 integration)

### As a Service (Windows)

Use **NSSM** (Non-Sucking Service Manager) to run as Windows service:

```bash
# Install NSSM
choco install nssm

# Create server service
nssm install SOGKneeboardServer "C:\Program Files\nodejs\node.exe" "C:\path\to\sog-kneeboard\server.js"

# Create bridge service
nssm install SOGKneeboardBridge "C:\Program Files\nodejs\node.exe" "C:\path\to\sog-kneeboard\bridge.js"

# Start services
nssm start SOGKneeboardServer
nssm start SOGKneeboardBridge
```

## Troubleshooting

### Server won't start
- Check if port 31337 is available: `netstat -an | findstr 31337`
- Verify Node.js is installed: `node --version`
- Check for errors in console output

### Can't connect from iPad
- Verify PC and iPad on same WiFi
- Check Windows Firewall allows port 31337
- Try accessing from PC first: `http://localhost:31337`
- Ping PC from iPad to verify network connectivity

### No position updates
- Ensure bridge tool is running
- Check if position file exists and is being updated
- Verify Arma 3 mod is loaded (check in-game chat)
- Check bridge tool console for errors

### Markers not syncing
- Verify inbox file path is correct
- Check file permissions
- Ensure callsign is entered in kneeboard
- Check server logs for marker creation

### High CPU/Memory usage
- Increase update intervals in mod configuration
- Reduce marker history limit
- Check for file I/O bottlenecks

## Performance Optimization

### Server
- Use PM2 for production: `pm2 start server.js`
- Enable clustering for multiple cores
- Use Redis for marker queue (future enhancement)

### Bridge Tool
- Adjust `CHECK_INTERVAL` in bridge.js (default: 1000ms)
- Use file watching instead of polling (future enhancement)
- Batch updates for better performance

### Arma 3 Mod
- Adjust update intervals in `fn_init.sqf`
- Reduce marker history limit
- Disable tracking when not needed

## Security Best Practices

1. **Change default token** in `.env`
2. **Use HTTPS** for internet access (requires reverse proxy)
3. **Limit network access** to trusted devices
4. **Don't expose to internet** unless necessary
5. **Regular updates** - check GitHub for updates

## Backup and Recovery

### Backup Important Files
- `.env` - Configuration
- `%USERPROFILE%\Documents\Arma 3\sog_*.json` - Game data
- Custom modifications to scripts

### Recovery
- Reinstall dependencies: `npm install`
- Restore `.env` configuration
- Restart services

## Updates and Maintenance

### Updating the Server
```bash
git pull origin main
npm install
npm start
```

### Updating the Mod
1. Download latest `@SOG_Kneeboard` folder
2. Replace in Arma 3 directory
3. Rebuild PBO if using production mode
4. Restart Arma 3

## Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check README and guides
- **Community**: Join Discord/forums (if available)

## Next Steps

1. ✅ Complete this deployment guide
2. ✅ Test server locally
3. ✅ Test iPad connectivity
4. ✅ Install Arma 3 mod
5. ✅ Test end-to-end integration
6. 🎮 Enjoy tactical operations!

---

**Version 1.0.0** - Ready for Vietnam! 🚁

**Questions?** Open an issue on GitHub

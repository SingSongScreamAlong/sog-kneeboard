# SOG Kneeboard - Windows PC Setup Guide

## 🎯 Complete Setup for Windows PC with Arma 3

This guide walks you through setting up the SOG Kneeboard on your Windows gaming PC with Arma 3 integration.

---

## 📋 Prerequisites

### Required Software
- ✅ **Windows 10/11** (64-bit)
- ✅ **Node.js** v14 or higher - [Download](https://nodejs.org/)
- ✅ **Git** (optional, for cloning) - [Download](https://git-scm.com/)
- ✅ **Arma 3** with S.O.G. Prairie Fire DLC
- ✅ **Arma 3 Tools** (from Steam, for building PBO)

### Optional
- **iPad/Tablet** on same WiFi network
- **Text editor** (VS Code, Notepad++, etc.)

---

## 🚀 Step-by-Step Installation

### Step 1: Install Node.js

1. Download Node.js from https://nodejs.org/
2. Run installer (use default settings)
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### Step 2: Get the Project

#### Option A: Clone from GitHub (Recommended)
```cmd
cd C:\Users\YourUsername\Documents
git clone https://github.com/SingSongScreamAlong/sog-kneeboard.git
cd sog-kneeboard
```

#### Option B: Download ZIP
1. Go to https://github.com/SingSongScreamAlong/sog-kneeboard
2. Click "Code" → "Download ZIP"
3. Extract to `C:\Users\YourUsername\Documents\sog-kneeboard`
4. Open Command Prompt in that folder

### Step 3: Install Dependencies

```cmd
npm install
```

This installs all required packages (takes 1-2 minutes).

### Step 4: Configure Environment

1. Copy `.env.example` to `.env`:
   ```cmd
   copy .env.example .env
   ```

2. Edit `.env` (optional - defaults work fine):
   ```env
   TOKEN=sog-kneeboard-secure-token-2024
   PORT=31337
   INBOX_PATH=%USERPROFILE%/Documents/Arma 3/sog_ipad_inbox.json
   ```

### Step 5: Configure Windows Firewall

**For iPad access, you MUST allow port 31337:**

1. Open **Windows Defender Firewall with Advanced Security**
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → Next
4. Enter port **31337** → Next
5. **Allow the connection** → Next
6. Check all profiles (Domain, Private, Public) → Next
7. Name: **SOG Kneeboard** → Finish

### Step 6: Find Your PC's IP Address

You'll need this for iPad access:

```cmd
ipconfig
```

Look for **IPv4 Address** under your active network adapter (e.g., `192.168.1.100`)

---

## 🎮 Arma 3 Mod Installation

### Step 1: Locate Arma 3 Directory

Default location:
```
C:\Program Files (x86)\Steam\steamapps\common\Arma 3\
```

### Step 2: Copy Mod Files

Copy the entire `@SOG_Kneeboard` folder to your Arma 3 directory:

```cmd
xcopy /E /I "C:\Users\YourUsername\Documents\sog-kneeboard\@SOG_Kneeboard" "C:\Program Files (x86)\Steam\steamapps\common\Arma 3\@SOG_Kneeboard"
```

### Step 3: Enable Mod in Arma 3 Launcher

1. Open **Arma 3 Launcher**
2. Go to **MODS** tab
3. Find **SOG Kneeboard Integration**
4. Check the box to enable it
5. Click **PLAY**

### Step 4: Verify Mod is Loaded

When you join a server or start single-player, you should see:
```
SOG Kneeboard: Integration initialized
SOG Kneeboard: Tracking [YourName] on [MapName]
```

---

## 🖥️ Running the Kneeboard

### Option 1: Start Everything at Once (Recommended)

Open Command Prompt in the project folder:
```cmd
npm run all
```

This starts both the server and bridge tool.

### Option 2: Start Components Separately

**Terminal 1 - Server:**
```cmd
npm start
```

**Terminal 2 - Bridge Tool:**
```cmd
npm run bridge
```

### Verify It's Running

You should see:
```
SOG Kneeboard server running on http://localhost:31337
Token: sog-kneeboard-secure-token-2024
Inbox path: C:\Users\YourUsername\Documents\Arma 3\sog_ipad_inbox.json
```

---

## 📱 Access the Kneeboard

### On Your PC
Open browser to: **http://localhost:31337**

### On iPad/Tablet
1. Ensure iPad is on **same WiFi** as PC
2. Open Safari
3. Navigate to: **http://YOUR-PC-IP:31337** (e.g., `http://192.168.1.100:31337`)
4. **Add to Home Screen** for app-like experience:
   - Tap Share button
   - Select "Add to Home Screen"
   - Name it "SOG Kneeboard"

---

## 🎯 Complete Workflow

### 1. Start the Kneeboard System

```cmd
cd C:\Users\YourUsername\Documents\sog-kneeboard
npm run all
```

Leave this running in the background.

### 2. Launch Arma 3

1. Start Arma 3 with SOG Kneeboard mod enabled
2. Join a server or start single-player
3. Look for initialization messages in chat

### 3. Open Kneeboard Interface

- **PC**: http://localhost:31337
- **iPad**: http://YOUR-PC-IP:31337

### 4. Use the Kneeboard

1. **Enter your callsign** (e.g., "ALPHA-1")
2. **View your position** on the map (updates in real-time)
3. **Draw on the map** with tactical tools
4. **Place markers** that sync to Arma 3
5. **Track your movement** as you play

---

## 🔧 Troubleshooting

### Server Won't Start

**Error: Port 31337 already in use**
```cmd
netstat -ano | findstr :31337
taskkill /PID [PID_NUMBER] /F
```

**Error: Cannot find module**
```cmd
npm install
```

### Can't Connect from iPad

1. **Check firewall** - Ensure port 31337 is allowed
2. **Verify same WiFi** - PC and iPad must be on same network
3. **Test on PC first** - Try http://localhost:31337
4. **Ping test**:
   ```cmd
   ping YOUR-PC-IP
   ```

### No Position Updates in Kneeboard

1. **Check mod is loaded** - Look for chat messages in Arma 3
2. **Verify bridge tool is running** - Should show position updates
3. **Check file path** - Ensure Documents\Arma 3 folder exists
4. **Restart bridge tool**:
   ```cmd
   Ctrl+C (to stop)
   npm run bridge
   ```

### Markers Not Appearing in Arma 3

1. **Enter callsign** in kneeboard interface
2. **Check inbox file** exists:
   ```
   %USERPROFILE%\Documents\Arma 3\sog_ipad_inbox.json
   ```
3. **Verify marker scope** - Set to "GLOBAL" for testing
4. **Wait 5 seconds** - Markers sync every 5 seconds

### Mod Not Loading in Arma 3

1. **Verify mod folder** is in Arma 3 directory
2. **Check mod is enabled** in launcher
3. **Look for errors** in Arma 3 RPT log:
   ```
   %LOCALAPPDATA%\Arma 3\
   ```
4. **Try development mode**:
   - Add launch parameter: `-filePatching`
   - This allows testing without building PBO

---

## 🏗️ Building the Mod (Optional)

For production use, build the mod into PBO format:

### Using Addon Builder (GUI)

1. Open **Arma 3 Tools** from Steam
2. Launch **Addon Builder**
3. **Source Directory**: `C:\...\sog-kneeboard\@SOG_Kneeboard\addons`
4. **Destination Directory**: Same as source
5. **PBO Name Prefix**: `sog_kneeboard`
6. Click **Pack**

### Using Command Line

```cmd
cd "C:\Program Files (x86)\Steam\steamapps\common\Arma 3 Tools\AddonBuilder"
AddonBuilder.exe "C:\Users\YourUsername\Documents\sog-kneeboard\@SOG_Kneeboard\addons" "C:\Users\YourUsername\Documents\sog-kneeboard\@SOG_Kneeboard\addons" -prefix=sog_kneeboard
```

After building, you'll have `sog_kneeboard.pbo` in the addons folder.

---

## 🚀 Running as Windows Service (Advanced)

To run the kneeboard automatically on startup:

### Using NSSM (Non-Sucking Service Manager)

1. **Install NSSM**:
   ```cmd
   choco install nssm
   ```
   Or download from: https://nssm.cc/

2. **Create Server Service**:
   ```cmd
   nssm install SOGKneeboardServer "C:\Program Files\nodejs\node.exe" "C:\Users\YourUsername\Documents\sog-kneeboard\server.js"
   nssm set SOGKneeboardServer AppDirectory "C:\Users\YourUsername\Documents\sog-kneeboard"
   ```

3. **Create Bridge Service**:
   ```cmd
   nssm install SOGKneeboardBridge "C:\Program Files\nodejs\node.exe" "C:\Users\YourUsername\Documents\sog-kneeboard\bridge.js"
   nssm set SOGKneeboardBridge AppDirectory "C:\Users\YourUsername\Documents\sog-kneeboard"
   ```

4. **Start Services**:
   ```cmd
   nssm start SOGKneeboardServer
   nssm start SOGKneeboardBridge
   ```

Now the kneeboard will start automatically with Windows!

---

## 📊 Performance Tips

### Optimize Update Rates

Edit `@SOG_Kneeboard\scripts\fn_init.sqf`:

```sqf
SOG_KB_updateInterval = 2; // Change from 1 to 2 seconds
SOG_KB_markerInterval = 10; // Change from 5 to 10 seconds
```

### Reduce CPU Usage

In `bridge.js`, change:
```javascript
const CHECK_INTERVAL = 2000; // Change from 1000 to 2000ms
```

### Close Unused Applications

- Close browser tabs you're not using
- Disable unnecessary background apps
- Use Task Manager to monitor resource usage

---

## 🎮 Gameplay Tips

### Best Practices

1. **Enter callsign first** - Required for marker sync
2. **Use descriptive markers** - Help your team understand
3. **Choose correct scope**:
   - **SELF** - Only you see it
   - **SQUAD** - Your group sees it
   - **BATTALION** - Your side sees it
   - **ALL** - Everyone sees it
4. **Draw on map** - Use tactical tools for planning
5. **Track position** - Keep kneeboard open on second screen/iPad

### Tactical Uses

- **Mark enemy positions** - Red markers for hostiles
- **Plan routes** - Draw paths on map
- **Coordinate with team** - Share intel via markers
- **Track objectives** - Mark LZs, DZs, checkpoints
- **Document mission** - Keep visual record

---

## 📁 File Locations Reference

```
C:\Users\YourUsername\
├── Documents\
│   ├── Arma 3\
│   │   ├── sog_position.json      # Position data (written by mod)
│   │   ├── sog_worldmeta.json     # Map info (written by mod)
│   │   └── sog_ipad_inbox.json    # Markers (written by server)
│   └── sog-kneeboard\
│       ├── server.js               # Server
│       ├── bridge.js               # Bridge tool
│       ├── .env                    # Configuration
│       └── @SOG_Kneeboard\         # Arma 3 mod
└── Program Files (x86)\
    └── Steam\
        └── steamapps\
            └── common\
                └── Arma 3\
                    └── @SOG_Kneeboard\  # Installed mod
```

---

## 🆘 Getting Help

### Check Logs

**Server Log**: In Command Prompt where server is running

**Bridge Log**: In Command Prompt where bridge is running

**Arma 3 Log**:
```
%LOCALAPPDATA%\Arma 3\
```
Look for latest `.rpt` file

### Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | Kill process using port 31337 |
| Can't connect | Check firewall, verify same WiFi |
| No position | Verify mod loaded, check bridge |
| No markers | Enter callsign, check scope |
| Mod won't load | Enable in launcher, check RPT log |

### Community Support

- **GitHub Issues**: https://github.com/SingSongScreamAlong/sog-kneeboard/issues
- **Documentation**: Check other .md files in project

---

## ✅ Quick Reference Commands

```cmd
# Install dependencies
npm install

# Start everything
npm run all

# Start server only
npm start

# Start bridge only
npm run bridge

# Find your IP
ipconfig

# Check what's using port 31337
netstat -ano | findstr :31337

# Kill process on port
taskkill /PID [PID] /F

# Copy mod to Arma 3
xcopy /E /I "@SOG_Kneeboard" "C:\Program Files (x86)\Steam\steamapps\common\Arma 3\@SOG_Kneeboard"
```

---

## 🎖️ You're Ready!

Follow these steps and you'll have a fully operational tactical kneeboard for your Vietnam War operations.

**Good luck out there, pilot!** 🚁

---

**Version 1.0.0** - Windows PC Edition  
**Last Updated:** October 17, 2025

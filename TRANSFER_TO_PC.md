# Transfer SOG Kneeboard to Windows PC

## 🎯 Quick Transfer Guide

### Option 1: GitHub (Recommended)

The project has been committed to the parent git repository. To push to the SOG Kneeboard GitHub:

#### Step 1: Initialize Git in Project Folder

```bash
cd /Users/conradweeden/sog-kneeboard
git init
git remote add origin https://github.com/SingSongScreamAlong/sog-kneeboard.git
```

#### Step 2: Add and Commit Files

```bash
git add .
git commit -m "Complete SOG Kneeboard implementation with bridge tool and full Arma 3 mod"
```

#### Step 3: Push to GitHub

```bash
# If this is a new repo
git branch -M main
git push -u origin main

# Or if updating existing repo
git pull origin main --rebase
git push origin main
```

### Option 2: Direct File Transfer

If you prefer not to use GitHub:

#### On Mac:

1. **Compress the project**:
   ```bash
   cd /Users/conradweeden
   zip -r sog-kneeboard-complete.zip sog-kneeboard/ -x "*/node_modules/*" "*/.git/*"
   ```

2. **Transfer via**:
   - USB drive
   - Cloud storage (Dropbox, Google Drive, OneDrive)
   - Network share
   - Email (if small enough)

#### On Windows PC:

1. **Extract the ZIP** to:
   ```
   C:\Users\YourUsername\Documents\sog-kneeboard\
   ```

2. **Install dependencies**:
   ```cmd
   cd C:\Users\YourUsername\Documents\sog-kneeboard
   npm install
   ```

3. **Follow WINDOWS_PC_SETUP.md** for complete setup

---

## 📦 What's Included

When you transfer, you'll get:

### Core Files
- ✅ `server.js` - Express server
- ✅ `bridge.js` - Bridge tool for Arma 3
- ✅ `package.json` - Dependencies and scripts
- ✅ `.env.example` - Configuration template

### Web Interface
- ✅ `public/index.html` - Main interface
- ✅ `public/css/style.css` - Styling
- ✅ `public/js/app.js` - Frontend logic

### Arma 3 Mod
- ✅ `@SOG_Kneeboard/mod.cpp` - Mod metadata
- ✅ `@SOG_Kneeboard/addons/config.cpp` - Addon config
- ✅ `@SOG_Kneeboard/scripts/*.sqf` - All 6 SQF scripts

### Documentation
- ✅ `README.md` - Main documentation
- ✅ `WINDOWS_PC_SETUP.md` - Windows setup guide
- ✅ `DEPLOYMENT_GUIDE.md` - Deployment instructions
- ✅ `BUILD_INSTRUCTIONS.md` - PBO building guide
- ✅ `INTEGRATION_GUIDE.md` - Integration options
- ✅ `PROJECT_STATUS.md` - Completion status

### NOT Included (by design)
- ❌ `node_modules/` - Too large, install with `npm install`
- ❌ `.env` - Contains sensitive config, use `.env.example`
- ❌ `.git/` - Git history (unless using GitHub method)

---

## 🖥️ On Your Windows PC

### Step 1: Install Prerequisites

1. **Node.js**: https://nodejs.org/ (LTS version)
2. **Git** (optional): https://git-scm.com/

### Step 2: Get the Project

#### If Using GitHub:
```cmd
cd C:\Users\YourUsername\Documents
git clone https://github.com/SingSongScreamAlong/sog-kneeboard.git
cd sog-kneeboard
```

#### If Using ZIP:
1. Extract to `C:\Users\YourUsername\Documents\sog-kneeboard`
2. Open Command Prompt in that folder

### Step 3: Install Dependencies

```cmd
npm install
```

### Step 4: Configure

```cmd
copy .env.example .env
```

Edit `.env` if needed (defaults work fine).

### Step 5: Start the System

```cmd
npm run all
```

This starts both server and bridge tool!

### Step 6: Install Arma 3 Mod

1. Copy `@SOG_Kneeboard` to Arma 3 directory:
   ```cmd
   xcopy /E /I "@SOG_Kneeboard" "C:\Program Files (x86)\Steam\steamapps\common\Arma 3\@SOG_Kneeboard"
   ```

2. Enable mod in Arma 3 launcher

3. Launch Arma 3

### Step 7: Access Kneeboard

- **PC**: http://localhost:31337
- **iPad**: http://YOUR-PC-IP:31337

---

## 🔥 Quick Start Commands (Windows)

```cmd
# Navigate to project
cd C:\Users\YourUsername\Documents\sog-kneeboard

# Install dependencies (first time only)
npm install

# Configure (first time only)
copy .env.example .env

# Start everything
npm run all

# Open in browser
start http://localhost:31337
```

---

## 📱 iPad Setup

1. **Find PC IP**:
   ```cmd
   ipconfig
   ```
   Look for IPv4 Address (e.g., 192.168.1.100)

2. **Configure Firewall**:
   - Windows Defender Firewall → Advanced Settings
   - Inbound Rules → New Rule
   - Port 31337 → Allow

3. **Connect iPad**:
   - Same WiFi as PC
   - Safari → http://YOUR-PC-IP:31337
   - Add to Home Screen

---

## 🎮 Arma 3 Integration

### Quick Mod Install

```cmd
xcopy /E /I "C:\Users\YourUsername\Documents\sog-kneeboard\@SOG_Kneeboard" "C:\Program Files (x86)\Steam\steamapps\common\Arma 3\@SOG_Kneeboard"
```

### Enable in Launcher

1. Open Arma 3 Launcher
2. MODS tab
3. Check "SOG Kneeboard Integration"
4. PLAY

### Verify It Works

In-game chat should show:
```
SOG Kneeboard: Integration initialized
SOG Kneeboard: Tracking [YourName] on [MapName]
```

---

## 🆘 Troubleshooting

### Can't Install npm Packages

**Error: npm not found**
- Install Node.js from https://nodejs.org/
- Restart Command Prompt

**Error: Permission denied**
- Run Command Prompt as Administrator

### Port 31337 Already in Use

```cmd
netstat -ano | findstr :31337
taskkill /PID [PID] /F
```

### Firewall Blocking

- Windows Defender Firewall → Allow an app
- Add Node.js
- Allow on Private and Public networks

### Can't Connect from iPad

1. Check firewall allows port 31337
2. Verify same WiFi network
3. Try http://localhost:31337 on PC first
4. Ping PC from iPad

---

## ✅ Verification Checklist

After setup on Windows PC:

- [ ] Node.js installed (`node --version`)
- [ ] Project files extracted/cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created
- [ ] Server starts (`npm start`)
- [ ] Bridge starts (`npm run bridge`)
- [ ] Web interface loads (http://localhost:31337)
- [ ] Firewall configured (for iPad)
- [ ] Mod copied to Arma 3 directory
- [ ] Mod enabled in launcher
- [ ] Arma 3 shows initialization messages

---

## 📚 Next Steps

1. ✅ Transfer project to PC
2. ✅ Install dependencies
3. ✅ Start server and bridge
4. ✅ Test web interface
5. ✅ Configure firewall (if using iPad)
6. ✅ Install Arma 3 mod
7. ✅ Test in-game integration
8. 🎮 Enjoy tactical operations!

---

## 📖 Full Documentation

Once on your PC, read these guides:

- **WINDOWS_PC_SETUP.md** - Detailed Windows setup
- **DEPLOYMENT_GUIDE.md** - Complete deployment guide
- **BUILD_INSTRUCTIONS.md** - Building PBO files
- **INTEGRATION_GUIDE.md** - Advanced integration
- **README.md** - Feature overview

---

**🎖️ Ready for deployment on Windows!** 🚁

Follow these steps and you'll have a fully operational tactical kneeboard for your Vietnam War operations in Arma 3.

**Good hunting, pilot!**

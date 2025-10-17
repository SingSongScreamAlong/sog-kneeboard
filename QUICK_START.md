# SOG Kneeboard - Quick Start Guide

## 🚀 Push to GitHub NOW

```bash
cd /Users/conradweeden/sog-kneeboard
./push-to-github.sh
```

Or manually:
```bash
cd /Users/conradweeden/sog-kneeboard
git init
git remote add origin https://github.com/SingSongScreamAlong/sog-kneeboard.git
git add .
git commit -m "Complete SOG Kneeboard implementation"
git branch -M main
git push -u origin main
```

---

## 💻 On Windows PC

### 1. Clone
```cmd
cd C:\Users\YourUsername\Documents
git clone https://github.com/SingSongScreamAlong/sog-kneeboard.git
cd sog-kneeboard
```

### 2. Install
```cmd
npm install
copy .env.example .env
```

### 3. Run
```cmd
npm run all
```

### 4. Install Arma 3 Mod
```cmd
xcopy /E /I "@SOG_Kneeboard" "C:\Program Files (x86)\Steam\steamapps\common\Arma 3\@SOG_Kneeboard"
```

### 5. Enable Mod
- Arma 3 Launcher → MODS → Enable "SOG Kneeboard Integration"

### 6. Play
- Launch Arma 3
- Open http://localhost:31337

---

## 📱 iPad Setup (Optional)

### Find PC IP:
```cmd
ipconfig
```

### Configure Firewall:
- Windows Defender Firewall → Advanced Settings
- Inbound Rules → New Rule → Port 31337 → Allow

### Connect:
- iPad Safari → http://YOUR-PC-IP:31337
- Add to Home Screen

---

## ✅ That's It!

**Full docs:** WINDOWS_PC_SETUP.md

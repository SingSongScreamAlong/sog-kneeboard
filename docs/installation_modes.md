# Installation Modes

> **Version:** 1.0  
> **Principle:** Users never install more than they need.

---

## Mode 1: Driver-Only

**Use case:** Individual driver tracking their own data.

### Required Components
| Component | Source | License |
|-----------|--------|---------|
| Relay Agent | Download | Free |
| BlackBox (web) | Browser | Free |

### Optional Components
| Component | Requires |
|-----------|----------|
| Voice calls | Free tier |
| Replay | Free tier |

### Installation Steps
1. Create account (Free plan)
2. Download Relay Agent
3. Enter API key
4. Open BlackBox in browser
5. Launch iRacing → data flows

### Dormant Features
- Team surfaces
- Race Control
- Broadcast overlays
- API access

---

## Mode 2: Team + Driver

**Use case:** Racing team with multiple drivers, shared data.

### Required Components
| Component | Source | License |
|-----------|--------|---------|
| Relay Agent | Download (each driver) | Team |
| BlackBox (web) | Browser (each driver) | Team |
| Team Dashboard (web) | Browser (team manager) | Team |

### Optional Components
| Component | Requires |
|-----------|----------|
| ControlBox | Team plan |
| API access | Team plan |

### Installation Steps
1. Create organization (Team plan)
2. Invite drivers via email
3. Each driver: download Relay, enter personal API key
4. Team manager: access Team Dashboard
5. All data visible in shared context

### Dormant Features
- Race Control
- Broadcast overlays
- Public spectators

---

## Mode 3: League / Race Control

**Use case:** Organized league with stewards, penalties, incidents.

### Required Components
| Component | Source | License |
|-----------|--------|---------|
| Relay Agents | Download (all drivers) | League |
| BlackBox | Browser (drivers) | League |
| ControlBox | Browser (stewards) | League |

### Optional Components
| Component | Requires |
|-----------|----------|
| RaceBox overlays | League plan |
| API webhooks | League plan |

### Installation Steps
1. Create organization (League plan)
2. Define teams within org
3. Distribute API keys to team managers
4. Stewards access ControlBox for race control
5. Configure rulebook (optional)

### Dormant Features
- White-label branding
- SSO integration

---

## Mode 4: Broadcast / RaceBox-Only

**Use case:** Broadcaster who needs overlays, not full telemetry.

### Required Components
| Component | Source | License |
|-----------|--------|---------|
| RaceBox (web) | Browser | Broadcast |

### Optional Components
| Component | Requires |
|-----------|----------|
| Timing tower | Included |
| Battle box | Included |
| Lower thirds | Included |
| Director controls | Broadcast plan |

### Installation Steps
1. Create account (Broadcast plan)
2. Get overlay URLs from dashboard
3. Add as browser sources in OBS
4. Connect to session via session code or API

### Dormant Features
- Telemetry analysis (BlackBox)
- Race control (ControlBox)
- Replay deep-dive

---

## Mode 5: Full Stack (Internal)

**Use case:** Development, testing, internal operations.

### Required Components
All components installed and enabled.

### Installation Steps
```bash
# Clone repo
git clone <repo>

# Install dependencies
npm install

# Start services
docker-compose up -d  # DB + Redis
npm run dev           # Gateway + Dashboard
python relay_agent.py # Relay
```

### All Features Enabled
- All surfaces
- All roles
- Debug mode
- Dev auth mode

---

## Component Matrix

| Mode | Relay | BlackBox | Team | ControlBox | RaceBox |
|------|-------|----------|------|------------|---------|
| Driver-Only | ✅ | ✅ | ❌ | ❌ | ❌ |
| Team + Driver | ✅ | ✅ | ✅ | Optional | ❌ |
| League | ✅ | ✅ | ✅ | ✅ | Optional |
| Broadcast | ❌ | ❌ | ❌ | ❌ | ✅ |
| Full Stack | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## License Feature Gates

| Feature | Free | Team | League | Broadcast | Enterprise |
|---------|------|------|--------|-----------|------------|
| Relay Agent | ✅ | ✅ | ✅ | ❌ | ✅ |
| BlackBox | ✅ | ✅ | ✅ | ❌ | ✅ |
| Team Dashboard | ❌ | ✅ | ✅ | ❌ | ✅ |
| ControlBox | ❌ | ❌ | ✅ | ❌ | ✅ |
| RaceBox Overlays | ❌ | ❌ | ✅ | ✅ | ✅ |
| Voice Calls | ✅ | ✅ | ✅ | ❌ | ✅ |
| Replay | ✅ | ✅ | ✅ | ❌ | ✅ |
| API Access | ❌ | ✅ | ✅ | ✅ | ✅ |

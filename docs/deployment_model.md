# Deployment & Packaging Model

> **Version:** 1.0  
> **Status:** Week 18 - Release Candidate

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLOUD (DigitalOcean)                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Unified Gateway │  │   PostgreSQL    │  │    Redis    │ │
│  │   (Node.js)     │  │  + Timescale    │  │   (Cache)   │ │
│  └────────┬────────┘  └─────────────────┘  └─────────────┘ │
│           │                                                 │
│           │ WebSocket + REST                               │
└───────────┼─────────────────────────────────────────────────┘
            │
┌───────────┴─────────────────────────────────────────────────┐
│                      LOCAL (Driver PC)                      │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  Relay Agent    │  │         Web Browser             │  │
│  │   (Python)      │──│  BlackBox / ControlBox / RaceBox│  │
│  │  + iRacing SDK  │  │         (React SPA)             │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

| Component | Location | Technology | Distribution |
|-----------|----------|------------|--------------|
| Relay Agent | Local (Windows) | Python + PyInstaller | Downloadable EXE |
| Web App | Cloud (CDN) | React SPA | Browser access |
| Gateway | Cloud | Node.js + Express | DO App Platform |
| Database | Cloud (Managed) | PostgreSQL + Timescale | DO Managed DB |
| Redis | Cloud (Managed) | Redis | DO Managed Redis |

---

## Versioning Scheme

```
v{MAJOR}.{MINOR}.{PATCH}

MAJOR: Breaking API changes
MINOR: New features (backward compatible)
PATCH: Bug fixes
```

**Examples:**
- `v1.0.0` — Initial alpha release
- `v1.1.0` — New overlay type
- `v1.0.1` — Bug fix

---

## Version Compatibility

| Relay Version | Gateway Min | Gateway Max | Status |
|---------------|-------------|-------------|--------|
| 1.0.x | 1.0.0 | 1.x.x | Supported |
| 1.1.x | 1.0.0 | 1.x.x | Supported |

**Rules:**
- Gateway maintains backward compatibility within major version
- Relay must be upgraded for major version changes
- Web app always uses latest (auto-deployed)

---

## Upgrade Safety Rules

### Relay Agent
1. Check gateway version compatibility before upgrade
2. Download new version to separate directory
3. Verify checksum
4. Stop current relay gracefully
5. Start new version
6. Rollback if health check fails within 60s

### Gateway
1. Database migrations run in staging first
2. Production requires manual approval gate
3. Blue-green deployment via DO App Platform
4. Automatic rollback on health check failure

### Web App
1. Deployed automatically with gateway
2. Service worker handles cache invalidation
3. Users see update notification, not forced refresh

---

## Zero → Live Race Path

### Step 1: Account Setup (5 min)
1. Visit okboxbox.com
2. Create account or SSO login
3. Select plan (Free, Team, League)
4. Create organization

### Step 2: Relay Installation (10 min)
1. Download Relay Agent for Windows
2. Run installer (no admin required)
3. Enter API key from dashboard
4. Relay auto-connects and shows "Ready"

### Step 3: First Session (2 min)
1. Launch iRacing
2. Enter any session (AI race, practice, online)
3. Relay detects session → Gateway creates session
4. Open BlackBox in browser → live data appears

### Step 4: Race Day
1. Confirm relay connected (green indicator)
2. Open surfaces needed (BlackBox, RaceBox overlays)
3. Race
4. Review session afterward

**Total time to first live data: ~15 minutes**

---

## Environment Matrix

| Environment | Purpose | URL | Auto-deploy |
|-------------|---------|-----|-------------|
| Local | Development | localhost:3001 | Manual |
| Staging | Pre-production | staging.okboxbox.com | On main push |
| Production | Live users | app.okboxbox.com | On release tag |

---

## Rollback Procedures

### Gateway Rollback
```bash
# List recent deployments
doctl apps list-deployments $APP_ID

# Redeploy previous commit
git checkout $PREVIOUS_SHA
git push -f origin main
```

### Relay Rollback
1. User downloads previous version from releases page
2. Or: Restore from `relay-backup/` folder

### Database Rollback
1. Restore from DO managed backup
2. Point-in-time recovery if needed
3. See `backup_restore.md` runbook

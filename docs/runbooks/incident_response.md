# Incident Response Runbook

> **First 5 minutes are critical. Follow steps in order.**

---

## Incident: WebSocket Outage

### Symptoms
- Overlays frozen
- "Connecting..." status in overlays
- No new frames in metrics
- Driver dashboard not updating

### First 5 Minutes
1. Check server health: `curl /api/health/ready`
2. Check if relay agent is still sending: check relay agent terminal
3. Check DigitalOcean status: https://status.digitalocean.com
4. Check error logs: `doctl apps logs <app-id> --type=BUILD`

### Resolution
| Cause | Fix |
|-------|-----|
| Server crashed | Redeploy: `doctl apps create-deployment <app-id>` |
| DB connection exhausted | Check pool size, restart server |
| Memory exhausted | Restart server, review memory usage |
| Relay disconnected | Restart relay agent on driver PC |

### Post-Incident
- Review logs for root cause
- Add to incident log
- Update runbook if new failure mode

---

## Incident: Database Outage

### Symptoms
- 500 errors on API calls
- "Failed to connect to database" in logs
- Health check fails on db

### First 5 Minutes
1. Check DO Managed Database status in console
2. Check connection string is correct
3. Verify firewall rules allow server IP
4. Check disk usage on database

### Resolution
| Cause | Fix |
|-------|-----|
| Connection string wrong | Fix env var, redeploy |
| Disk full | Add disk space in DO console |
| Too many connections | Increase pool size or restart |
| DB server down | Wait for DO to restore (check status page) |

### Fallback
- If total outage, switch to demo mode for overlays
- Announce delay to viewers

---

## Incident: Relay Disconnect Storm

### Symptoms
- Multiple relays connecting/disconnecting rapidly
- High CPU on gateway
- Logs filled with connection events

### First 5 Minutes
1. Check all relay agents have correct API key
2. Check network connectivity to server
3. Verify API key not revoked

### Resolution
| Cause | Fix |
|-------|-----|
| API key rotated | Distribute new key to all relays |
| Network flapping | Wait for network to stabilize |
| Server rejecting | Check rate limits, increase if needed |

### Temporary Mitigation
- In extreme cases, set `TELEMETRY_INGEST_ENABLED=false` to reject all ingestion
- Resume after storm subsides

---

## Incident: Deploy Rollback

### When to Rollback
- New deploy causes 500 errors
- New deploy breaks overlays
- New deploy causes data corruption

### Steps
1. Identify last known good deployment:
   ```bash
   doctl apps list-deployments <app-id>
   ```

2. Note commit SHA of last good deploy

3. Git checkout that commit:
   ```bash
   git checkout <sha>
   ```

4. Force push to main (or create hotfix branch):
   ```bash
   git push -f origin main
   ```

5. Trigger deploy:
   ```bash
   doctl apps create-deployment <app-id>
   ```

6. Wait for health check to pass

### Post-Rollback
- Investigate failed deploy
- Fix issues in new PR
- Re-deploy when fixed

---

## Incident: Memory Leak / OBS Issues

### Symptoms
- OBS memory growing over time
- Overlays becoming sluggish
- Browser sources crashing

### Resolution
1. Refresh all browser sources in OBS
2. Check for `?motion=0` to disable animations
3. Reduce FPS on browser sources to 15
4. Enable "Shutdown source when not visible"
5. Restart OBS if >2GB memory usage

---

## Emergency Contacts

| Service | Where to Check |
|---------|----------------|
| DigitalOcean | https://status.digitalocean.com |
| Server Logs | `doctl apps logs <app-id>` |
| Database | DO Console → Databases |
| DNS | Cloudflare / DO DNS settings |

---

## Incident Log Template

```markdown
## Incident: [TITLE]
**Date:** YYYY-MM-DD HH:MM
**Duration:** X minutes
**Severity:** P1/P2/P3

### Timeline
- HH:MM - Issue detected
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Fix applied
- HH:MM - Verified resolved

### Root Cause
[Description]

### Resolution
[What fixed it]

### Action Items
- [ ] ...
```

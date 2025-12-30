# Race Day Checklist

> **Use this checklist before every broadcast session.**

---

## Pre-Race (1 hour before)

### Infrastructure
- [ ] Server health: `curl /api/health/ready`
- [ ] DB connection pool: check metrics for pool exhaustion
- [ ] Redis connection: `curl /api/health` → redis status
- [ ] Disk usage: <80% on DB volume

### Gateway
- [ ] Relay agent connected and sending frames
- [ ] Verify frame rate in logs: expected 60Hz from relay
- [ ] Check subscription count in metrics
- [ ] Confirm broadcast delay is set correctly

### RaceBox
- [ ] Director view opens: `/racebox/director`
- [ ] Session selector shows correct session
- [ ] Driver list populated
- [ ] Overlay URLs copied to OBS

### OBS Overlays
- [ ] Timing Tower: `/racebox/overlay/timing-tower?sessionId=...&theme=dark`
- [ ] Lower Third: `/racebox/overlay/lower-third?sessionId=...`
- [ ] Battle Box: `/racebox/overlay/battle-box?sessionId=...`
- [ ] Incident Banner: `/racebox/overlay/incident-banner?sessionId=...`
- [ ] All overlays show data (or demo mode working)

### Director Controls
- [ ] "Intro" preset works
- [ ] Feature driver → timing tower highlights
- [ ] Delay controls work (set to 30s for broadcast)
- [ ] Cue triggers work

---

## During Race

### Monitor
- Watch WebSocket connection count
- Watch frame ingestion rate
- Watch for `subscription:denied` events
- Check OBS memory usage (<1GB)

### If Issues Arise
- See incident response runbook
- Check relay agent terminal for errors
- Check server logs: `doctl apps logs <app-id> --follow`

---

## Post-Race (within 30 minutes)

- [ ] Export highlights list
- [ ] Review auto-detected highlights
- [ ] Mark key moments for social cards
- [ ] Archive session (if needed)
- [ ] Check database disk usage
- [ ] Verify replay data stored correctly

---

## Quick Commands

```bash
# Health check
curl https://your-server.com/api/health/ready

# WebSocket connections
curl https://your-server.com/api/metrics | grep ws_connections

# Recent logs
doctl apps logs <app-id> --type=BUILD --follow

# Force restart worker
doctl apps create-deployment <app-id>
```

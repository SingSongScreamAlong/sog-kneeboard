# Failure Mode Playbooks

> **Principle:** No silent failures.

---

## F01: Relay Loses Uplink

### Detection
- Gateway: no frames for 10s
- Relay: WebSocket `close` event

### Automatic Mitigation
- Gateway marks driver as "offline"
- Timing shows stale indicator
- Buffers last known state

### User-Visible Messaging
- Relay tray: "Connection lost — reconnecting..."
- BlackBox: Driver row dims, shows "Offline"

### Manual Recovery
1. Check internet connection
2. Check firewall settings
3. Restart relay agent
4. If persistent: check API key validity

---

## F02: Gateway Crashes

### Detection
- DigitalOcean health check fails
- Clients receive WebSocket close
- Uptime monitor alerts

### Automatic Mitigation
- DO App Platform auto-restarts
- Clients auto-reconnect (exponential backoff)
- Session state recovered from DB

### User-Visible Messaging
- All clients: "Reconnecting..."
- Brief gap in live data

### Manual Recovery
```bash
# Check logs
doctl apps logs $APP_ID --follow

# Force restart
doctl apps create-deployment $APP_ID

# Rollback if needed
git checkout $PREVIOUS_SHA && git push -f
```

---

## F03: Web App Disconnects

### Detection
- Client detects WebSocket close
- Heartbeat timeout (30s)

### Automatic Mitigation
- Auto-reconnect with backoff
- Show "Reconnecting..." banner
- Preserve local UI state

### User-Visible Messaging
- Banner: "Connection lost — reconnecting in X seconds"
- Data freezes but doesn't disappear

### Manual Recovery
1. Check internet connection
2. Refresh page
3. Clear browser cache if stale

---

## F04: Voice Engine Unavailable

### Detection
- TTS API returns error
- Timeout on speech synthesis

### Automatic Mitigation
- Fall back to UI-only delivery
- Log warning
- Do not retry failed engine

### User-Visible Messaging
- No voice output
- Toast: "Voice unavailable — calls shown on screen"

### Manual Recovery
1. Check TTS API status
2. Restart if local engine
3. Wait for recovery

---

## F05: Telemetry Burst Overload

### Detection
- Frame queue >10,000
- Processing latency >500ms
- Memory pressure alert

### Automatic Mitigation
- Apply backpressure to relays
- Sample frames (keep every Nth)
- Prioritize timing over full telemetry

### User-Visible Messaging
- Console warning
- Optional: "High load — some data may be delayed"

### Manual Recovery
```bash
# Enable kill switch temporarily
TELEMETRY_INGEST_ENABLED=false

# Or: reduce max rate
TELEMETRY_MAX_RATE_HZ=30
```

---

## F06: Database Unavailable

### Detection
- Connection error on query
- Health check fails

### Automatic Mitigation
- Switch to read-only mode
- Serve cached timing data
- Queue writes in memory

### User-Visible Messaging
- Banner: "Database issue — live data only"
- No replay access during outage

### Manual Recovery
1. Check DO Database status
2. Verify connection string
3. Failover to replica if available
4. Restore from backup if data loss

---

## F07: Redis Unavailable

### Detection
- Redis connection error
- Cache operations fail

### Automatic Mitigation
- Fall back to DB for all reads
- Performance degrades but continues
- Log warnings

### User-Visible Messaging
- None (transparent degradation)

### Manual Recovery
1. Check DO Redis status
2. Flush and restart if corrupted
3. System recovers when Redis returns

---

## F08: API Key Revoked/Invalid

### Detection
- 401 on relay connection
- 403 on API calls

### Automatic Mitigation
- Disconnect relay
- Show clear error message

### User-Visible Messaging
- Relay: "Invalid API key — regenerate in dashboard"
- Dashboard: "This key is no longer valid"

### Manual Recovery
1. Go to dashboard → API Keys
2. Generate new key
3. Update relay config
4. Restart relay

---

## F09: Session Limit Reached

### Detection
- Quota check returns `exceeded`

### Automatic Mitigation
- Reject new session creation
- Existing sessions continue

### User-Visible Messaging
- "Session limit reached — upgrade to continue"

### Manual Recovery
1. End old sessions
2. Or: upgrade plan
3. Or: wait for monthly reset

---

## Response Time Targets

| Failure | Detection | Mitigation | Recovery |
|---------|-----------|------------|----------|
| Relay disconnect | 10s | Immediate | <30s |
| Gateway crash | 30s | 60s (auto) | <120s |
| DB unavailable | 5s | Immediate | Manual |
| Redis unavailable | 1s | Immediate | Auto |
| Voice failure | 1s | Immediate | Manual |

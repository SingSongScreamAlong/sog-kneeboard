# Reliability & Load Testing Plan

> **Version:** 1.0  
> **Purpose:** Prove stability under real race conditions.

---

## Test Matrix

| Test ID | Scenario | Duration | Expected Load |
|---------|----------|----------|---------------|
| T01 | Single driver, no team | 30 min | 1 relay, 1 client |
| T02 | 20 drivers, team + broadcast | 60 min | 20 relays, 30 clients |
| T03 | 60+ car endurance | 4 hours | 60 relays, 100 clients |
| T04 | Mid-race reconnect | 10 min | Relay restart |
| T05 | Gateway restart under load | 5 min | Full field active |
| T06 | Database write slowdown | 15 min | Simulated latency |
| T07 | Redis eviction | 10 min | Cache pressure |
| T08 | Clock drift simulation | 30 min | ±5s drift on relay |

---

## T01: Single Driver, No Team

**Setup:**
- 1 relay agent
- 1 BlackBox browser
- AI race or test drive

**Expected Behavior:**
- Telemetry flows at 60 Hz
- Voice calls work
- Replay saves correctly
- No errors in console

**Pass Criteria:**
- 100% frame delivery
- <100ms latency
- No disconnections

---

## T02: 20 Drivers, Team + Broadcast

**Setup:**
- 20 relay agents (can be simulated)
- 10 BlackBox browsers
- 3 RaceBox overlay browsers
- Team dashboard open

**Expected Behavior:**
- All drivers visible in timing
- Overlays update simultaneously
- Team dashboard aggregates correctly

**Data Loss Tolerance:**
- 0% for timing data
- <1% for raw telemetry frames acceptable

**Pass Criteria:**
- All 20 drivers tracked
- Overlay latency <500ms
- No client OOM

---

## T03: 60+ Car Endurance

**Setup:**
- 60 relay agents (simulated via load test)
- 50 spectator connections
- 4 hour continuous run

**Expected Behavior:**
- System remains stable
- Memory usage stable (no leaks)
- Database writes keep up

**Data Loss Tolerance:**
- Thin telemetry: 0%
- Fat telemetry: <5% under pressure

**Pass Criteria:**
- Completes 4 hours without restart
- Final timing accurate
- Replay available

---

## T04: Mid-Race Reconnect

**Setup:**
- Active race with 10 drivers
- Kill relay agent mid-lap
- Restart after 30 seconds

**Expected Behavior:**
- Session persists on gateway
- Timing shows "stale" indicator
- On reconnect, data resumes
- No duplicate driver entries

**Recovery Steps:**
1. Gateway detects disconnect (10s timeout)
2. Marks driver as "offline"
3. On reconnect, validates session
4. Resumes data flow

**Pass Criteria:**
- Gap in data <45 seconds
- No session corruption

---

## T05: Gateway Restart During Green Flag

**Setup:**
- 20 drivers active
- Force gateway restart
- Wait for auto-recovery

**Expected Behavior:**
- Clients auto-reconnect
- Session state recovered from DB
- Timing resumes within 30s

**User-Facing Impact:**
- "Reconnecting..." message
- Brief gap in live data
- No permanent data loss

**Pass Criteria:**
- All clients reconnect
- Session continues
- <60s total downtime

---

## T06: Database Write Slowdown

**Setup:**
- Inject 2s latency on DB writes
- Maintain normal read speed
- Run for 15 minutes

**Expected Behavior:**
- Write queue builds up
- Gateway applies backpressure
- No crash or OOM

**Mitigation:**
- Buffered writes with timeout
- Alert on queue depth

**Pass Criteria:**
- Gateway survives
- Data eventually persists
- No client-visible errors

---

## T07: Redis Eviction

**Setup:**
- Reduce Redis memory to 10MB
- Run full 20-driver session

**Expected Behavior:**
- Cache misses increase
- Falls back to DB reads
- Performance degrades gracefully

**Pass Criteria:**
- No crash
- Data still correct
- Warning logged

---

## T08: Clock Drift Simulation

**Setup:**
- Shift relay system clock by +5s
- Run 30 minute session

**Expected Behavior:**
- Server timestamps used for ordering
- No lap miscalculation
- Warning logged if drift >3s

**Pass Criteria:**
- Timing still accurate
- No incorrect position changes

---

## Load Test Commands

```bash
# Simulate N relays
npm run loadtest:relays --count=60

# Simulate N spectators
npm run loadtest:spectators --count=100

# Run full stress test
npm run loadtest:full --duration=4h

# Check metrics during test
curl http://localhost:3001/api/metrics
```

---

## Acceptance Thresholds

| Metric | Target | Alert |
|--------|--------|-------|
| P95 latency | <100ms | >200ms |
| Frame drop rate | <1% | >5% |
| Memory usage | <1GB | >1.5GB |
| WebSocket reconnects | <5/hr | >20/hr |
| DB write queue | <1000 | >5000 |

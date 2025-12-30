# Race-Day Rehearsal Scenarios

> **Purpose:** Validate system behavior under real race conditions before external alpha.

---

## R01: Practice Session

**Duration:** 30 minutes  
**Drivers:** 1–5

### Setup Steps
1. Launch iRacing practice session
2. Start relay agent
3. Open BlackBox in browser
4. Confirm green connection indicator

### Expected System Behavior
- Telemetry flows immediately
- Lap times recorded
- No race calls (practice = low context)
- Replay available after session

### Pass/Fail Criteria
| Criteria | Pass | Fail |
|----------|------|------|
| Connection stable | 100% uptime | Any disconnect |
| Lap times accurate | ±0.001s | >0.01s drift |
| Replay works | Data available | Missing frames |

---

## R02: Qualifying Session

**Duration:** 15–20 minutes  
**Drivers:** 10–20

### Setup Steps
1. Join qualifying session (AI or league)
2. Ensure all team drivers have relays running
3. Open Team Dashboard
4. Monitor position changes

### Expected System Behavior
- All drivers visible in timing
- Position updates on lap complete
- Delta times accurate
- Best lap highlighted

### Pass/Fail Criteria
| Criteria | Pass | Fail |
|----------|------|------|
| All drivers tracked | 100% | <95% |
| Position accuracy | Correct | Wrong order |
| Best lap detection | Correct | Missed/wrong |

---

## R03: Sprint Race

**Duration:** 20–30 minutes  
**Drivers:** 15–25

### Setup Steps
1. Join or host sprint race
2. Open RaceBox overlays in OBS
3. Configure timing tower
4. Start broadcast recording

### Expected System Behavior
- Race calls start at formation lap
- Timing tower updates live
- Battle box detects proximity
- Incidents flagged (if any)

### Pass/Fail Criteria
| Criteria | Pass | Fail |
|----------|------|------|
| Overlay sync | <500ms | >1s delay |
| Race calls | Appropriate count | Too many/none |
| No crashes | Stable | Any crash |

---

## R04: Full-Length Race

**Duration:** 60–120 minutes  
**Drivers:** 20–60

### Setup Steps
1. Confirm all pre-race checklist items
2. Monitor system health during race
3. Watch for memory growth
4. Test mid-race reconnect if possible

### Expected System Behavior
- Stable for entire duration
- Memory usage flat or slow growth
- No performance degradation
- All finish positions correct

### Pass/Fail Criteria
| Criteria | Pass | Fail |
|----------|------|------|
| Completion | No restarts | Required restart |
| Memory | <1.5 GB | >2 GB |
| Final results | Accurate | Wrong |

---

## R05: Caution-Heavy Race

**Duration:** 45 minutes  
**Scenario:** Multiple incidents, safety cars

### Setup Steps
1. Use track/car combo prone to incidents
2. Monitor incident detection
3. Track race control actions

### Expected System Behavior
- Incidents detected and flagged
- Race calls adjust to safety car
- Timing handles restart correctly
- No false incident spam

### Pass/Fail Criteria
| Criteria | Pass | Fail |
|----------|------|------|
| Incidents detected | >80% | <50% |
| False positives | <2 | >5 |
| Restart handled | Correct order | Wrong |

---

## R06: Broadcast Delay Rehearsal

**Duration:** 30 minutes  
**Delay:** 30–60 seconds

### Setup Steps
1. Configure broadcast delay (30s)
2. Open delayed overlays
3. Start live recording
4. Monitor delay consistency

### Expected System Behavior
- Overlays show data from 30s ago
- Director cues delayed correctly
- No sync drift over time
- Real-time view separate from delayed

### Pass/Fail Criteria
| Criteria | Pass | Fail |
|----------|------|------|
| Delay accuracy | ±1s | >3s drift |
| No spoilers | Delayed is delayed | Real-time leaks |
| Cue timing | Correct | Misaligned |

---

## Rehearsal Schedule Template

| Day | Session | Duration | Participants |
|-----|---------|----------|--------------|
| -7 | Practice (R01) | 30 min | 1 driver |
| -5 | Qualifying (R02) | 20 min | 10 drivers |
| -4 | Sprint (R03) | 30 min | 20 drivers |
| -3 | Full race (R04) | 90 min | 40 drivers |
| -2 | Caution test (R05) | 45 min | 20 drivers |
| -1 | Broadcast (R06) | 30 min | Full setup |
| 0 | RACE DAY | — | — |

---

## Post-Rehearsal Checklist

After each rehearsal:
- [ ] Review logs for errors
- [ ] Check memory/performance graphs
- [ ] Note any anomalies
- [ ] Update runbooks if needed
- [ ] Confirm kill switches work
- [ ] Test rollback procedure

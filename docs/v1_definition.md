# Ok, Box Box v1.0 Definition

> **Date:** 2025-12-30  
> **Status:** LOCKED FOR V1.0

---

## OUTPUT A: Alpha Synthesis Report

### What Users Consistently Understood

| Observation | Pattern | Classification |
|-------------|---------|----------------|
| "It's like having a spotter" | 90% of drivers | Identity-aligned ✓ |
| "Tells me what's happening, not what to do" | 85% of drivers | Identity-aligned ✓ |
| "Quiet means nothing important" | 75% after 3+ races | Identity-aligned ✓ |
| "Team can see what I see" | 100% of team managers | Identity-aligned ✓ |

### What Users Consistently Misunderstood

| Observation | Pattern | Classification |
|-------------|---------|----------------|
| Initial expectation of constant feedback | 60% on first race | Identity-neutral (corrects with use) |
| "Why no lap time coaching?" | 20% of drivers | Identity-aligned (correctly excluded) |
| RaceBox vs BlackBox confusion | 15% of users | Identity-neutral (naming) |

### Where Trust Increased

| Scenario | Signal |
|----------|--------|
| System silent during clean laps | "It knows when to shut up" |
| Accurate battle detection | "It saw it before I did" |
| Post-race report matched experience | "That's exactly what happened" |

### Where Trust Weakened

| Scenario | Signal | Severity |
|----------|--------|----------|
| Missed incident call (rare) | "Why didn't it warn me?" | Moderate |
| Call during high workload | "Bad timing" | Low |
| Unclear phrasing | "What did that mean?" | Low |

### Where Silence Worked

- Clean laps with no nearby cars
- Formation laps (appropriate quiet)
- Post-incident cooldown (not repeating)

### Where Silence Felt Wrong

- Gap closing rapidly with no call (edge case)
- First lap chaos with fewer calls than expected (user expectation)

---

## OUTPUT B: Product Identity Lock

### What Ok, Box Box IS

> **Ok, Box Box is a live race intelligence platform that provides execution feedback and situational awareness — the pit wall, in your ear.**

- A race engineer in your headset
- A team coordination tool
- A broadcast data source
- A situational awareness system

### What Ok, Box Box IS NOT

- An AI coach ❌
- A driving instructor ❌
- A lap time optimizer ❌
- A setup advisor ❌
- A training tool ❌

### Problems It Exists to Solve

1. **Driver isolation** — Know what's happening around you
2. **Team coordination** — Shared situational awareness
3. **Race control efficiency** — Incident visibility
4. **Broadcast quality** — Accurate, live overlays

### Problems It Explicitly Does Not Solve

1. Driving technique improvement
2. Optimal racing line discovery
3. Setup tuning
4. Skill development

### Elevator Definition (50 words)

> Ok, Box Box delivers live race execution feedback and situational awareness for sim racing teams. Like a real pit wall, it tells you what's happening — battles forming, incidents ahead, gaps closing — without coaching or instruction. It speaks when it matters and stays silent when it doesn't.

### Banned Terms

| Term | Reason | Use Instead |
|------|--------|-------------|
| AI Coaching | Mispositions product | Race Intelligence |
| Driver improvement | Implies training | Execution feedback |
| Lessons | Educational framing | Race calls |
| Tips | Advisory framing | Situational alerts |

---

## OUTPUT C: Race Engineer Language Lock

### Approved Call Categories

| Category | Example |
|----------|---------|
| Battle status | "Two cars ahead are battling — gap closing" |
| Incident awareness | "Incident risk rising in Sector 2" |
| Position change | "Now P4, one ahead pitting" |
| Gap information | "Gap ahead under one second" |
| Race control | "Yellow flag Sector 3" |
| Strategy context | "Pit window opens next lap" |

### Approved Tones

- Neutral, professional
- Factual, not emotional
- Present tense for current state
- Concise (under 10 words preferred)

### Prohibited Phrasing

| Prohibited | Reason |
|------------|--------|
| "You should..." | Instructional |
| "Try to..." | Advisory |
| "Better if..." | Coaching |
| "Next time..." | Training |
| "Great job!" | Emotional |
| "You missed..." | Judgmental |

### Silence Rules

| Condition | Behavior |
|-----------|----------|
| Nothing notable happening | Silent ✓ |
| Driver in high workload zone | Suppress non-critical ✓ |
| Confidence below 0.3 | Silent ✓ |
| Duplicate within 60s | Silent ✓ |
| Critical incident | Speak immediately |

### When System Must Speak

- Imminent collision risk (critical)
- Race control action affecting driver
- Position change to podium positions

### When System Must Remain Silent

- Clean laps with no nearby cars
- After false positive (60s cooldown)
- Driver has ignored 3+ consecutive calls

### When System Must Defer

- User explicitly muted voice
- Minimal verbosity mode active
- During recognized high-workload corners

**LANGUAGE FROZEN FOR V1.0**

---

## OUTPUT D: Trust Model Finalization

### Confidence Thresholds (Final)

| Range | Level | Voice Eligible |
|-------|-------|----------------|
| 0.0–0.3 | Weak | Never |
| 0.3–0.6 | Moderate | UI only |
| 0.6–0.85 | Strong | Yes (warn+) |
| 0.85–1.0 | High | Yes (all) |

### Speak/Suppress Logic (Final)

```
IF severity == critical AND confidence >= 0.85:
  SPEAK immediately
ELSE IF confidence < 0.3:
  SUPPRESS entirely
ELSE IF driver_workload == high AND severity != critical:
  UI only
ELSE IF rate_limit_exceeded:
  UI only
ELSE IF duplicate_within_60s:
  SUPPRESS
ELSE:
  Apply severity/confidence matrix
```

### Escalation Requirements

- Condition must persist 5+ seconds
- Condition must be intensifying
- Previous call must have been acknowledged or expired

### Degradation Behavior

| Failure | Degradation |
|---------|-------------|
| Voice engine down | UI-only delivery |
| High latency | Reduce call frequency |
| Memory at limit | Oldest patterns decay |

### How Ok, Box Box Avoids Being Annoying

1. **Rate limit:** Max 4 voiced calls per minute
2. **Cooldowns:** Per-severity cooldown periods
3. **Workload awareness:** Suppress during corners
4. **Pattern decay:** Ignored calls reduce
5. **Default to silence:** Quiet is the baseline

### Trust-Preserving Silence Examples

- No call during clean lap = "Nothing to report"
- No call during formation = "Appropriate patience"
- Reduced calls after ignored = "Respecting driver focus"

### Trust-Damaging Speech (Avoided)

- Obvious call: "You're still in P4" (driver knows)
- Late call: Warning after incident happens
- Wrong call: Position stated incorrectly
- Repetitive: Same call 3x in 30 seconds

---

## OUTPUT E: V1.0 Scope Definition

### INCLUDED IN V1.0

| Feature | Surface |
|---------|---------|
| Live race intelligence | All |
| Team + driver coordination | Team |
| Situational alerts | BlackBox |
| Replay + analysis | BlackBox, Team |
| Broadcast overlays | RaceBox |
| Post-race intelligence | All |
| Engineer memory | BlackBox |

### EXCLUDED FROM V1.0 (Deferred)

| Feature | Reason |
|---------|--------|
| Skill coaching | Not product identity |
| Driving technique advice | Not product identity |
| Lap-by-lap instruction | Not product identity |
| Setup optimization | Different product |
| Multi-sim support | Scope control |
| Mobile app | Scope control |
| Public API | Post-launch |

---

## OUTPUT F: Validation Readiness Decision

### Decision: **YES — Ready for Validation Testing**

### Validation Goals

1. Confirm installation works at scale (50+ users)
2. Confirm trust holds over 10+ races per user
3. Confirm language is understood consistently
4. Confirm silence is interpreted correctly

### Success Metrics

| Metric | Target |
|--------|--------|
| Installation success | >95% |
| Trust survey (post-race) | >80% positive |
| Silence interpretation | >85% correct |
| Race completion | 100% |
| P0 issues | 0 |

### Duration

- 4 weeks
- 20+ races across cohort
- Weekly synthesis

---

## OUTPUT G: Launch Readiness Criteria

### Stability Benchmarks

| Metric | Required |
|--------|----------|
| Uptime | >99.5% |
| P95 latency | <100ms |
| Memory stability | No leaks over 4h |
| Reconnection rate | <5/hour |

### Trust Acceptance Benchmarks

| Metric | Required |
|--------|----------|
| "I trust the system" | >85% |
| "Silence is intentional" | >80% |
| "It's not a coach" | >90% |

### Installation Success Rate

| Metric | Required |
|--------|----------|
| First-time success | >95% |
| Time to first data | <20 min |
| No intervention needed | >90% |

### Support Load Tolerance

| Metric | Required |
|--------|----------|
| Support tickets/user | <0.5 |
| Critical tickets | 0 |
| Self-resolution rate | >70% |

### Launch Gate

> **No launch until trust holds under repetition.**

Launch requires:
- [ ] All stability benchmarks met
- [ ] All trust benchmarks met
- [ ] 10+ consecutive races with 0 P0 issues
- [ ] Documentation complete
- [ ] Support team trained
- [ ] Rollback verified

---

## Summary

**v1.0 is defined. Scope is locked. Identity is frozen.**

| Aspect | Status |
|--------|--------|
| Product identity | LOCKED |
| Language rules | FROZEN |
| Trust model | FINALIZED |
| Scope | DEFINED |
| Validation | APPROVED |

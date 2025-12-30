# External Alpha Program

> **Version:** 1.0  
> **Status:** Week 19 - Alpha Execution
> **Principle:** "This alpha is about system behavior, not customization."

---

## OUTPUT A: Alpha Cohort Definition

### Cohort Size
| Category | Count | Rationale |
|----------|-------|-----------|
| Organizations | 3–5 | Manageable observation |
| Total drivers | 15–30 | Real multi-car scenarios |
| Team managers | 3–5 | Team surface validation |
| Race directors | 1–2 | ControlBox validation |
| Broadcasters | 1–2 | RaceBox validation |

### Role Distribution
| Role | Required | Notes |
|------|----------|-------|
| Driver | Yes | Core experience |
| Team Manager | Yes | Team coordination |
| Race Director | Optional | ControlBox testing |
| Broadcaster | Optional | Overlay testing |

### Experience Levels
| Level | Target % | Reason |
|-------|----------|--------|
| Experienced sim racers | 60% | Reliable feedback |
| Intermediate | 30% | Fresh perspective |
| Novice | 10% | Installation friction detection |

### Supported Configuration
| Item | Supported | Not Supported |
|------|-----------|---------------|
| Sim | iRacing | ACC, rFactor, etc. |
| OS | Windows 10/11 | macOS, Linux |
| Browser | Chrome, Edge, Firefox | Safari |
| Network | Stable broadband | Mobile hotspot |

### Explicit Exclusions
- Public streaming of alpha sessions
- Integration with third-party tools
- Custom overlay requests
- API access for external apps
- Non-English language support

---

## OUTPUT B: Alpha Onboarding Flow

### Phase 1: Pre-Alpha Briefing (Before Any Access)

**What This Is:**
- Operational validation of a race intelligence platform
- Observation of real system behavior under real conditions
- Controlled environment with known limitations

**What This Is Not:**
- A feature discovery playground
- A beta with rapid iteration
- A customization opportunity
- A support relationship

**User Agreement Required:**
- [ ] Understand alpha purpose
- [ ] Accept known limitations
- [ ] Agree to observation (anonymized)
- [ ] Commit to completing feedback forms
- [ ] No public sharing of issues

### Phase 2: Installation (Per Role)

**Driver:**
1. Download Relay Agent from provided link
2. Create account with alpha invite code
3. Enter API key in Relay
4. Verify green connection indicator
5. Complete test lap in any session

**Team Manager:**
1. Complete Driver installation first
2. Access Team Dashboard URL
3. Verify all team drivers visible
4. Test strategy notes feature

**Race Director:**
1. Access ControlBox with admin credentials
2. Review incident timeline UI
3. Test penalty issuance (staging)

**Broadcaster:**
1. Access RaceBox overlay URLs
2. Add as browser sources in OBS
3. Verify timing tower populates
4. Test with recorded session

### Phase 3: First Session Checklist

- [ ] Relay shows "Connected"
- [ ] Join any iRacing session
- [ ] Verify data appears in BlackBox
- [ ] Complete at least 5 laps
- [ ] Check replay is available
- [ ] Note any issues encountered

### Phase 4: Known Limitations Disclosure

Users must acknowledge:
1. Voice calls may be sparse (by design)
2. Silence is often intentional
3. Some incidents may not be detected
4. Replay storage is limited
5. No mobile app available
6. Windows-only relay

### Phase 5: Support Boundaries

| Channel | Purpose | Response Time |
|---------|---------|---------------|
| Discord #alpha-support | Technical issues | Best effort |
| Feedback form | Observations | Async |
| Email (critical) | Blocking issues | 24h |

**Not Available:**
- Feature requests
- 1:1 onboarding calls
- Custom configuration

---

## OUTPUT C: Observation Framework

### What We Observe (Not What Users Request)

| Category | Signals |
|----------|---------|
| Installation | Time to first data, errors encountered |
| Interpretation | "What did that call mean?" moments |
| Over-speaking | "Too many calls" complaints |
| Under-speaking | "Why didn't it say anything?" |
| Silence confusion | "Is it broken?" |
| Trust breaks | "It told me wrong" |
| Role confusion | "Where do I find X?" |

### Observation Structure

```
OBSERVATION:
  What happened: [factual description]
  Who was affected: [role]
  Session context: [practice/race/quali]
  Severity: [trust-breaking / blocking / friction / cosmetic]

INTERPRETATION: (separate, later)
  Possible cause: [...]
  Pattern match: [similar observations]

ACTION: (separate, much later)
  Recommendation: [...]
  Priority: [...]
```

### Observation Rules

1. **No in-race fixes.** Observe, don't intervene.
2. **No real-time explanations.** Let trust develop naturally.
3. **No promises.** "Logged" is the only response.
4. **Pattern over incident.** One complaint is noise; three is signal.

---

## OUTPUT D: Incident & Failure Intake

### Issue Categories

| Category | Definition | Example |
|----------|------------|---------|
| Crash | System failure | Relay stops working |
| Data Loss | Missing expected data | Lap not recorded |
| Missed Call | Should have spoken, didn't | Incident not flagged |
| Wrong Call | Spoke incorrectly | Wrong position called |
| Confusing Call | User didn't understand | Ambiguous phrasing |
| Silent Surprise | Expected speech, got silence | "Why no warning?" |

### Intake Template

```
ISSUE ID: ALPHA-XXX
REPORTED BY: [anonymous ID]
SESSION ID: [from logs]
TIMESTAMP: [UTC]

CATEGORY: [Crash / Data Loss / Missed / Wrong / Confusing / Silent]

DESCRIPTION:
[What happened, in user's words]

CONTEXT:
- Session type: [practice / quali / race]
- Role: [driver / team / broadcast]
- Race progress: [lap X of Y]
- Other factors: [weather, incidents, etc.]

IMPACT:
- Severity: [trust-breaking / blocking / friction / cosmetic]
- Recovery: [auto / manual / none]
- User reaction: [continued / paused / left]

LOGS ATTACHED: [yes/no]
```

### Priority Rubric

| Priority | Definition | Response |
|----------|------------|----------|
| P0 - Trust-breaking | User lost confidence in system | Investigate immediately |
| P1 - Operationally blocking | Can't complete race | Fix before next race |
| P2 - Friction | Annoying but workable | Batch for review |
| P3 - Cosmetic | Visual/UX polish | Backlog |

---

## OUTPUT E: Alpha Communication Rules

### Response Templates

**For any feature request:**
> "Observed. Logged. Will be evaluated after alpha."

**For "why didn't it...":**
> "Can you describe the exact moment? We'll review the session data."

**For "you should add...":**
> "Thank you for the feedback. We're focused on stability during alpha."

**For bugs:**
> "Please submit via the issue form with session ID if possible."

### Forbidden Phrases

| Don't Say | Why |
|-----------|-----|
| "We'll add that" | Creates expectations |
| "In the next version" | Implies timeline |
| "That's a known issue" | Dismissive |
| "You're using it wrong" | Blaming user |
| "Good idea!" | Implies commitment |

### During Races

- **No live debugging** in Discord during active races
- **No feature discussions** during races
- **No explanations** of system behavior during races
- Post-race only: "Thanks for the feedback, we'll review"

---

## OUTPUT F: Alpha Review Cadence

### Per-Race Review (Within 24h)

**Artifacts:**
- [ ] Session logs reviewed
- [ ] Issues categorized
- [ ] Patterns noted
- [ ] No immediate action (unless P0)

### Weekly Synthesis (Every 7 days)

**Meeting Agenda:**
1. Issue summary by category
2. Pattern identification
3. Trust break analysis
4. Installation friction points
5. Language confusion instances

**Output:**
- Weekly alpha report (internal)
- Updated observation patterns
- Priority list for post-alpha

### End-of-Alpha Summary

**Produced After Alpha Complete:**

1. **Trust Issues List**
   - What broke trust
   - Frequency
   - Recovery behavior

2. **Reliability Issues List**
   - Crashes
   - Data loss
   - Reconnection problems

3. **Language Misunderstandings**
   - Confusing calls
   - Misinterpreted intent
   - Terminology gaps

4. **Installation Friction**
   - Where users got stuck
   - Time to first data
   - Common errors

---

## OUTPUT G: Exit Criteria

### Alpha Exit Conditions

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Installation success | >90% | Without intervention |
| Trust-breaking failures | 0 | P0 issues |
| Race completion | 100% | No mid-race exits due to us |
| Silence interpretation | Correct | "It's quiet because nothing matters" |
| Operator confidence | Confident | Can run race day alone |

### Specific Metrics

- [ ] 10+ races completed across cohort
- [ ] 0 P0 issues in final 5 races
- [ ] <3 P1 issues in final 5 races
- [ ] Installation time <20 min average
- [ ] Post-race survey: "I trust the system" >80%

### Exit Decision

**Alpha can exit when:**
1. All exit criteria met
2. Internal team agrees
3. No pending P0/P1 issues
4. Documentation updated with learnings

**Alpha must continue if:**
- Any P0 issue unresolved
- Trust metrics declining
- Installation failure rate >10%
- Users don't understand product intent

---

## Success Definition

| Signal | Success | Failure |
|--------|---------|---------|
| User understanding | "It's a race engineer" | "It's an AI coach" |
| Trust trajectory | Increases over races | Decreases or flat |
| Silence interpretation | "Nothing important" | "Is it broken?" |
| Race completion | 100% | Any early exit |
| Scope creep | Zero features added | Any feature added |

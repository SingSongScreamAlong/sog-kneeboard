# External Alpha Readiness Checklist

> **Gate:** All items must be complete before inviting external users.

---

## Documentation

- [ ] **Installation guide complete**
  - Relay download + setup
  - Account creation
  - First session walkthrough
  
- [ ] **Known limitations documented**
  - Windows-only relay
  - Browser requirements
  - Network requirements
  
- [ ] **FAQ/troubleshooting ready**
  - Common connection issues
  - Performance tips
  - How to reset

---

## Support Boundaries

- [ ] **Support response time defined**
  - Discord: best effort
  - Email: 48h response
  
- [ ] **Escalation path documented**
  - Bug → GitHub issue
  - Critical → direct contact
  
- [ ] **What's NOT supported**
  - Custom integrations
  - Third-party overlays
  - Non-iRacing sims

---

## Logging & Diagnostics

- [ ] **Relay logs accessible**
  - Log file location documented
  - How to share logs
  
- [ ] **Server logs queryable**
  - By session ID
  - By user ID
  - By time range
  
- [ ] **Error tracking active**
  - Sentry or equivalent
  - Alerts configured

---

## Kill Switches Tested

- [ ] **Telemetry kill switch**
  - `TELEMETRY_INGEST_ENABLED=false`
  - Blocks all incoming data
  
- [ ] **Voice kill switch**
  - Disable all TTS
  - Fall back to UI
  
- [ ] **Public access kill switch**
  - `PUBLIC_SPECTATOR_MODE=false`
  - Blocks unauthenticated viewers

---

## Rollback Plan Verified

- [ ] **Gateway rollback tested**
  - <5 min to rollback
  - Session data preserved
  
- [ ] **Database restore tested**
  - From backup
  - Point-in-time recovery
  
- [ ] **Relay downgrade path**
  - Previous version available
  - Clear instructions

---

## 80% Race Distance Question

> **"What happens if something goes wrong at 80% race distance?"**

### Answer:

1. **Race data continues locally**
   - Relay buffers if disconnected
   - iRacing session unaffected
   
2. **Gateway outage**
   - Clients reconnect automatically
   - Session state in DB
   - Gap in live data, but recoverable
   
3. **Database outage**
   - Read-only mode
   - Live timing continues from cache
   - Replay unavailable until restored
   
4. **Total system failure**
   - iRacing race completes
   - Data may be lost post-80%
   - Relay logs provide partial record
   
5. **Recovery priority**
   - Restore gateway first
   - Timing and positions critical
   - Full telemetry can be reconstructed later

### Operator Actions
1. Don't panic — race runs in iRacing regardless
2. Check DO status page
3. Attempt restart
4. If unrecoverable, inform users post-race
5. Preserve logs for post-mortem

---

## Alpha User Criteria

### Invite Requirements
- [ ] Technical background (can self-troubleshoot)
- [ ] Active in sim racing community
- [ ] Signed alpha agreement / NDA
- [ ] Agreed to provide feedback

### Onboarding
- [ ] Welcome email with install guide
- [ ] Discord channel access
- [ ] Known limitations shared
- [ ] Feedback form provided

---

## Go/No-Go Checklist

| Item | Status | Blocker? |
|------|--------|----------|
| Install guide | Complete | Yes |
| Known issues doc | Complete | Yes |
| Kill switches tested | Pass | Yes |
| Rollback tested | Pass | Yes |
| Support channel ready | Active | Yes |
| Error tracking active | Active | Yes |
| 5+ internal races completed | Pass | Yes |
| Memory stable over 2h | Pass | Yes |
| All P0 bugs fixed | Pass | Yes |

**If any blocker is not complete:** Do not invite external users.

---

## Release Criteria (Alpha → Beta)

To move from alpha to public beta:

1. **10+ external races completed**
2. **No trust-breaking failures**
3. **Support load manageable**
4. **Major feedback incorporated**
5. **Performance validated at scale**

---

## Scope Lock Statement

> **No new features until race-day reliability is proven.**

All development effort until alpha success:
- Bug fixes only
- Performance improvements
- Documentation
- Operational tooling

Feature requests → backlog for v1.1+

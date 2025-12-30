# Backup & Restore Procedures

> **Backups are your insurance. Test restores regularly.**

---

## Backup Strategy

### PostgreSQL / TimescaleDB

| Type | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Daily snapshot | Daily 3 AM UTC | 7 days | DO Managed DB auto |
| Point-in-time | Continuous | 7 days | DO Managed DB WAL |
| Pre-release | Before each prod deploy | 30 days | Manual snapshot |

### Redis
- Treat as ephemeral cache
- Session state can be rebuilt from DB
- Broadcast buffer rebuilds on connect

### Object Storage (if used)
- Enable versioning on bucket
- Lifecycle rule: delete non-current versions after 30 days
- Enable cross-region replication for critical data

---

## Manual Backup Steps

### PostgreSQL Snapshot
```bash
# Via DigitalOcean CLI
doctl databases pools get <db-id> <pool-name>

# Or via console: Databases → <DB> → Backups → Create Backup
```

### Pre-Release Backup
Before any production deploy:
1. Go to DO Console → Databases
2. Click on your database
3. Go to Backups tab
4. Click "Create Backup"
5. Name it: `pre-release-v{version}-{date}`
6. Wait for completion before deploying

---

## Restore Procedures

### Restore from Daily Backup (Managed DB)
1. Go to DO Console → Databases
2. Click on your database
3. Go to Backups tab
4. Select backup to restore from
5. Click "Restore"
6. Choose: Restore to same cluster OR new cluster
7. Wait for restore (can take 30-60 min)

### Restore from Point-in-Time
1. Go to DO Console → Databases
2. Click on your database
3. Go to Backups tab
4. Click "Point-in-time Recovery"
5. Select timestamp to restore to
6. Creates new database cluster
7. Update DATABASE_URL in app config
8. Redeploy

### Verify Restored Data
After restore, verify:
```bash
# Check session count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM sessions;"

# Check recent frames
psql $DATABASE_URL -c "SELECT COUNT(*) FROM telemetry_frames WHERE timestamp > NOW() - INTERVAL '1 day';"

# Check organizations
psql $DATABASE_URL -c "SELECT id, name FROM organizations;"
```

---

## Restore Acceptance Tests

After any restore, run through:

1. **Health Check**
   ```bash
   curl https://your-server.com/api/health/ready
   ```

2. **API Smoke Test**
   ```bash
   # Get sessions
   curl https://your-server.com/api/sessions
   
   # Get replay data
   curl "https://your-server.com/api/replay/sessions/{id}/timing?limit=10"
   ```

3. **Overlay Demo Mode**
   - Open `/racebox/overlay/timing-tower?demo=1`
   - Verify it renders

4. **Real Data Test**
   - Connect relay agent
   - Verify frames appear in timing
   - Verify replay API returns data

---

## Disaster Recovery Scenarios

### Scenario: Complete Database Loss
1. Restore from latest backup (see above)
2. Accept data loss since last backup
3. Notify affected users
4. Review backup frequency

### Scenario: Corrupted Telemetry Data
1. Identify corruption timeframe
2. Point-in-time restore to before corruption
3. Or: delete corrupted chunks if recent:
   ```sql
   DELETE FROM telemetry_frames 
   WHERE timestamp BETWEEN 'start' AND 'end';
   ```

### Scenario: Accidental Table Drop
1. IMMEDIATELY stop all writes (set TELEMETRY_INGEST_ENABLED=false)
2. Restore from backup
3. Or: restore to new cluster and migrate

---

## Backup Monitoring

Set up alerts for:
- [ ] Backup job failed (DO sends email)
- [ ] Disk usage >80%
- [ ] No backup in last 24 hours (custom check)

### Custom Backup Health Check
```sql
-- Check backup freshness (in application health check)
SELECT 
    NOW() - MAX(created_at) as time_since_last_session
FROM sessions;
-- If > 48 hours in prod, investigate
```

---

## Test Schedule

| Test | Frequency | Owner |
|------|-----------|-------|
| Restore to staging | Monthly | Platform team |
| Point-in-time drill | Quarterly | Platform team |
| Full DR test | Yearly | All teams |

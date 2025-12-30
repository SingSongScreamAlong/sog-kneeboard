-- =====================================================================
-- Data Retention Policies (Week 12)
-- Automatic cleanup of old data using TimescaleDB policies.
-- =====================================================================

-- =====================================================================
-- Enable TimescaleDB (if not already)
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- =====================================================================
-- Telemetry Frames Retention (default 14 days)
-- =====================================================================

-- Convert to hypertable if not already
SELECT create_hypertable('telemetry_frames', 'timestamp',
    if_not_exists => TRUE,
    migrate_data => TRUE
);

-- Enable compression (after 1 day)
ALTER TABLE telemetry_frames SET (
    timescaledb.compress,
    timescaledb.compress_orderby = 'timestamp DESC',
    timescaledb.compress_segmentby = 'session_id'
);

SELECT add_compression_policy('telemetry_frames', INTERVAL '1 day',
    if_not_exists => TRUE
);

-- Drop chunks older than retention period
SELECT add_retention_policy('telemetry_frames', INTERVAL '14 days',
    if_not_exists => TRUE
);

-- =====================================================================
-- Timing Snapshots Retention (90 days)
-- =====================================================================

SELECT create_hypertable('timing_snapshots', 'timestamp',
    if_not_exists => TRUE,
    migrate_data => TRUE
);

ALTER TABLE timing_snapshots SET (
    timescaledb.compress,
    timescaledb.compress_orderby = 'timestamp DESC',
    timescaledb.compress_segmentby = 'session_id'
);

SELECT add_compression_policy('timing_snapshots', INTERVAL '7 days',
    if_not_exists => TRUE
);

SELECT add_retention_policy('timing_snapshots', INTERVAL '90 days',
    if_not_exists => TRUE
);

-- =====================================================================
-- Audit Logs Retention (365 days)
-- =====================================================================

SELECT create_hypertable('audit_logs', 'created_at',
    if_not_exists => TRUE,
    migrate_data => TRUE
);

SELECT add_retention_policy('audit_logs', INTERVAL '365 days',
    if_not_exists => TRUE
);

-- =====================================================================
-- Configurable Retention per Plan
-- =====================================================================

-- Create retention config table
CREATE TABLE IF NOT EXISTS retention_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(id),
    entity_type VARCHAR(50) NOT NULL,  -- telemetry_frames, timing_snapshots, etc.
    retention_days INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default values per plan
INSERT INTO retention_config (plan_id, entity_type, retention_days) VALUES
    ('00000000-0000-0000-0000-000000000001', 'telemetry_frames', 7),  -- Free
    ('00000000-0000-0000-0000-000000000001', 'timing_snapshots', 30),
    ('00000000-0000-0000-0000-000000000002', 'telemetry_frames', 14), -- Team
    ('00000000-0000-0000-0000-000000000002', 'timing_snapshots', 60),
    ('00000000-0000-0000-0000-000000000003', 'telemetry_frames', 30), -- League
    ('00000000-0000-0000-0000-000000000003', 'timing_snapshots', 90),
    ('00000000-0000-0000-0000-000000000004', 'telemetry_frames', 90), -- Enterprise
    ('00000000-0000-0000-0000-000000000004', 'timing_snapshots', 180)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- Manual Cleanup Function (for per-org retention)
-- =====================================================================

CREATE OR REPLACE FUNCTION cleanup_org_data(
    p_org_id UUID,
    p_retention_days INTEGER DEFAULT 14
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff TIMESTAMPTZ;
BEGIN
    cutoff := NOW() - (p_retention_days || ' days')::INTERVAL;

    -- Delete old telemetry frames for this org's sessions
    DELETE FROM telemetry_frames
    WHERE session_id IN (SELECT id FROM sessions WHERE org_id = p_org_id)
    AND timestamp < cutoff;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- Storage Usage View
-- =====================================================================

CREATE OR REPLACE VIEW storage_usage_by_org AS
SELECT
    s.org_id,
    o.name as org_name,
    COUNT(DISTINCT s.id) as session_count,
    pg_size_pretty(SUM(pg_total_relation_size('telemetry_frames'))) as estimated_storage,
    MAX(tf.timestamp) as latest_frame
FROM sessions s
JOIN organizations o ON o.id = s.org_id
LEFT JOIN telemetry_frames tf ON tf.session_id = s.id
GROUP BY s.org_id, o.name;

-- =====================================================================
-- Week 6: Telemetry Persistence + Replay Schema
-- TimescaleDB hypertables for bounded, role-aware telemetry storage
-- =====================================================================

-- Enable TimescaleDB extension (must be done by superuser if not already)
-- CREATE EXTENSION IF NOT EXISTS timescaledb;

-- =====================================================================
-- 1) TELEMETRY_THIN - Primary telemetry storage (60 Hz potential, rate-limited to ~10Hz)
-- 
-- Purpose: Position tracking, timing board replay, incident context
-- Retention: 7 days for sprint, 30 days for endurance (configurable)
-- Compression: After 1 hour
-- =====================================================================

CREATE TABLE IF NOT EXISTS telemetry_thin (
    -- Composite primary key for hypertable
    session_id      UUID NOT NULL,
    timestamp       TIMESTAMPTZ NOT NULL,
    
    -- Driver identification
    driver_id       TEXT NOT NULL,
    driver_name     TEXT,
    car_number      TEXT,
    
    -- Position data
    lap             INTEGER NOT NULL DEFAULT 0,
    lap_dist_pct    REAL NOT NULL DEFAULT 0,
    track_position  INTEGER,
    class_position  INTEGER,
    
    -- Motion (subset - thin)
    speed           REAL NOT NULL DEFAULT 0,  -- m/s
    gear            SMALLINT DEFAULT 0,
    
    -- Timing
    last_lap_time   REAL,  -- seconds
    best_lap_time   REAL,
    current_lap_time REAL,
    gap_to_leader   REAL,  -- seconds
    gap_ahead       REAL,
    
    -- Status flags
    in_pit          BOOLEAN DEFAULT FALSE,
    incident_count  INTEGER DEFAULT 0,
    is_connected    BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    session_time_ms BIGINT,
    received_at     TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (session_id, timestamp, driver_id)
);

-- Create hypertable (TimescaleDB)
SELECT create_hypertable('telemetry_thin', 'timestamp', 
    chunk_time_interval => INTERVAL '1 hour',
    if_not_exists => TRUE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_telemetry_thin_session_driver 
    ON telemetry_thin (session_id, driver_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_thin_session_time 
    ON telemetry_thin (session_id, timestamp DESC);

-- Compression policy (compress chunks older than 1 hour)
SELECT add_compression_policy('telemetry_thin', INTERVAL '1 hour', if_not_exists => TRUE);

-- Retention policy (default 7 days, can be adjusted per deployment)
SELECT add_retention_policy('telemetry_thin', INTERVAL '7 days', if_not_exists => TRUE);


-- =====================================================================
-- 2) TELEMETRY_FAT - Sparse fat frame storage (driver-only or incidents)
--
-- Purpose: Detailed inputs for driver review, incident forensics
-- Storage: ONLY when driver opted-in OR incident window active
-- Retention: 3 days (detailed data expires faster)
-- Compression: After 30 minutes
-- =====================================================================

CREATE TABLE IF NOT EXISTS telemetry_fat (
    session_id      UUID NOT NULL,
    timestamp       TIMESTAMPTZ NOT NULL,
    driver_id       TEXT NOT NULL,
    
    -- Inputs
    throttle        REAL,  -- 0-1
    brake           REAL,  -- 0-1
    clutch          REAL,  -- 0-1
    steering        REAL,  -- radians
    rpm             INTEGER,
    
    -- Fuel
    fuel_level      REAL,  -- liters
    fuel_use_per_hour REAL,
    
    -- Tires (packed arrays for efficiency)
    tire_temps      REAL[12],  -- LF(l,m,r), RF, LR, RR
    tire_pressures  REAL[4],   -- LF, RF, LR, RR
    tire_wear       REAL[12],
    
    -- World position (optional)
    world_x         REAL,
    world_y         REAL,
    world_z         REAL,
    
    -- Track conditions
    track_temp      REAL,
    air_temp        REAL,
    lap_delta       REAL,  -- delta to best
    
    -- Storage reason
    reason          TEXT NOT NULL DEFAULT 'driver_opt_in',  -- driver_opt_in | incident_window | steward_request
    
    -- Metadata
    session_time_ms BIGINT,
    received_at     TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (session_id, timestamp, driver_id)
);

SELECT create_hypertable('telemetry_fat', 'timestamp',
    chunk_time_interval => INTERVAL '1 hour',
    if_not_exists => TRUE
);

CREATE INDEX IF NOT EXISTS idx_telemetry_fat_session_driver
    ON telemetry_fat (session_id, driver_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_fat_reason
    ON telemetry_fat (session_id, reason, timestamp DESC);

SELECT add_compression_policy('telemetry_fat', INTERVAL '30 minutes', if_not_exists => TRUE);
SELECT add_retention_policy('telemetry_fat', INTERVAL '3 days', if_not_exists => TRUE);


-- =====================================================================
-- 3) SESSION_TIMING_SNAPSHOTS - 2 Hz timing board state
--
-- Purpose: Timing board replay, gap analysis, position history
-- Retention: Same as telemetry_thin (7 days)
-- =====================================================================

CREATE TABLE IF NOT EXISTS session_timing_snapshots (
    session_id          UUID NOT NULL,
    timestamp           TIMESTAMPTZ NOT NULL,
    session_time_ms     BIGINT NOT NULL,
    
    -- Serialized timing entries (JSONB for flexibility)
    entries             JSONB NOT NULL,
    
    -- Session state
    session_state       TEXT,  -- racing, caution, red_flag, etc.
    session_time_elapsed REAL,
    laps_remaining      INTEGER,
    leader_id           TEXT,
    
    -- Fastest lap info
    fastest_lap_driver  TEXT,
    fastest_lap_time    REAL,
    fastest_lap_number  INTEGER,
    
    received_at         TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (session_id, timestamp)
);

SELECT create_hypertable('session_timing_snapshots', 'timestamp',
    chunk_time_interval => INTERVAL '1 hour',
    if_not_exists => TRUE
);

CREATE INDEX IF NOT EXISTS idx_timing_session
    ON session_timing_snapshots (session_id, timestamp DESC);

SELECT add_compression_policy('session_timing_snapshots', INTERVAL '2 hours', if_not_exists => TRUE);
SELECT add_retention_policy('session_timing_snapshots', INTERVAL '7 days', if_not_exists => TRUE);


-- =====================================================================
-- 4) INCIDENTS - Detected incidents with telemetry window links
--
-- Purpose: Steward review, incident replay, driver notifications
-- Retention: 90 days (longer for compliance)
-- =====================================================================

CREATE TABLE IF NOT EXISTS incidents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL,
    
    -- Timing
    detected_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    incident_time_ms    BIGINT NOT NULL,  -- session time when incident occurred
    
    -- Involved parties
    involved_drivers    TEXT[] NOT NULL,  -- array of driver_ids
    primary_driver_id   TEXT,  -- main driver (if applicable)
    
    -- Classification
    trigger_type        TEXT NOT NULL,  -- contact, off_track, unsafe_rejoin, pit_violation, etc.
    severity            TEXT DEFAULT 'minor',  -- minor, moderate, major
    confidence          REAL DEFAULT 1.0,  -- 0-1 detection confidence
    
    -- Telemetry window
    window_start_ms     BIGINT NOT NULL,  -- 10s before
    window_end_ms       BIGINT,           -- 10s after (null if ongoing)
    
    -- Status
    status              TEXT DEFAULT 'detected',  -- detected, under_review, resolved, dismissed
    
    -- Metadata
    description         TEXT,
    detection_source    TEXT DEFAULT 'automatic',  -- automatic, manual, reported
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_incident_session FOREIGN KEY (session_id) 
        REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incidents_session ON incidents (session_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_involved ON incidents USING GIN (involved_drivers);


-- =====================================================================
-- 5) STEWARD_ACTIONS - Decisions and penalties applied to incidents
--
-- Purpose: Audit trail, penalty enforcement, visibility control
-- Retention: 1 year (compliance requirement)
-- =====================================================================

CREATE TABLE IF NOT EXISTS steward_actions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id         UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    
    -- Decision
    action_type         TEXT NOT NULL,  -- warning, time_penalty, position_penalty, dsq, no_action
    penalty_amount      INTEGER,        -- seconds for time penalty, positions for position penalty
    
    -- Steward info
    steward_id          UUID,  -- user who made decision
    steward_notes       TEXT,
    
    -- Timing
    applied_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_from      TIMESTAMPTZ,  -- when penalty takes effect
    
    -- Visibility rules (who can see this decision)
    visibility          TEXT DEFAULT 'all',  -- all, stewards_only, affected_only
    broadcast_allowed   BOOLEAN DEFAULT TRUE,
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_steward_actions_incident ON steward_actions (incident_id);
CREATE INDEX IF NOT EXISTS idx_steward_actions_time ON steward_actions (applied_at DESC);


-- =====================================================================
-- 6) TELEMETRY_PERSISTENCE_LOG - Track what's been persisted (debugging)
--
-- Purpose: Debugging, metrics, gap detection
-- Retention: 1 day
-- =====================================================================

CREATE TABLE IF NOT EXISTS telemetry_persistence_log (
    session_id          UUID NOT NULL,
    timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    frames_thin         INTEGER DEFAULT 0,
    frames_fat          INTEGER DEFAULT 0,
    frames_dropped      INTEGER DEFAULT 0,
    flush_duration_ms   INTEGER,
    
    PRIMARY KEY (session_id, timestamp)
);

SELECT create_hypertable('telemetry_persistence_log', 'timestamp',
    chunk_time_interval => INTERVAL '1 hour',
    if_not_exists => TRUE
);

SELECT add_retention_policy('telemetry_persistence_log', INTERVAL '1 day', if_not_exists => TRUE);


-- =====================================================================
-- Helper function: Get incident replay window
-- =====================================================================

CREATE OR REPLACE FUNCTION get_incident_replay_window(p_incident_id UUID)
RETURNS TABLE (
    session_id UUID,
    start_ms BIGINT,
    end_ms BIGINT,
    involved_drivers TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.session_id,
        i.window_start_ms,
        COALESCE(i.window_end_ms, i.incident_time_ms + 10000) as end_ms,
        i.involved_drivers
    FROM incidents i
    WHERE i.id = p_incident_id;
END;
$$ LANGUAGE plpgsql;

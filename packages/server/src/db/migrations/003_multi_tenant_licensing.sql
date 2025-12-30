-- =====================================================================
-- Multi-Tenant Licensing Schema (Week 11)
-- Postgres DDL for organizations, users, licenses, and access control
-- =====================================================================

-- =====================================================================
-- Organizations
-- =====================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- =====================================================================
-- Users
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    password_hash VARCHAR(255),  -- null for SSO users
    auth_provider VARCHAR(50) DEFAULT 'local',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- =====================================================================
-- Memberships (user <-> org relationship)
-- =====================================================================

CREATE TYPE membership_role AS ENUM (
    'owner',
    'admin',
    'race_control',
    'team_manager',
    'driver',
    'broadcast',
    'viewer'
);

CREATE TYPE membership_status AS ENUM ('active', 'invited', 'suspended');

CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role membership_role NOT NULL DEFAULT 'viewer',
    status membership_status NOT NULL DEFAULT 'invited',
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

CREATE INDEX idx_memberships_org ON memberships(org_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);

-- =====================================================================
-- Teams (within an org)
-- =====================================================================

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7),  -- hex color
    logo_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_org ON teams(org_id);

-- =====================================================================
-- Team Members
-- =====================================================================

CREATE TYPE team_role AS ENUM ('manager', 'engineer', 'driver', 'spotter');

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role team_role NOT NULL DEFAULT 'driver',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- =====================================================================
-- Driver Roster (active drivers for sessions)
-- =====================================================================

CREATE TABLE IF NOT EXISTS driver_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    driver_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    car_number VARCHAR(10),
    iracing_id VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, driver_user_id)
);

CREATE INDEX idx_driver_roster_org ON driver_roster(org_id);
CREATE INDEX idx_driver_roster_driver ON driver_roster(driver_user_id);

-- =====================================================================
-- License Plans
-- =====================================================================

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    surfaces VARCHAR(20)[] NOT NULL DEFAULT '{}',  -- blackbox, controlbox, racebox
    capabilities VARCHAR(100)[] NOT NULL DEFAULT '{}',
    seat_limit INTEGER DEFAULT 5,
    session_limit INTEGER DEFAULT NULL,  -- null = unlimited
    replay_retention_days INTEGER DEFAULT 30,
    price_cents INTEGER DEFAULT 0,
    billing_interval VARCHAR(20) DEFAULT 'monthly',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO plans (id, name, surfaces, capabilities, seat_limit, replay_retention_days, price_cents) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Free', 
     ARRAY['blackbox']::VARCHAR[], 
     ARRAY['blackbox:telemetry:view']::VARCHAR[], 
     2, 7, 0),
    ('00000000-0000-0000-0000-000000000002', 'Team', 
     ARRAY['blackbox', 'controlbox']::VARCHAR[], 
     ARRAY['blackbox:telemetry:view', 'blackbox:telemetry:fat', 'blackbox:replay:view', 'controlbox:incidents:view']::VARCHAR[], 
     10, 30, 2900),
    ('00000000-0000-0000-0000-000000000003', 'League', 
     ARRAY['blackbox', 'controlbox', 'racebox']::VARCHAR[], 
     ARRAY['blackbox:telemetry:view', 'blackbox:telemetry:fat', 'blackbox:replay:view', 'blackbox:team:manage', 'controlbox:incidents:view', 'controlbox:incidents:manage', 'controlbox:penalties:view', 'controlbox:penalties:apply', 'controlbox:session:manage', 'racebox:overlay:view', 'racebox:director:control', 'racebox:timing:access', 'racebox:social:export']::VARCHAR[], 
     50, 90, 9900),
    ('00000000-0000-0000-0000-000000000004', 'Enterprise', 
     ARRAY['blackbox', 'controlbox', 'racebox']::VARCHAR[], 
     ARRAY['blackbox:telemetry:view', 'blackbox:telemetry:fat', 'blackbox:replay:view', 'blackbox:team:manage', 'controlbox:incidents:view', 'controlbox:incidents:manage', 'controlbox:penalties:view', 'controlbox:penalties:apply', 'controlbox:session:manage', 'controlbox:rulebook:edit', 'racebox:overlay:view', 'racebox:overlay:configure', 'racebox:director:control', 'racebox:timing:access', 'racebox:social:export', 'admin:users:manage', 'admin:orgs:manage']::VARCHAR[], 
     NULL, 365, 29900);

-- =====================================================================
-- Licenses (org subscription)
-- =====================================================================

CREATE TYPE license_status AS ENUM ('active', 'trial', 'expired', 'cancelled', 'suspended');

CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status license_status NOT NULL DEFAULT 'trial',
    seats_used INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    stripe_subscription_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_licenses_org ON licenses(org_id);
CREATE INDEX idx_licenses_status ON licenses(status);

-- =====================================================================
-- API Keys (for relay agents, watchers, integrations)
-- =====================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(8) NOT NULL,  -- first 8 chars for identification
    key_hash VARCHAR(255) NOT NULL,  -- bcrypt hash of full key
    scopes VARCHAR(50)[] NOT NULL DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_org ON api_keys(org_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- =====================================================================
-- Sessions (org-bound)
-- =====================================================================

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_sessions_org ON sessions(org_id);

-- =====================================================================
-- Audit Log
-- =====================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Partition by time for performance (optional, comment out if not using TimescaleDB)
-- SELECT create_hypertable('audit_logs', 'created_at', if_not_exists => TRUE);

// =====================================================================
// Claims Derivation (Week 11)
// Derive user claims from database entities.
// =====================================================================

import type { Surface, Role, Capability, UserClaims } from '@controlbox/common';
import { Pool } from 'pg';

// =====================================================================
// Types
// =====================================================================

interface DbMembership {
    org_id: string;
    role: string;
    status: string;
}

interface DbLicense {
    plan_id: string;
    status: string;
    seats_used: number;
}

interface DbPlan {
    surfaces: string[];
    capabilities: string[];
    seat_limit: number | null;
}

interface DbUser {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
}

// =====================================================================
// Claims Derivation
// =====================================================================

/**
 * Derive full claims for a user based on their org membership and license.
 */
export async function deriveClaimsForUser(
    pool: Pool,
    userId: string,
    orgId: string
): Promise<UserClaims | null> {
    const client = await pool.connect();

    try {
        // Get user
        const userResult = await client.query<DbUser>(
            `SELECT id, email, name, avatar_url FROM users WHERE id = $1`,
            [userId]
        );
        if (userResult.rows.length === 0) return null;
        const user = userResult.rows[0];

        // Get membership
        const membershipResult = await client.query<DbMembership>(
            `SELECT org_id, role, status FROM memberships 
             WHERE user_id = $1 AND org_id = $2 AND status = 'active'`,
            [userId, orgId]
        );
        if (membershipResult.rows.length === 0) return null;
        const membership = membershipResult.rows[0];

        // Get active license + plan
        const licenseResult = await client.query<DbLicense & DbPlan>(
            `SELECT l.plan_id, l.status, l.seats_used, 
                    p.surfaces, p.capabilities, p.seat_limit
             FROM licenses l
             JOIN plans p ON p.id = l.plan_id
             WHERE l.org_id = $1 AND l.status IN ('active', 'trial')
             ORDER BY l.created_at DESC LIMIT 1`,
            [orgId]
        );

        let surfaces: Surface[] = [];
        let capabilities: Capability[] = [];

        if (licenseResult.rows.length > 0) {
            const license = licenseResult.rows[0];
            surfaces = license.surfaces as Surface[];
            capabilities = license.capabilities as Capability[];
        }

        // Map membership role to claims role
        const roleMap: Record<string, Role> = {
            owner: 'admin',
            admin: 'admin',
            race_control: 'race_control',
            team_manager: 'team',
            driver: 'driver',
            broadcast: 'broadcast',
            viewer: 'guest',
        };

        const role = roleMap[membership.role] || 'guest';

        return {
            userId: user.id,
            orgId: orgId,
            role,
            surfaces,
            capabilities,
            displayName: user.name,
            avatarUrl: user.avatar_url || undefined,
        };

    } finally {
        client.release();
    }
}

/**
 * Get claims for all orgs a user belongs to.
 */
export async function getOrgsForUser(
    pool: Pool,
    userId: string
): Promise<{ orgId: string; orgName: string; role: string }[]> {
    const result = await pool.query(
        `SELECT o.id as org_id, o.name as org_name, m.role
         FROM memberships m
         JOIN organizations o ON o.id = m.org_id
         WHERE m.user_id = $1 AND m.status = 'active'`,
        [userId]
    );

    return result.rows.map(r => ({
        orgId: r.org_id,
        orgName: r.org_name,
        role: r.role,
    }));
}

// =====================================================================
// Seat Enforcement
// =====================================================================

/**
 * Check if org has available seats for new users.
 */
export async function checkSeatAvailability(
    pool: Pool,
    orgId: string
): Promise<{ available: boolean; used: number; limit: number | null }> {
    const result = await pool.query(
        `SELECT l.seats_used, p.seat_limit
         FROM licenses l
         JOIN plans p ON p.id = l.plan_id
         WHERE l.org_id = $1 AND l.status IN ('active', 'trial')
         ORDER BY l.created_at DESC LIMIT 1`,
        [orgId]
    );

    if (result.rows.length === 0) {
        return { available: false, used: 0, limit: 0 };
    }

    const { seats_used, seat_limit } = result.rows[0];

    // null seat_limit = unlimited
    if (seat_limit === null) {
        return { available: true, used: seats_used, limit: null };
    }

    return {
        available: seats_used < seat_limit,
        used: seats_used,
        limit: seat_limit,
    };
}

/**
 * Increment seat count when user is added.
 */
export async function incrementSeats(pool: Pool, orgId: string): Promise<void> {
    await pool.query(
        `UPDATE licenses 
         SET seats_used = seats_used + 1, updated_at = NOW()
         WHERE org_id = $1 AND status IN ('active', 'trial')`,
        [orgId]
    );
}

/**
 * Decrement seat count when user is removed.
 */
export async function decrementSeats(pool: Pool, orgId: string): Promise<void> {
    await pool.query(
        `UPDATE licenses 
         SET seats_used = GREATEST(0, seats_used - 1), updated_at = NOW()
         WHERE org_id = $1 AND status IN ('active', 'trial')`,
        [orgId]
    );
}

// =====================================================================
// DEV Mode Claims (for testing)
// =====================================================================

const DEV_AUTH_ENABLED = process.env.DEV_AUTH_MODE === 'true';

/**
 * Parse dev claims from query params (only if DEV_AUTH_MODE=true).
 */
export function parseDevClaims(
    searchParams: URLSearchParams | Record<string, string>
): UserClaims | null {
    if (!DEV_AUTH_ENABLED) {
        console.warn('DEV claims disabled in production');
        return null;
    }

    const params = searchParams instanceof URLSearchParams
        ? Object.fromEntries(searchParams)
        : searchParams;

    const devRole = params.devRole;
    const devSurface = params.devSurface;

    if (!devRole) return null;

    const roleMap: Record<string, Role> = {
        driver: 'driver',
        team: 'team',
        race_control: 'race_control',
        broadcast: 'broadcast',
        admin: 'admin',
        guest: 'guest',
    };

    const role = roleMap[devRole] || 'guest';

    // Default capabilities by role
    const defaultCaps: Record<Role, Capability[]> = {
        admin: [
            'blackbox:telemetry:view', 'blackbox:telemetry:fat', 'blackbox:replay:view',
            'controlbox:incidents:view', 'controlbox:incidents:manage',
            'controlbox:penalties:view', 'controlbox:penalties:apply',
            'racebox:director:control', 'racebox:social:export',
            'admin:users:manage', 'admin:orgs:manage',
        ],
        race_control: [
            'controlbox:incidents:view', 'controlbox:incidents:manage',
            'controlbox:penalties:view', 'controlbox:penalties:apply',
            'controlbox:session:manage',
        ],
        team: [
            'blackbox:telemetry:view', 'blackbox:telemetry:fat',
            'blackbox:replay:view', 'blackbox:team:manage',
        ],
        driver: ['blackbox:telemetry:view', 'blackbox:telemetry:fat'],
        broadcast: ['racebox:overlay:view', 'racebox:timing:access'],
        guest: ['racebox:timing:access'],
    };

    return {
        userId: 'dev-user',
        orgId: 'dev-org',
        role,
        surfaces: devSurface ? [devSurface as Surface] : ['blackbox', 'controlbox', 'racebox'],
        capabilities: defaultCaps[role] || [],
        displayName: `DEV ${role}`,
    };
}

export const claimsDerivation = {
    deriveClaimsForUser,
    getOrgsForUser,
    checkSeatAvailability,
    incrementSeats,
    decrementSeats,
    parseDevClaims,
};

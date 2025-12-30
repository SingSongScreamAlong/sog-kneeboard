// =====================================================================
// Claims Types (Week 7)
// Unified claims model for role, surfaces, and capabilities.
// =====================================================================

/**
 * Available surfaces in the unified app.
 */
export type Surface = 'blackbox' | 'controlbox' | 'racebox';

/**
 * User roles across the platform.
 */
export type Role = 'driver' | 'team' | 'race_control' | 'broadcast' | 'admin' | 'guest';

/**
 * Feature capabilities (granular permissions).
 */
export type Capability =
    // BlackBox capabilities
    | 'blackbox:telemetry:view'
    | 'blackbox:telemetry:fat'
    | 'blackbox:replay:view'
    | 'blackbox:team:manage'
    // ControlBox capabilities
    | 'controlbox:incidents:view'
    | 'controlbox:incidents:manage'
    | 'controlbox:penalties:view'
    | 'controlbox:penalties:apply'
    | 'controlbox:session:manage'
    | 'controlbox:rulebook:edit'
    // RaceBox capabilities (Week 8-9)
    | 'racebox:overlay:view'
    | 'racebox:overlay:configure'
    | 'racebox:director:control'
    | 'racebox:timing:access'
    | 'racebox:social:export'
    // Admin capabilities
    | 'admin:users:manage'
    | 'admin:orgs:manage';

/**
 * User claims injected from auth or DEV mode.
 */
export interface UserClaims {
    userId: string;
    orgId: string;
    role: Role;
    surfaces: Surface[];
    capabilities: Capability[];
    displayName: string;
    avatarUrl?: string;
}

/**
 * Default claims for each role.
 */
export const DEFAULT_ROLE_CLAIMS: Record<Role, { surfaces: Surface[]; capabilities: Capability[] }> = {
    driver: {
        surfaces: ['blackbox'],
        capabilities: [
            'blackbox:telemetry:view',
            'blackbox:telemetry:fat',
            'blackbox:replay:view',
        ],
    },
    team: {
        surfaces: ['blackbox'],
        capabilities: [
            'blackbox:telemetry:view',
            'blackbox:telemetry:fat',
            'blackbox:replay:view',
            'blackbox:team:manage',
        ],
    },
    race_control: {
        surfaces: ['controlbox'],
        capabilities: [
            'controlbox:incidents:view',
            'controlbox:incidents:manage',
            'controlbox:penalties:view',
            'controlbox:penalties:apply',
            'controlbox:session:manage',
            'controlbox:rulebook:edit',
            'blackbox:telemetry:view',  // RC can view telemetry for forensics
            'blackbox:replay:view',
        ],
    },
    broadcast: {
        surfaces: ['blackbox', 'racebox'],
        capabilities: [
            'blackbox:telemetry:view',
            'racebox:overlay:view',
            'racebox:overlay:configure',
        ],
    },
    admin: {
        surfaces: ['blackbox', 'controlbox', 'racebox'],
        capabilities: [
            'blackbox:telemetry:view',
            'blackbox:telemetry:fat',
            'blackbox:replay:view',
            'blackbox:team:manage',
            'controlbox:incidents:view',
            'controlbox:incidents:manage',
            'controlbox:penalties:view',
            'controlbox:penalties:apply',
            'controlbox:session:manage',
            'controlbox:rulebook:edit',
            'racebox:overlay:view',
            'racebox:overlay:configure',
            'admin:users:manage',
            'admin:orgs:manage',
        ],
    },
    guest: {
        surfaces: [],
        capabilities: [],
    },
};

/**
 * Parse DEV query params for testing.
 * Usage: ?devRole=team&devSurface=blackbox&devCaps=blackbox:telemetry:view
 */
export function parseDevClaims(searchParams: URLSearchParams): Partial<UserClaims> | null {
    const devRole = searchParams.get('devRole') as Role | null;
    const devSurface = searchParams.get('devSurface') as Surface | null;
    const devCaps = searchParams.get('devCaps');

    if (!devRole) return null;

    const roleDefaults = DEFAULT_ROLE_CLAIMS[devRole] || DEFAULT_ROLE_CLAIMS.guest;

    return {
        userId: 'dev-user',
        orgId: 'dev-org',
        role: devRole,
        surfaces: devSurface ? [devSurface] : roleDefaults.surfaces,
        capabilities: devCaps
            ? (devCaps.split(',') as Capability[])
            : roleDefaults.capabilities,
        displayName: `DEV: ${devRole}`,
    };
}

/**
 * Check if claims allow access to a surface.
 */
export function canAccessSurface(claims: UserClaims, surface: Surface): boolean {
    return claims.surfaces.includes(surface);
}

/**
 * Check if claims have a specific capability.
 */
export function hasCapability(claims: UserClaims, capability: Capability): boolean {
    return claims.capabilities.includes(capability);
}

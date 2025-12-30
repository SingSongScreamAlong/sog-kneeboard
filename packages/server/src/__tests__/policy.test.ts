// =====================================================================
// Policy Unit Tests (Week 11)
// =====================================================================

import { describe, it, expect } from 'vitest';
import {
    canAccessSurface,
    canUseCapability,
    canJoinSession,
    canRequestFatFrames,
    canBroadcastCommand,
    canExportSocial,
    redactForRole,
    clampRate,
} from '../auth/policy.js';
import type { UserClaims } from '@controlbox/common';

// =====================================================================
// Test Fixtures
// =====================================================================

const adminClaims: UserClaims = {
    userId: 'user-admin',
    orgId: 'org-1',
    role: 'admin',
    surfaces: ['blackbox', 'controlbox', 'racebox'],
    capabilities: [
        'blackbox:telemetry:view',
        'blackbox:telemetry:fat',
        'blackbox:replay:view',
        'controlbox:incidents:manage',
        'controlbox:penalties:apply',
        'racebox:director:control',
        'racebox:social:export',
    ],
    displayName: 'Admin User',
};

const driverClaims: UserClaims = {
    userId: 'user-driver',
    orgId: 'org-1',
    role: 'driver',
    surfaces: ['blackbox'],
    capabilities: ['blackbox:telemetry:view', 'blackbox:telemetry:fat'],
    displayName: 'Driver User',
};

const teamClaims: UserClaims = {
    userId: 'user-team',
    orgId: 'org-1',
    role: 'team',
    surfaces: ['blackbox', 'controlbox'],
    capabilities: [
        'blackbox:telemetry:view',
        'blackbox:telemetry:fat',
        'blackbox:replay:view',
    ],
    displayName: 'Team Manager',
};

const broadcastClaims: UserClaims = {
    userId: 'user-broadcast',
    orgId: 'org-1',
    role: 'broadcast',
    surfaces: ['racebox'],
    capabilities: ['racebox:overlay:view', 'racebox:director:control', 'racebox:social:export'],
    displayName: 'Broadcaster',
};

const guestClaims: UserClaims = {
    userId: 'user-guest',
    orgId: 'org-1',
    role: 'guest',
    surfaces: ['racebox'],
    capabilities: ['racebox:timing:access'],
    displayName: 'Guest',
};

// =====================================================================
// Surface Access Tests
// =====================================================================

describe('canAccessSurface', () => {
    it('allows admin to access all surfaces', () => {
        expect(canAccessSurface(adminClaims, 'blackbox').allowed).toBe(true);
        expect(canAccessSurface(adminClaims, 'controlbox').allowed).toBe(true);
        expect(canAccessSurface(adminClaims, 'racebox').allowed).toBe(true);
    });

    it('restricts driver to blackbox only', () => {
        expect(canAccessSurface(driverClaims, 'blackbox').allowed).toBe(true);
        expect(canAccessSurface(driverClaims, 'controlbox').allowed).toBe(false);
        expect(canAccessSurface(driverClaims, 'racebox').allowed).toBe(false);
    });

    it('allows public access to racebox without auth', () => {
        expect(canAccessSurface(null, 'racebox').allowed).toBe(true);
    });

    it('denies unauthenticated access to blackbox/controlbox', () => {
        expect(canAccessSurface(null, 'blackbox').allowed).toBe(false);
        expect(canAccessSurface(null, 'controlbox').allowed).toBe(false);
    });
});

// =====================================================================
// Capability Tests
// =====================================================================

describe('canUseCapability', () => {
    it('allows user with capability', () => {
        expect(canUseCapability(adminClaims, 'blackbox:telemetry:view').allowed).toBe(true);
        expect(canUseCapability(adminClaims, 'controlbox:penalties:apply').allowed).toBe(true);
    });

    it('denies user without capability', () => {
        expect(canUseCapability(driverClaims, 'controlbox:incidents:manage').allowed).toBe(false);
        expect(canUseCapability(guestClaims, 'racebox:director:control').allowed).toBe(false);
    });

    it('denies unauthenticated users', () => {
        expect(canUseCapability(null, 'blackbox:telemetry:view').allowed).toBe(false);
    });
});

// =====================================================================
// Session Access Tests
// =====================================================================

describe('canJoinSession', () => {
    it('allows user in same org', () => {
        expect(canJoinSession(driverClaims, 'org-1').allowed).toBe(true);
    });

    it('denies user in different org', () => {
        expect(canJoinSession(driverClaims, 'org-2').allowed).toBe(false);
    });

    it('allows admin to join any session', () => {
        expect(canJoinSession(adminClaims, 'org-2').allowed).toBe(true);
    });

    it('allows public access for viewing', () => {
        expect(canJoinSession(null, 'org-1').allowed).toBe(true);
    });
});

// =====================================================================
// Fat Frame Access Tests
// =====================================================================

describe('canRequestFatFrames', () => {
    it('allows driver for own frames', () => {
        expect(canRequestFatFrames(driverClaims, 'user-driver', 'org-1').allowed).toBe(true);
    });

    it('denies driver for other driver frames', () => {
        expect(canRequestFatFrames(driverClaims, 'user-other', 'org-1').allowed).toBe(false);
    });

    it('allows team for any driver in org', () => {
        expect(canRequestFatFrames(teamClaims, 'user-driver', 'org-1').allowed).toBe(true);
        expect(canRequestFatFrames(teamClaims, 'user-other', 'org-1').allowed).toBe(true);
    });

    it('denies if wrong org', () => {
        expect(canRequestFatFrames(teamClaims, 'user-driver', 'org-2').allowed).toBe(false);
    });

    it('denies unauthenticated', () => {
        expect(canRequestFatFrames(null, 'user-driver', 'org-1').allowed).toBe(false);
    });
});

// =====================================================================
// Broadcast Command Tests
// =====================================================================

describe('canBroadcastCommand', () => {
    it('allows user with director capability', () => {
        expect(canBroadcastCommand(broadcastClaims).allowed).toBe(true);
    });

    it('denies user without director capability', () => {
        expect(canBroadcastCommand(driverClaims).allowed).toBe(false);
        expect(canBroadcastCommand(guestClaims).allowed).toBe(false);
    });
});

// =====================================================================
// Social Export Tests
// =====================================================================

describe('canExportSocial', () => {
    it('allows user with export capability', () => {
        expect(canExportSocial(broadcastClaims).allowed).toBe(true);
    });

    it('denies user without export capability', () => {
        expect(canExportSocial(driverClaims).allowed).toBe(false);
    });
});

// =====================================================================
// Redaction Tests
// =====================================================================

describe('redactForRole', () => {
    const fullPayload = {
        speed: 250,
        gear: 4,
        fuel: 45.5,
        tireWear: 0.15,
        setupHints: 'Lower rear wing',
        strategyNotes: 'Pit lap 20',
        radioText: 'Box box',
        gaps: { ahead: 1.5, behind: 2.0 },
    };

    it('does not redact for admin', () => {
        const result = redactForRole('admin', fullPayload);
        expect(result.fuel).toBeDefined();
        expect(result.setupHints).toBeDefined();
    });

    it('redacts setupHints for team', () => {
        const result = redactForRole('team', fullPayload);
        expect(result.fuel).toBeDefined();
        expect(result.setupHints).toBeUndefined();
    });

    it('redacts sensitive fields for broadcast', () => {
        const result = redactForRole('broadcast', fullPayload);
        expect(result.speed).toBeDefined();
        expect(result.fuel).toBeUndefined();
        expect(result.tireWear).toBeUndefined();
        expect(result.setupHints).toBeUndefined();
        expect(result.radioText).toBeUndefined();
    });

    it('redacts most fields for guest', () => {
        const result = redactForRole('guest', fullPayload);
        expect(result.speed).toBeDefined();
        expect(result.fuel).toBeUndefined();
        expect(result.gaps).toBeUndefined();
    });
});

// =====================================================================
// Rate Limiting Tests
// =====================================================================

describe('clampRate', () => {
    it('clamps to max rate for role', () => {
        expect(clampRate('driver', 100)).toBe(60);
        expect(clampRate('team', 100)).toBe(20);
        expect(clampRate('broadcast', 100)).toBe(5);
        expect(clampRate('guest', 100)).toBe(5);
    });

    it('allows lower rates', () => {
        expect(clampRate('driver', 10)).toBe(10);
        expect(clampRate('team', 5)).toBe(5);
    });
});

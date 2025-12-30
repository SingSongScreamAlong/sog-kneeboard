// =====================================================================
// Plan Definitions (Week 13)
// Authoritative plan data model with all limits and features.
// =====================================================================

import type { Surface, Role, Capability } from '@controlbox/common';

// =====================================================================
// Plan Types
// =====================================================================

export type PlanId = 'free' | 'team' | 'league' | 'broadcast' | 'enterprise';

export interface PlanFeatures {
    // Surfaces
    surfaces: Surface[];

    // Roles that can be assigned
    allowedRoles: Role[];

    // Seat limits
    seatLimit: number | null;  // null = unlimited

    // Telemetry
    telemetryRateHz: number;
    fatFramesAllowed: boolean;
    burstEscalationAllowed: boolean;

    // Retention (days)
    telemetryRetentionDays: number;
    timingRetentionDays: number;
    highlightRetentionDays: number;

    // Storage (GB)
    replayStorageGB: number;

    // Limits
    maxConcurrentSessions: number;
    maxSessionsPerMonth: number | null;  // null = unlimited
    maxOverlayClients: number;
    maxApiCallsPerHour: number | null;  // null = unlimited
    maxPublicSpectators: number;

    // Feature flags
    features: {
        replay: boolean;
        highlights: boolean;
        socialExport: boolean;
        customBranding: boolean;
        apiAccess: boolean;
        webhooks: boolean;
        ssoIntegration: boolean;
        dedicatedSupport: boolean;
        customRetention: boolean;
        whiteLabel: boolean;
    };
}

export interface Plan {
    id: PlanId;
    name: string;
    description: string;
    isPublic: boolean;  // Visible on pricing page
    isTrial: boolean;
    trialDays: number;
    features: PlanFeatures;

    // Stripe placeholders (no integration yet)
    stripePriceIdMonthly: string | null;
    stripePriceIdYearly: string | null;
}

// =====================================================================
// Plan Matrix (Authoritative)
// =====================================================================

export const PLANS: Record<PlanId, Plan> = {
    free: {
        id: 'free',
        name: 'Free',
        description: 'Personal use for individual drivers',
        isPublic: true,
        isTrial: false,
        trialDays: 0,
        features: {
            surfaces: ['blackbox'],
            allowedRoles: ['driver', 'guest'],
            seatLimit: 1,
            telemetryRateHz: 20,
            fatFramesAllowed: false,
            burstEscalationAllowed: false,
            telemetryRetentionDays: 7,
            timingRetentionDays: 14,
            highlightRetentionDays: 30,
            replayStorageGB: 1,
            maxConcurrentSessions: 1,
            maxSessionsPerMonth: 10,
            maxOverlayClients: 0,
            maxApiCallsPerHour: 100,
            maxPublicSpectators: 0,
            features: {
                replay: true,
                highlights: false,
                socialExport: false,
                customBranding: false,
                apiAccess: false,
                webhooks: false,
                ssoIntegration: false,
                dedicatedSupport: false,
                customRetention: false,
                whiteLabel: false,
            },
        },
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
    },

    team: {
        id: 'team',
        name: 'Team',
        description: 'For racing teams with multiple drivers',
        isPublic: true,
        isTrial: false,
        trialDays: 14,
        features: {
            surfaces: ['blackbox', 'controlbox'],
            allowedRoles: ['driver', 'team', 'guest'],
            seatLimit: 10,
            telemetryRateHz: 60,
            fatFramesAllowed: true,
            burstEscalationAllowed: true,
            telemetryRetentionDays: 14,
            timingRetentionDays: 60,
            highlightRetentionDays: 90,
            replayStorageGB: 10,
            maxConcurrentSessions: 3,
            maxSessionsPerMonth: 50,
            maxOverlayClients: 10,
            maxApiCallsPerHour: 1000,
            maxPublicSpectators: 10,
            features: {
                replay: true,
                highlights: true,
                socialExport: false,
                customBranding: false,
                apiAccess: true,
                webhooks: false,
                ssoIntegration: false,
                dedicatedSupport: false,
                customRetention: false,
                whiteLabel: false,
            },
        },
        stripePriceIdMonthly: 'price_team_monthly_placeholder',
        stripePriceIdYearly: 'price_team_yearly_placeholder',
    },

    league: {
        id: 'league',
        name: 'League',
        description: 'Full race control for organized leagues',
        isPublic: true,
        isTrial: false,
        trialDays: 14,
        features: {
            surfaces: ['blackbox', 'controlbox', 'racebox'],
            allowedRoles: ['driver', 'team', 'race_control', 'broadcast', 'guest'],
            seatLimit: 50,
            telemetryRateHz: 60,
            fatFramesAllowed: true,
            burstEscalationAllowed: true,
            telemetryRetentionDays: 30,
            timingRetentionDays: 90,
            highlightRetentionDays: 365,
            replayStorageGB: 50,
            maxConcurrentSessions: 10,
            maxSessionsPerMonth: 200,
            maxOverlayClients: 50,
            maxApiCallsPerHour: 5000,
            maxPublicSpectators: 100,
            features: {
                replay: true,
                highlights: true,
                socialExport: true,
                customBranding: true,
                apiAccess: true,
                webhooks: true,
                ssoIntegration: false,
                dedicatedSupport: false,
                customRetention: false,
                whiteLabel: false,
            },
        },
        stripePriceIdMonthly: 'price_league_monthly_placeholder',
        stripePriceIdYearly: 'price_league_yearly_placeholder',
    },

    broadcast: {
        id: 'broadcast',
        name: 'Broadcast',
        description: 'Professional broadcasting with all overlays',
        isPublic: true,
        isTrial: false,
        trialDays: 7,
        features: {
            surfaces: ['racebox'],
            allowedRoles: ['broadcast', 'guest'],
            seatLimit: 5,
            telemetryRateHz: 10,
            fatFramesAllowed: false,
            burstEscalationAllowed: false,
            telemetryRetentionDays: 7,
            timingRetentionDays: 30,
            highlightRetentionDays: 90,
            replayStorageGB: 5,
            maxConcurrentSessions: 5,
            maxSessionsPerMonth: 100,
            maxOverlayClients: 100,
            maxApiCallsPerHour: 2000,
            maxPublicSpectators: 500,
            features: {
                replay: false,
                highlights: true,
                socialExport: true,
                customBranding: true,
                apiAccess: true,
                webhooks: true,
                ssoIntegration: false,
                dedicatedSupport: false,
                customRetention: false,
                whiteLabel: false,
            },
        },
        stripePriceIdMonthly: 'price_broadcast_monthly_placeholder',
        stripePriceIdYearly: 'price_broadcast_yearly_placeholder',
    },

    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Custom configuration for large organizations',
        isPublic: false,  // Contact sales
        isTrial: false,
        trialDays: 0,
        features: {
            surfaces: ['blackbox', 'controlbox', 'racebox'],
            allowedRoles: ['driver', 'team', 'race_control', 'broadcast', 'admin', 'guest'],
            seatLimit: null,  // Unlimited
            telemetryRateHz: 60,
            fatFramesAllowed: true,
            burstEscalationAllowed: true,
            telemetryRetentionDays: 90,
            timingRetentionDays: 365,
            highlightRetentionDays: 365,
            replayStorageGB: 500,
            maxConcurrentSessions: 100,
            maxSessionsPerMonth: null,  // Unlimited
            maxOverlayClients: 200,
            maxApiCallsPerHour: null,  // Unlimited
            maxPublicSpectators: 1000,
            features: {
                replay: true,
                highlights: true,
                socialExport: true,
                customBranding: true,
                apiAccess: true,
                webhooks: true,
                ssoIntegration: true,
                dedicatedSupport: true,
                customRetention: true,
                whiteLabel: true,
            },
        },
        stripePriceIdMonthly: null,  // Custom pricing
        stripePriceIdYearly: null,
    },
};

// =====================================================================
// Plan Helpers
// =====================================================================

export function getPlan(planId: PlanId): Plan {
    return PLANS[planId] || PLANS.free;
}

export function getPublicPlans(): Plan[] {
    return Object.values(PLANS).filter(p => p.isPublic);
}

export function isPlanFeatureEnabled(planId: PlanId, feature: keyof PlanFeatures['features']): boolean {
    const plan = getPlan(planId);
    return plan.features.features[feature];
}

export function getPlanLimit(planId: PlanId, limit: keyof Omit<PlanFeatures, 'surfaces' | 'allowedRoles' | 'features'>): number | null {
    const plan = getPlan(planId);
    return plan.features[limit] as number | null;
}

// =====================================================================
// Plan Comparison
// =====================================================================

export type PlanComparisonResult = 'upgrade' | 'downgrade' | 'same' | 'lateral';

const PLAN_TIERS: Record<PlanId, number> = {
    free: 0,
    broadcast: 1,
    team: 2,
    league: 3,
    enterprise: 4,
};

export function comparePlans(fromPlan: PlanId, toPlan: PlanId): PlanComparisonResult {
    if (fromPlan === toPlan) return 'same';

    const fromTier = PLAN_TIERS[fromPlan];
    const toTier = PLAN_TIERS[toPlan];

    if (toTier > fromTier) return 'upgrade';
    if (toTier < fromTier) return 'downgrade';
    return 'lateral';
}

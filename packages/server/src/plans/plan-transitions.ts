// =====================================================================
// Plan Transitions (Week 13)
// Upgrade, downgrade, and plan change logic with safety checks.
// =====================================================================

import { pool } from '../db/pool.js';
import { getPlan, comparePlans, type PlanId, type PlanComparisonResult } from './plan-definitions.js';
import { quotaEnforcement } from './quota-enforcement.js';
import { auditLogger } from '../auth/audit.js';

// =====================================================================
// Types
// =====================================================================

export interface PlanChangePreview {
    fromPlan: PlanId;
    toPlan: PlanId;
    changeType: PlanComparisonResult;

    // Impact analysis
    impacts: PlanChangeImpact[];
    blockers: PlanChangeBlocker[];

    // Can proceed?
    canProceed: boolean;
    requiresConfirmation: boolean;
}

export interface PlanChangeImpact {
    resource: string;
    currentValue: number;
    newLimit: number | null;
    severity: 'info' | 'warning' | 'critical';
    message: string;
}

export interface PlanChangeBlocker {
    resource: string;
    currentValue: number;
    newLimit: number;
    message: string;
    resolution: string;
}

export interface PlanChangeResult {
    success: boolean;
    fromPlan: PlanId;
    toPlan: PlanId;
    changes: string[];
    errors: string[];
}

// =====================================================================
// Preview Plan Change
// =====================================================================

export async function previewPlanChange(
    orgId: string,
    newPlanId: PlanId
): Promise<PlanChangePreview> {
    // Get current plan
    const licenseResult = await pool.query(
        `SELECT p.id as plan_id FROM licenses l
         JOIN plans p ON p.id = l.plan_id
         WHERE l.org_id = $1 AND l.status IN ('active', 'trial')
         ORDER BY l.created_at DESC LIMIT 1`,
        [orgId]
    );

    const currentPlanId = (licenseResult.rows[0]?.plan_id || 'free') as PlanId;
    const currentPlan = getPlan(currentPlanId);
    const newPlan = getPlan(newPlanId);
    const changeType = comparePlans(currentPlanId, newPlanId);

    const impacts: PlanChangeImpact[] = [];
    const blockers: PlanChangeBlocker[] = [];

    // Check seat overflow
    const seatCheck = await quotaEnforcement.checkSeatAllocation(orgId, currentPlanId);
    const currentSeats = seatCheck.used;
    const newSeatLimit = newPlan.features.seatLimit;

    if (newSeatLimit !== null && currentSeats > newSeatLimit) {
        blockers.push({
            resource: 'seats',
            currentValue: currentSeats,
            newLimit: newSeatLimit,
            message: `You have ${currentSeats} seats but new plan allows ${newSeatLimit}`,
            resolution: `Remove ${currentSeats - newSeatLimit} team members before downgrading`,
        });
    } else if (newSeatLimit !== null && newSeatLimit < (currentPlan.features.seatLimit || Infinity)) {
        impacts.push({
            resource: 'seats',
            currentValue: currentSeats,
            newLimit: newSeatLimit,
            severity: 'warning',
            message: `Seat limit will decrease from ${currentPlan.features.seatLimit} to ${newSeatLimit}`,
        });
    }

    // Check storage overflow
    const storageCheck = await quotaEnforcement.checkReplayStorage(orgId, currentPlanId);
    const currentStorageGB = storageCheck.used;
    const newStorageLimit = newPlan.features.replayStorageGB;

    if (currentStorageGB > newStorageLimit) {
        impacts.push({
            resource: 'replay_storage',
            currentValue: currentStorageGB,
            newLimit: newStorageLimit,
            severity: 'critical',
            message: `You're using ${currentStorageGB.toFixed(1)} GB but new plan allows ${newStorageLimit} GB`,
        });
    }

    // Check retention reduction
    if (newPlan.features.telemetryRetentionDays < currentPlan.features.telemetryRetentionDays) {
        impacts.push({
            resource: 'telemetry_retention',
            currentValue: currentPlan.features.telemetryRetentionDays,
            newLimit: newPlan.features.telemetryRetentionDays,
            severity: 'warning',
            message: `Telemetry retention will decrease from ${currentPlan.features.telemetryRetentionDays} to ${newPlan.features.telemetryRetentionDays} days`,
        });
    }

    // Check disabled surfaces
    const lostSurfaces = currentPlan.features.surfaces.filter(
        s => !newPlan.features.surfaces.includes(s)
    );

    if (lostSurfaces.length > 0) {
        impacts.push({
            resource: 'surfaces',
            currentValue: currentPlan.features.surfaces.length,
            newLimit: newPlan.features.surfaces.length,
            severity: 'warning',
            message: `Access to ${lostSurfaces.join(', ')} will be removed`,
        });
    }

    // Check disabled features
    for (const [feature, enabled] of Object.entries(currentPlan.features.features)) {
        if (enabled && !newPlan.features.features[feature as keyof typeof newPlan.features.features]) {
            impacts.push({
                resource: `feature:${feature}`,
                currentValue: 1,
                newLimit: 0,
                severity: 'warning',
                message: `Feature '${feature}' will be disabled`,
            });
        }
    }

    return {
        fromPlan: currentPlanId,
        toPlan: newPlanId,
        changeType,
        impacts,
        blockers,
        canProceed: blockers.length === 0,
        requiresConfirmation: changeType === 'downgrade' || impacts.some(i => i.severity === 'critical'),
    };
}

// =====================================================================
// Apply Plan Change
// =====================================================================

export async function applyPlanChange(
    orgId: string,
    newPlanId: PlanId,
    userId: string,
    confirmed: boolean = false
): Promise<PlanChangeResult> {
    const preview = await previewPlanChange(orgId, newPlanId);

    if (!preview.canProceed) {
        return {
            success: false,
            fromPlan: preview.fromPlan,
            toPlan: preview.toPlan,
            changes: [],
            errors: preview.blockers.map(b => b.message),
        };
    }

    if (preview.requiresConfirmation && !confirmed) {
        return {
            success: false,
            fromPlan: preview.fromPlan,
            toPlan: preview.toPlan,
            changes: [],
            errors: ['Plan change requires confirmation due to potential data impact'],
        };
    }

    const changes: string[] = [];
    const errors: string[] = [];

    try {
        // Get new plan DB ID
        const planResult = await pool.query(
            `SELECT id FROM plans WHERE name = $1`,
            [getPlan(newPlanId).name]
        );

        if (planResult.rows.length === 0) {
            errors.push('Plan not found in database');
            return { success: false, fromPlan: preview.fromPlan, toPlan: preview.toPlan, changes, errors };
        }

        const newPlanDbId = planResult.rows[0].id;

        // Update license
        await pool.query(
            `UPDATE licenses 
             SET plan_id = $1, updated_at = NOW()
             WHERE org_id = $2 AND status IN ('active', 'trial')`,
            [newPlanDbId, orgId]
        );
        changes.push(`Plan changed from ${preview.fromPlan} to ${preview.toPlan}`);

        // Apply retention changes if downgrading
        if (preview.changeType === 'downgrade') {
            const newPlan = getPlan(newPlanId);

            // Schedule old data cleanup
            await pool.query(
                `INSERT INTO scheduled_jobs (type, org_id, payload, run_at) VALUES
                 ('cleanup_retention', $1, $2, NOW() + INTERVAL '1 day')`,
                [orgId, JSON.stringify({ newRetentionDays: newPlan.features.telemetryRetentionDays })]
            );
            changes.push('Scheduled data cleanup for new retention policy');
        }

        // Audit log
        await auditLogger.audit({
            orgId,
            userId,
            action: preview.changeType === 'upgrade' ? 'license:upgrade' : 'license:downgrade',
            entityType: 'license',
            entityId: orgId,
            metadata: {
                fromPlan: preview.fromPlan,
                toPlan: preview.toPlan,
                impacts: preview.impacts.length,
            },
        });

        return {
            success: true,
            fromPlan: preview.fromPlan,
            toPlan: preview.toPlan,
            changes,
            errors,
        };

    } catch (err) {
        console.error('Plan change error:', err);
        errors.push('Failed to apply plan change');
        return { success: false, fromPlan: preview.fromPlan, toPlan: preview.toPlan, changes, errors };
    }
}

// =====================================================================
// Export
// =====================================================================

export const planTransitions = {
    previewPlanChange,
    applyPlanChange,
};

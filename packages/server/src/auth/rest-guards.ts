// =====================================================================
// REST Route Middleware (Week 11)
// Protect REST routes using the policy engine.
// =====================================================================

import type { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { policy, type PolicyResult } from './policy.js';
import { claimsDerivation } from './claims.js';
import { pool } from '../db/pool.js';
import type { Surface, Capability, UserClaims } from '@controlbox/common';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DEV_AUTH_ENABLED = process.env.DEV_AUTH_MODE === 'true';

// =====================================================================
// Extend Request with claims
// =====================================================================

declare global {
    namespace Express {
        interface Request {
            claims?: UserClaims;
            apiKey?: { orgId: string; scopes: string[] };
        }
    }
}

// =====================================================================
// Auth Middleware
// =====================================================================

/**
 * Extract and verify JWT, attach claims to request.
 */
export function authMiddleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Check for DEV claims first (only if enabled)
        if (DEV_AUTH_ENABLED && req.query.devRole) {
            const devClaims = claimsDerivation.parseDevClaims(req.query as Record<string, string>);
            if (devClaims) {
                req.claims = devClaims;
                req.headers['x-user-id'] = devClaims.userId;
                req.headers['x-org-id'] = devClaims.orgId;
                req.headers['x-user-role'] = devClaims.role;
                return next();
            }
        }

        const authHeader = req.headers.authorization;

        // No auth header - proceed without claims (for public endpoints)
        if (!authHeader?.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.slice(7);

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {
                userId: string;
                orgId: string;
                role: string;
            };

            // Derive full claims from DB
            const claims = await claimsDerivation.deriveClaimsForUser(
                pool,
                decoded.userId,
                decoded.orgId
            );

            if (claims) {
                req.claims = claims;
                req.headers['x-user-id'] = claims.userId;
                req.headers['x-org-id'] = claims.orgId;
                req.headers['x-user-role'] = claims.role;
            }

            next();
        } catch (err) {
            // Invalid token - proceed without claims
            next();
        }
    };
}

// =====================================================================
// Require Auth Middleware
// =====================================================================

/**
 * Require authentication - return 401 if not authenticated.
 */
export function requireAuth() {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.claims) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }
        next();
    };
}

// =====================================================================
// Surface Guard Middleware
// =====================================================================

/**
 * Require access to a specific surface.
 */
export function requireSurface(surface: Surface) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = policy.canAccessSurface(req.claims || null, surface);

        if (!result.allowed) {
            res.status(403).json({
                success: false,
                error: result.reason || `Access to ${surface} denied`,
            });
            return;
        }

        next();
    };
}

// =====================================================================
// Capability Guard Middleware
// =====================================================================

/**
 * Require a specific capability.
 */
export function requireCapability(capability: Capability) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = policy.canUseCapability(req.claims || null, capability);

        if (!result.allowed) {
            res.status(403).json({
                success: false,
                error: result.reason || `Capability ${capability} required`,
            });
            return;
        }

        next();
    };
}

// =====================================================================
// Org Membership Guard
// =====================================================================

/**
 * Require membership in the org from :orgId param.
 */
export function requireOrgMembership() {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { orgId } = req.params;

        if (!req.claims) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        // Admin can access any org
        if (req.claims.role === 'admin') {
            return next();
        }

        if (req.claims.orgId !== orgId) {
            res.status(403).json({
                success: false,
                error: 'Not a member of this organization',
            });
            return;
        }

        next();
    };
}

// =====================================================================
// Session Access Guard
// =====================================================================

/**
 * Require access to the session from :sessionId param.
 * Looks up session's orgId and checks membership.
 */
export function requireSessionAccess() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { sessionId } = req.params;

        if (!sessionId) {
            return next();
        }

        try {
            const result = await pool.query(
                `SELECT org_id FROM sessions WHERE id = $1`,
                [sessionId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: 'Session not found',
                });
                return;
            }

            const sessionOrgId = result.rows[0].org_id;
            const policyResult = policy.canJoinSession(req.claims || null, sessionOrgId);

            if (!policyResult.allowed) {
                res.status(403).json({
                    success: false,
                    error: policyResult.reason || 'Session access denied',
                });
                return;
            }

            // Attach session org to request for downstream use
            req.headers['x-session-org-id'] = sessionOrgId;
            next();

        } catch (err) {
            console.error('Session access check error:', err);
            res.status(500).json({
                success: false,
                error: 'Failed to check session access',
            });
        }
    };
}

// =====================================================================
// Role Guard Middleware
// =====================================================================

/**
 * Require one of the specified roles.
 */
export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.claims) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        if (!roles.includes(req.claims.role)) {
            res.status(403).json({
                success: false,
                error: `Role must be one of: ${roles.join(', ')}`,
            });
            return;
        }

        next();
    };
}

// =====================================================================
// Export
// =====================================================================

export const restGuards = {
    authMiddleware,
    requireAuth,
    requireSurface,
    requireCapability,
    requireOrgMembership,
    requireSessionAccess,
    requireRole,
};

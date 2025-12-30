// =====================================================================
// Auth Routes (Week 11)
// Login, logout, and claims endpoints.
// =====================================================================

import { Router, type Request, type Response } from 'express';
import { claimsDerivation } from '../auth/claims.js';
import { pool } from '../db/pool.js';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

// =====================================================================
// POST /api/auth/login
// =====================================================================

authRouter.post('/login', async (req: Request, res: Response) => {
    const { email, password, orgId } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password required',
        });
    }

    try {
        // Find user
        const userResult = await pool.query(
            `SELECT id, email, name, password_hash FROM users WHERE email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        const user = userResult.rows[0];

        // Check password
        if (!user.password_hash) {
            return res.status(401).json({
                success: false,
                error: 'Password login not enabled for this account',
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Get orgs for user
        const orgs = await claimsDerivation.getOrgsForUser(pool, user.id);

        if (orgs.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'No active organization membership',
            });
        }

        // Use provided orgId or default to first
        const selectedOrgId = orgId || orgs[0].orgId;

        // Derive claims
        const claims = await claimsDerivation.deriveClaimsForUser(pool, user.id, selectedOrgId);
        if (!claims) {
            return res.status(403).json({
                success: false,
                error: 'Unable to derive claims',
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                orgId: selectedOrgId,
                role: claims.role,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Update last login
        await pool.query(
            `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
            [user.id]
        );

        return res.json({
            success: true,
            data: {
                token,
                claims,
                orgs,
            },
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

// =====================================================================
// GET /api/auth/me
// =====================================================================

authRouter.get('/me', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'No token provided',
        });
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            orgId: string;
            role: string;
        };

        const claims = await claimsDerivation.deriveClaimsForUser(
            pool,
            decoded.userId,
            decoded.orgId
        );

        if (!claims) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token or membership expired',
            });
        }

        const orgs = await claimsDerivation.getOrgsForUser(pool, decoded.userId);

        return res.json({
            success: true,
            data: {
                claims,
                orgs,
            },
        });

    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
        });
    }
});

// =====================================================================
// POST /api/auth/switch-org
// =====================================================================

authRouter.post('/switch-org', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const { orgId } = req.body;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'No token provided',
        });
    }

    if (!orgId) {
        return res.status(400).json({
            success: false,
            error: 'orgId required',
        });
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
        };

        // Derive claims for new org
        const claims = await claimsDerivation.deriveClaimsForUser(pool, decoded.userId, orgId);
        if (!claims) {
            return res.status(403).json({
                success: false,
                error: 'Not a member of this organization',
            });
        }

        // Generate new token
        const newToken = jwt.sign(
            {
                userId: decoded.userId,
                orgId,
                role: claims.role,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
            success: true,
            data: {
                token: newToken,
                claims,
            },
        });

    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
        });
    }
});

// =====================================================================
// POST /api/auth/logout (placeholder for token invalidation)
// =====================================================================

authRouter.post('/logout', async (_req: Request, res: Response) => {
    // In a real implementation, we'd invalidate the token in Redis
    return res.json({
        success: true,
        data: { message: 'Logged out' },
    });
});

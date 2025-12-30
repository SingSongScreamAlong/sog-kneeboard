// =====================================================================
// API Key Routes (Week 11)
// Secure API key management for relay agents and integrations.
// =====================================================================

import { Router, type Request, type Response } from 'express';
import { pool } from '../db/pool.js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { policy } from '../auth/policy.js';

export const apiKeysRouter = Router();

// =====================================================================
// POST /api/orgs/:orgId/apikeys
// =====================================================================

apiKeysRouter.post('/:orgId/apikeys', async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { name, scopes, expiresInDays } = req.body;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    // Only admin/owner can create keys
    if (userRole !== 'admin' && userRole !== 'owner') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required',
        });
    }

    if (!name || !scopes || !Array.isArray(scopes)) {
        return res.status(400).json({
            success: false,
            error: 'Name and scopes array required',
        });
    }

    // Validate scopes
    const validScopes = [
        'relay:telemetry:write',
        'relay:timing:write',
        'watcher:observations:write',
        'api:read',
        'api:write',
    ];
    for (const scope of scopes) {
        if (!validScopes.includes(scope)) {
            return res.status(400).json({
                success: false,
                error: `Invalid scope: ${scope}`,
            });
        }
    }

    try {
        // Generate key: prefix (8 chars) + secret (32 chars)
        const prefix = crypto.randomBytes(4).toString('hex');
        const secret = crypto.randomBytes(32).toString('hex');
        const fullKey = `${prefix}_${secret}`;

        // Hash for storage
        const keyHash = await bcrypt.hash(secret, 10);

        // Calculate expiry
        const expiresAt = expiresInDays
            ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
            : null;

        // Insert
        const result = await pool.query(
            `INSERT INTO api_keys (org_id, name, key_prefix, key_hash, scopes, expires_at, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, name, key_prefix, scopes, expires_at, created_at`,
            [orgId, name, prefix, keyHash, scopes, expiresAt, userId]
        );

        const apiKey = result.rows[0];

        // Return the full key ONCE (never stored in plain text)
        return res.status(201).json({
            success: true,
            data: {
                id: apiKey.id,
                name: apiKey.name,
                key: fullKey,  // Only shown once!
                keyPrefix: apiKey.key_prefix,
                scopes: apiKey.scopes,
                expiresAt: apiKey.expires_at,
                createdAt: apiKey.created_at,
                warning: 'Save this key now. It will not be shown again.',
            },
        });

    } catch (err) {
        console.error('API key creation error:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to create API key',
        });
    }
});

// =====================================================================
// GET /api/orgs/:orgId/apikeys
// =====================================================================

apiKeysRouter.get('/:orgId/apikeys', async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const userRole = req.headers['x-user-role'] as string;

    if (userRole !== 'admin' && userRole !== 'owner') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required',
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, name, key_prefix, scopes, last_used_at, expires_at, created_at, revoked_at
             FROM api_keys WHERE org_id = $1
             ORDER BY created_at DESC`,
            [orgId]
        );

        return res.json({
            success: true,
            data: {
                keys: result.rows.map(k => ({
                    id: k.id,
                    name: k.name,
                    keyPrefix: k.key_prefix,
                    scopes: k.scopes,
                    lastUsedAt: k.last_used_at,
                    expiresAt: k.expires_at,
                    createdAt: k.created_at,
                    isRevoked: !!k.revoked_at,
                })),
            },
        });

    } catch (err) {
        console.error('API key list error:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to list API keys',
        });
    }
});

// =====================================================================
// DELETE /api/orgs/:orgId/apikeys/:keyId (Revoke)
// =====================================================================

apiKeysRouter.delete('/:orgId/apikeys/:keyId', async (req: Request, res: Response) => {
    const { orgId, keyId } = req.params;
    const userRole = req.headers['x-user-role'] as string;

    if (userRole !== 'admin' && userRole !== 'owner') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required',
        });
    }

    try {
        const result = await pool.query(
            `UPDATE api_keys SET revoked_at = NOW()
             WHERE id = $1 AND org_id = $2 AND revoked_at IS NULL
             RETURNING id`,
            [keyId, orgId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'API key not found or already revoked',
            });
        }

        return res.json({
            success: true,
            data: { revoked: true },
        });

    } catch (err) {
        console.error('API key revoke error:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to revoke API key',
        });
    }
});

// =====================================================================
// POST /api/orgs/:orgId/apikeys/:keyId/rotate
// =====================================================================

apiKeysRouter.post('/:orgId/apikeys/:keyId/rotate', async (req: Request, res: Response) => {
    const { orgId, keyId } = req.params;
    const userRole = req.headers['x-user-role'] as string;

    if (userRole !== 'admin' && userRole !== 'owner') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required',
        });
    }

    try {
        // Get existing key
        const existing = await pool.query(
            `SELECT name, scopes, expires_at FROM api_keys 
             WHERE id = $1 AND org_id = $2 AND revoked_at IS NULL`,
            [keyId, orgId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'API key not found',
            });
        }

        const oldKey = existing.rows[0];

        // Revoke old key
        await pool.query(
            `UPDATE api_keys SET revoked_at = NOW() WHERE id = $1`,
            [keyId]
        );

        // Create new key with same properties
        const prefix = crypto.randomBytes(4).toString('hex');
        const secret = crypto.randomBytes(32).toString('hex');
        const fullKey = `${prefix}_${secret}`;
        const keyHash = await bcrypt.hash(secret, 10);

        const result = await pool.query(
            `INSERT INTO api_keys (org_id, name, key_prefix, key_hash, scopes, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, key_prefix, scopes, expires_at, created_at`,
            [orgId, `${oldKey.name} (rotated)`, prefix, keyHash, oldKey.scopes, oldKey.expires_at]
        );

        return res.json({
            success: true,
            data: {
                id: result.rows[0].id,
                name: result.rows[0].name,
                key: fullKey,
                keyPrefix: prefix,
                scopes: result.rows[0].scopes,
                warning: 'Save this key now. It will not be shown again.',
            },
        });

    } catch (err) {
        console.error('API key rotate error:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to rotate API key',
        });
    }
});

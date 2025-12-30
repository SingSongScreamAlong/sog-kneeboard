// =====================================================================
// Highlights API Routes (Week 10)
// =====================================================================

import { Router, type Request, type Response } from 'express';
import {
    highlightsRegistry,
    type CreateHighlightRequest,
    type HighlightCreator,
} from '../highlights/highlights.registry.js';

export const highlightsRouter = Router();

// =====================================================================
// GET /api/highlights?sessionId=...
// =====================================================================

highlightsRouter.get('/', (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: 'sessionId query parameter required',
        });
    }

    const highlights = highlightsRegistry.getBySession(sessionId);

    // Filter by visibility based on user role (simplified)
    const role = req.headers['x-user-role'] as string || 'broadcast';
    const filtered = highlights.filter(h => {
        if (role === 'admin' || role === 'race_control') return true;
        if (h.visibility === 'broadcast') return true;
        if (h.visibility === role) return true;
        return false;
    });

    return res.json({
        success: true,
        data: {
            highlights: filtered,
            count: filtered.length,
        },
    });
});

// =====================================================================
// GET /api/highlights/:id
// =====================================================================

highlightsRouter.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    const highlight = highlightsRegistry.get(id);
    if (!highlight) {
        return res.status(404).json({
            success: false,
            error: 'Highlight not found',
        });
    }

    return res.json({
        success: true,
        data: highlight,
    });
});

// =====================================================================
// POST /api/highlights
// =====================================================================

highlightsRouter.post('/', (req: Request, res: Response) => {
    // Check capability
    const capabilities = (req.headers['x-user-capabilities'] as string || '').split(',');
    const role = req.headers['x-user-role'] as string || 'guest';

    // Allow director, steward, team, or admin to create highlights
    const allowedRoles = ['director', 'steward', 'team', 'admin', 'race_control'];
    if (!allowedRoles.includes(role)) {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to create highlights',
        });
    }

    const body = req.body as CreateHighlightRequest;

    if (!body.sessionId || !body.type || body.startMs === undefined || body.endMs === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: sessionId, type, startMs, endMs',
        });
    }

    // Validate time window
    if (body.endMs <= body.startMs) {
        return res.status(400).json({
            success: false,
            error: 'endMs must be greater than startMs',
        });
    }

    // Map role to creator
    const creatorMap: Record<string, HighlightCreator> = {
        director: 'director',
        steward: 'steward',
        team: 'team',
        admin: 'director',
        race_control: 'steward',
    };

    const highlight = highlightsRegistry.create(body, creatorMap[role] || 'director');

    return res.status(201).json({
        success: true,
        data: highlight,
    });
});

// =====================================================================
// PATCH /api/highlights/:id
// =====================================================================

highlightsRouter.patch('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const role = req.headers['x-user-role'] as string || 'guest';

    const allowedRoles = ['director', 'steward', 'team', 'admin', 'race_control'];
    if (!allowedRoles.includes(role)) {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to update highlights',
        });
    }

    const highlight = highlightsRegistry.get(id);
    if (!highlight) {
        return res.status(404).json({
            success: false,
            error: 'Highlight not found',
        });
    }

    const { title, notes, visibility, exported } = req.body;
    const updated = highlightsRegistry.update(id, { title, notes, visibility, exported });

    return res.json({
        success: true,
        data: updated,
    });
});

// =====================================================================
// DELETE /api/highlights/:id
// =====================================================================

highlightsRouter.delete('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const role = req.headers['x-user-role'] as string || 'guest';

    if (role !== 'admin' && role !== 'race_control') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to delete highlights',
        });
    }

    const deleted = highlightsRegistry.delete(id);
    if (!deleted) {
        return res.status(404).json({
            success: false,
            error: 'Highlight not found',
        });
    }

    return res.json({
        success: true,
        data: { deleted: true },
    });
});

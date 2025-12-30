// =====================================================================
// Incidents Routes
// =====================================================================

import { Router, type Request, type Response } from 'express';
import type { ListIncidentsParams, UpdateIncidentRequest } from '@controlbox/common';
import { IncidentRepository } from '../../db/repositories/incident.repo.js';

export const incidentsRouter = Router();
const incidentRepo = new IncidentRepository();

// GET /api/incidents - List incidents
incidentsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const params: ListIncidentsParams = {
            page: parseInt(req.query.page as string) || 1,
            pageSize: parseInt(req.query.pageSize as string) || 20,
            sessionId: req.query.sessionId as string,
            type: req.query.type as string,
            severity: req.query.severity as string,
            status: req.query.status as string,
            driverId: req.query.driverId as string,
        };

        const incidents = await incidentRepo.findAll(params);
        const total = await incidentRepo.count(params);

        res.json({
            success: true,
            data: incidents,
            meta: {
                page: params.page,
                pageSize: params.pageSize,
                totalCount: total,
                totalPages: Math.ceil(total / (params.pageSize || 20)),
            },
        });
    } catch {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incidents' },
        });
    }
});

// GET /api/incidents/:id - Get incident by ID
incidentsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const incident = await incidentRepo.findById(req.params.id);

        if (!incident) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Incident not found' },
            });
            return;
        }

        res.json({ success: true, data: incident });
    } catch {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incident' },
        });
    }
});

// PATCH /api/incidents/:id - Update incident (review)
incidentsRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const data: UpdateIncidentRequest = req.body;
        const incident = await incidentRepo.update(req.params.id, data);

        if (!incident) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Incident not found' },
            });
            return;
        }

        res.json({ success: true, data: incident });
    } catch {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Failed to update incident' },
        });
    }
});

// POST /api/incidents/:id/analyze - Trigger AI analysis
incidentsRouter.post('/:id/analyze', async (req: Request, res: Response): Promise<void> => {
    try {
        const incident = await incidentRepo.findById(req.params.id);

        if (!incident) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Incident not found' },
            });
            return;
        }

        // TODO: Integrate with AI analysis layer
        res.json({
            success: true,
            data: {
                recommendation: 'investigate',
                confidence: 0.75,
                reasoning: 'AI analysis placeholder - not yet implemented',
                faultAttribution: {},
                patterns: [],
                modelId: 'placeholder',
                analyzedAt: new Date(),
            },
        });
    } catch {
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Failed to analyze incident' },
        });
    }
});

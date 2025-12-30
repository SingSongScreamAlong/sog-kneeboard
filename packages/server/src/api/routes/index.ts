// =====================================================================
// API Routes Index
// =====================================================================

import { Router } from 'express';
import { sessionsRouter } from './sessions.js';
import { incidentsRouter } from './incidents.js';
import { penaltiesRouter } from './penalties.js';
import { rulebooksRouter } from './rulebooks.js';
import { reportsRouter } from './reports.js';
import { healthRouter } from './health.js';
import { devRouter } from './dev.js';
import { replayRouter } from './replay.js';
import { billingRouter } from './billing.js';

export const apiRouter = Router();

// Health check (no auth)
apiRouter.use('/health', healthRouter);

// Dev routes (blocked in production)
apiRouter.use('/dev', devRouter);

// Replay routes (Week 6)
apiRouter.use('/replay', replayRouter);

// Core routes
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/incidents', incidentsRouter);
apiRouter.use('/penalties', penaltiesRouter);
apiRouter.use('/rulebooks', rulebooksRouter);
apiRouter.use('/billing', billingRouter);

// Reports (nested under sessions)
apiRouter.use('/sessions', reportsRouter);

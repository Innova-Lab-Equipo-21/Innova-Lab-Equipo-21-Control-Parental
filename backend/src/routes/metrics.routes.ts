import { Router } from 'express';
import { z } from 'zod';
import { metricsController } from '../controllers/metrics.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

const timelineQuerySchema = z.object({
  query: z.object({
    day: z.enum(['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']).optional(),
    source: z.enum(['all', 'lotba', 'custom']).optional(),
  }),
});

router.get('/summary', requireAuth, (req, res, next) =>
  metricsController.getSummary(req, res, next),
);

router.get('/timeline', requireAuth, validateRequest(timelineQuerySchema), (req, res, next) =>
  metricsController.getTimeline(req, res, next),
);

export const metricsRoutes = router;

// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Rutas de Métricas y Actividad
// Archivo: src/routes/metrics.routes.ts
// Descripción: Endpoints para resumen de métricas, línea temporal, actividad consolidada
//              del responsable, actividad por dispositivo protegido y lectura de alertas.
// ==============================================================================

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

router.get('/activity', requireAuth, (req, res, next) =>
  metricsController.getActivityOverview(req, res, next),
);

router.get('/device/:deviceUuid/activity', (req, res, next) =>
  metricsController.getDeviceActivity(req, res, next),
);

router.patch('/security-events/:eventId/read', requireAuth, (req, res, next) =>
  metricsController.markSecurityEventAsRead(req, res, next),
);

export const metricsRoutes = router;

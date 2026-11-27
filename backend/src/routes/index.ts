// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/routes/index.ts
// Descripción: Enrutador principal de la API REST que consolida todos los módulos.
// ==============================================================================

import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { deviceRoutes } from './device.routes.js';
import { blocklistRoutes } from './blocklist.routes.js';
import { telemetryRoutes } from './telemetry.routes.js';
import { metricsRoutes } from './metrics.routes.js';
import { selfControlRoutes } from './selfControl.routes.js';

const router = Router();

// Endpoint de verificación de estado y salud del servicio
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    project: 'BA Protege+',
    timestamp: new Date().toISOString(),
  });
});

// Módulos funcionales de la API
router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/blocklist', blocklistRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/metrics', metricsRoutes);
router.use('/self-control', selfControlRoutes);

export const apiRouter = router;

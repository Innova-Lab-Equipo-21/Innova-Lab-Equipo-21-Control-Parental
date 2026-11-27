// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Rutas de Autoprotección (SelfControl)
// Archivo: src/routes/selfControl.routes.ts
// Descripción: Definición de endpoints REST autenticados para la gestión de autoprotección con bloqueo de 24h.
// ==============================================================================

import { Router } from 'express';
import { selfControlController } from '../controllers/selfControl.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/status', requireAuth, (req, res, next) =>
  selfControlController.getStatus(req, res, next),
);

router.post('/enable', requireAuth, (req, res, next) =>
  selfControlController.enable(req, res, next),
);

router.post('/disable', requireAuth, (req, res, next) =>
  selfControlController.disable(req, res, next),
);

export const selfControlRoutes = router;

// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/routes/blocklist.routes.ts
// Descripción: Rutas para consulta de listas oficiales LOTBA y gestión de listas personalizadas.
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { blocklistController } from '../controllers/blocklist.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

// Esquema para agregar dominio a lista personalizada
const addDomainSchema = z.object({
  body: z.object({
    domain: z.string().min(3, 'El dominio debe tener al menos 3 caracteres'),
    category: z.string().optional(),
  }),
});

// Esquema para actualizar dominio en lista personalizada
const updateDomainSchema = z.object({
  body: z.object({
    domain: z.string().min(3, 'El dominio debe tener al menos 3 caracteres').optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Ruta pública / dispositivo: Lista oficial LOTBA
router.get('/official', (req, res, next) => blocklistController.getOfficialList(req, res, next));

// Ruta para descarga consolidada de reglas por parte del dispositivo
router.get('/device/:deviceUuid', (req, res, next) =>
  blocklistController.getDeviceBlocklist(req, res, next),
);

// Rutas de lista personalizada para el responsable autenticado (CRUD completo)
router.get('/custom', requireAuth, (req, res, next) =>
  blocklistController.getCustomList(req, res, next),
);

router.post('/custom/domains', requireAuth, validateRequest(addDomainSchema), (req, res, next) =>
  blocklistController.addCustomDomain(req, res, next),
);

router.put(
  '/custom/domains/:domainId',
  requireAuth,
  validateRequest(updateDomainSchema),
  (req, res, next) => blocklistController.updateCustomDomain(req, res, next),
);

router.delete('/custom/domains/:domainId', requireAuth, (req, res, next) =>
  blocklistController.removeCustomDomain(req, res, next),
);

export const blocklistRoutes = router;

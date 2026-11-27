// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/routes/blocklist.routes.ts
// Descripción: Rutas para consulta de listas oficiales LOTBA, CRUD de sitios/apps personalizadas y reglas de Adulto Protegido.
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { blocklistController } from '../controllers/blocklist.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

const deviceLimitsSchema = z
  .record(z.string(), z.number().int().positive().nullable().optional())
  .nullable()
  .optional();

// Esquema para agregar dominio a lista personalizada (Responsable)
const addDomainSchema = z.object({
  body: z.object({
    domain: z.string().min(3, 'El dominio debe tener al menos 3 caracteres'),
    category: z.string().optional(),
    applyToAll: z.boolean().optional(),
    deviceIds: z.array(z.string()).optional(),
    createdBy: z.enum(['RESPONSABLE', 'ADULTO_PROTEGIDO']).optional(),
    createdByName: z.string().optional(),
    sourceDeviceId: z.string().optional(),
  }),
});

// Esquema para actualizar dominio en lista personalizada (Responsable)
const updateDomainSchema = z.object({
  body: z.object({
    domain: z.string().min(3, 'El dominio debe tener al menos 3 caracteres').optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
    applyToAll: z.boolean().optional(),
    deviceIds: z.array(z.string()).optional(),
  }),
});

// Esquema para agregar aplicación a lista personalizada (Responsable)
const addAppSchema = z.object({
  body: z.object({
    appName: z.string().trim().min(1, 'El nombre de la aplicación es requerido'),
    packageName: z.string().trim().optional(),
    category: z.string().optional(),
    applyToAll: z.boolean().optional(),
    deviceIds: z.array(z.string()).optional(),
    dailyLimitMinutes: z.number().int().positive().nullable().optional(),
    deviceLimits: deviceLimitsSchema,
    createdBy: z.enum(['RESPONSABLE', 'ADULTO_PROTEGIDO']).optional(),
    createdByName: z.string().optional(),
    sourceDeviceId: z.string().optional(),
  }),
});

// Esquema para actualizar aplicación en lista personalizada (Responsable)
const updateAppSchema = z.object({
  body: z.object({
    appName: z.string().trim().min(1, 'El nombre de la aplicación no puede estar vacío').optional(),
    packageName: z.string().trim().optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
    applyToAll: z.boolean().optional(),
    deviceIds: z.array(z.string()).optional(),
    dailyLimitMinutes: z.number().int().positive().nullable().optional(),
    deviceLimits: deviceLimitsSchema,
  }),
});

// Esquemas de inserción exclusiva para Adulto Protegido (sin PUT ni DELETE)
const addDeviceDomainSchema = z.object({
  body: z.object({
    domain: z.string().min(3, 'El dominio debe tener al menos 3 caracteres'),
    category: z.string().optional(),
  }),
});

const addDeviceAppSchema = z.object({
  body: z.object({
    appName: z.string().trim().min(1, 'El nombre de la aplicación es requerido'),
    packageName: z.string().trim().optional(),
    category: z.string().optional(),
  }),
});

// Ruta pública / dispositivo: Lista oficial LOTBA
router.get('/official', (req, res, next) => blocklistController.getOfficialList(req, res, next));

// Rutas por dispositivo protegido (lectura consolidada + inserción solo para Adulto Protegido)
router.get('/device/:deviceUuid', (req, res, next) =>
  blocklistController.getDeviceBlocklist(req, res, next),
);

router.post(
  '/device/:deviceUuid/domains',
  validateRequest(addDeviceDomainSchema),
  (req, res, next) => blocklistController.addDeviceCustomDomain(req, res, next),
);

router.post(
  '/device/:deviceUuid/apps',
  validateRequest(addDeviceAppSchema),
  (req, res, next) => blocklistController.addDeviceCustomApp(req, res, next),
);

// Rutas de lista personalizada para el responsable autenticado (CRUD completo de sitios y apps)
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

router.post('/custom/apps', requireAuth, validateRequest(addAppSchema), (req, res, next) =>
  blocklistController.addCustomApp(req, res, next),
);

router.put(
  '/custom/apps/:appId',
  requireAuth,
  validateRequest(updateAppSchema),
  (req, res, next) => blocklistController.updateCustomApp(req, res, next),
);

router.delete('/custom/apps/:appId', requireAuth, (req, res, next) =>
  blocklistController.removeCustomApp(req, res, next),
);

export const blocklistRoutes = router;

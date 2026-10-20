// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/routes/device.routes.ts
// Descripción: Rutas para pareamiento, gestión y configuración de dispositivos protegidos.
// ==============================================================================

import { Router } from 'express';
import  z from 'zod';
import { deviceController } from '../controllers/device.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

// Esquema para generar el codigo de pareamiento
const generatePairingSchema = z.object({
  body: z.object({
    childName: z.string () .min(1, "El nombre del menor es requerido"),
    gender: z.string() .min(1, "El genero es requerido"),
    personType: z.string() .min(1, "El tipo de pesona es requerido"),
    birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
    phone: z.string () .min(1,"El telefono es requerido"),
  }),
});
// Esquema para generar el código: datos del menor que completa el tutor
router.post('/pair/generate', requireAuth, validateRequest(generatePairingSchema), (req, res, next) =>
  deviceController.generatePairingCode(req, res, next)
);

// Esquema de confirmación de pareamiento desde el dispositivo del menor
const confirmPairingSchema = z.object({
  body: z.object({
    pairingCode: z.string().length(6, 'El código de pareamiento debe tener 6 dígitos'),
    deviceUuid: z.string().min(1, 'El UUID del dispositivo es requerido'),
    deviceName: z.string().min(1, 'El nombre del dispositivo es requerido'),
    childName: z.string().optional(),
    model: z.string().optional(),
    osVersion: z.string().optional(),
    appVersion: z.string().optional(),
  }),
});

// Esquema para actualización de configuración de protección
const updateConfigSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de dispositivo inválido'),
  }),
  body: z.object({
    protectionEnabled: z.boolean().optional(),
    blockGambling: z.boolean().optional(),
    blockCustomList: z.boolean().optional(),
    notifyOnBlock: z.boolean().optional(),
    notifyOnSecurity: z.boolean().optional(),
    heartbeatIntervalSec: z.number().min(10).max(3600).optional(),
  }),
});

// Rutas de pareamiento
router.post('/pair/generate', requireAuth, (req, res, next) =>
  deviceController.generatePairingCode(req, res, next),
);

router.post('/pair/confirm', validateRequest(confirmPairingSchema), (req, res, next) =>
  deviceController.confirmPairing(req, res, next),
);

// Rutas de gestión de dispositivos (exclusivas del responsable autenticado)
router.get('/', requireAuth, (req, res, next) => deviceController.listDevices(req, res, next));

router.get('/:id', requireAuth, (req, res, next) =>
  deviceController.getDeviceDetail(req, res, next),
);

router.patch('/:id/config', requireAuth, validateRequest(updateConfigSchema), (req, res, next) =>
  deviceController.updateConfig(req, res, next),
);

export const deviceRoutes = router;

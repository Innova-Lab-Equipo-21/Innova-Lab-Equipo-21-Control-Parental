// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/routes/device.routes.ts
// Descripción: Rutas para pareamiento, gestión y configuración de dispositivos protegidos.
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { deviceController } from '../controllers/device.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

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

// Esquema para solicitud de código de desactivación de antidesinstalación
const antiUninstallRequestSchema = z.object({
  body: z.object({
    deviceUuid: z.string().min(1, 'El UUID del dispositivo es requerido'),
  }),
});

// Esquema para verificación de código de 6 dígitos
const antiUninstallVerifySchema = z.object({
  body: z.object({
    deviceUuid: z.string().min(1, 'El UUID del dispositivo es requerido'),
    code: z.string().length(6, 'El código debe tener exactamente 6 dígitos'),
  }),
});

// Rutas de pareamiento
router.post('/pair/generate', requireAuth, (req, res, next) =>
  deviceController.generatePairingCode(req, res, next),
);

router.post('/pair/confirm', validateRequest(confirmPairingSchema), (req, res, next) =>
  deviceController.confirmPairing(req, res, next),
);

// Rutas de desactivación protegida de antidesinstalación (código de 6 dígitos enviado por email al tutor)
router.post(
  '/anti-uninstall/request-code',
  validateRequest(antiUninstallRequestSchema),
  (req, res, next) => deviceController.requestAntiUninstallCode(req, res, next),
);

router.post(
  '/anti-uninstall/invalidate-code',
  validateRequest(antiUninstallRequestSchema),
  (req, res, next) => deviceController.invalidateAntiUninstallCode(req, res, next),
);

router.post(
  '/anti-uninstall/verify-code',
  validateRequest(antiUninstallVerifySchema),
  (req, res, next) => deviceController.verifyAntiUninstallCode(req, res, next),
);

// Rutas de gestión de dispositivos (exclusivas del responsable autenticado)
router.get('/', requireAuth, (req, res, next) => deviceController.listDevices(req, res, next));

router.post('/', requireAuth, (req, res, next) => deviceController.createDevice(req, res, next));

router.get('/:id', requireAuth, (req, res, next) =>
  deviceController.getDeviceDetail(req, res, next),
);

router.put('/:id', requireAuth, (req, res, next) =>
  deviceController.updateDevice(req, res, next),
);

router.post('/:id/pair/generate', requireAuth, (req, res, next) =>
  deviceController.generatePairingCode(req, res, next),
);

router.patch('/:id/config', requireAuth, validateRequest(updateConfigSchema), (req, res, next) =>
  deviceController.updateConfig(req, res, next),
);

export const deviceRoutes = router;

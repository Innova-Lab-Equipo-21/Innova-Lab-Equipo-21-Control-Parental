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

// Esquema para generar el código: datos del menor que completa el tutor.
// Los valores de gender y personType deben coincidir con los enums Gender y PersonType de Prisma.
const generatePairingSchema = z.object({
  body: z.object({
    childName: z.string().trim().min(1, 'El nombre del protegido es requerido'),
    gender: z.enum(['MASCULINO', 'FEMENINO', 'OTRO', 'NO_INFORMADO'], {
      message: 'Género inválido',
    }),
    personType: z.enum(['MENOR', 'ADULTO'], { message: 'Tipo de persona inválido' }),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato AAAA-MM-DD')
      .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha de nacimiento inválida')
      .refine((v) => new Date(v) <= new Date(), 'La fecha de nacimiento no puede ser futura'),
    phone: z.string().trim().min(1, 'El teléfono es requerido'),
  }),
});

router.post('/pair/generate', requireAuth, validateRequest(generatePairingSchema), (req, res, next) =>
  deviceController.generatePairingCode(req, res, next),
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
// Rutas de pareamiento:
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

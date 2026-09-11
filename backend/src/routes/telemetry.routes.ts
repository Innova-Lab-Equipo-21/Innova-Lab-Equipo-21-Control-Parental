// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/routes/telemetry.routes.ts
// Descripción: Rutas para ingesta de latidos (heartbeat), reportes de bloqueo y eventos de seguridad.
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { telemetryController } from '../controllers/telemetry.controller.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

// Esquema de validación para latido (Heartbeat)
const heartbeatSchema = z.object({
  body: z.object({
    deviceUuid: z.string().min(1, 'El UUID del dispositivo es requerido'),
    vpnActive: z.boolean(),
    permissionsOk: z.boolean(),
    batteryLevel: z.number().min(0).max(100).optional(),
    isCharging: z.boolean().optional(),
    blocklistVersion: z.number(),
    appVersion: z.string().optional(),
  }),
});

// Esquema de validación para reporte de evento bloqueado
const blockedEventSchema = z.object({
  body: z.object({
    deviceUuid: z.string().min(1, 'El UUID del dispositivo es requerido'),
    attemptedDomain: z.string().min(1, 'El dominio bloqueado es requerido'),
    sourceListType: z.string().optional(),
  }),
});

// Esquema de validación para evento de seguridad anti-bypass
const securityEventSchema = z.object({
  body: z.object({
    deviceUuid: z.string().min(1, 'El UUID del dispositivo es requerido'),
    eventType: z.enum([
      'VPN_DISABLED',
      'PERMISSION_REVOKED',
      'APP_FORCE_STOP',
      'DEVICE_REBOOT',
      'NETWORK_CHANGE',
      'DNS_TAMPERING',
      'UNINSTALL_ATTEMPT',
    ]),
    description: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

router.post('/heartbeat', validateRequest(heartbeatSchema), (req, res, next) =>
  telemetryController.heartbeat(req, res, next),
);

router.post('/events/blocked', validateRequest(blockedEventSchema), (req, res, next) =>
  telemetryController.recordBlockedEvent(req, res, next),
);

router.post('/events/security', validateRequest(securityEventSchema), (req, res, next) =>
  telemetryController.recordSecurityEvent(req, res, next),
);

export const telemetryRoutes = router;

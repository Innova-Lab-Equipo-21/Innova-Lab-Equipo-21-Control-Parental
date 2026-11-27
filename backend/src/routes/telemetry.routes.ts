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
    permissions: z
      .object({
        vpn: z.boolean().optional(),
        accessibility: z.boolean().optional(),
        notifications: z.boolean().optional(),
        batteryOptimization: z.boolean().optional(),
        location: z.boolean().optional(),
        usageStats: z.boolean().optional(),
      })
      .optional(),
  }),
});

// Esquema de validación para reporte de evento bloqueado
const blockedEventSchema = z.object({
  body: z.object({
    deviceUuid: z.string().min(1, 'El UUID del dispositivo es requerido'),
    attemptedDomain: z.string().min(1, 'El dominio bloqueado es requerido'),
    sourceListType: z.string().optional(),
    itemType: z.enum(['SITE', 'APP', 'site', 'app']).optional(),
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

// Esquema de validación para progreso/resultado diario de pasatiempos
const pasatiempoProgressSchema = z.object({
  body: z.object({
    deviceUuid: z.string().min(1, 'El UUID del dispositivo es requerido'),
    dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    gameType: z.enum(['QUIZ', 'WORDSEARCH', 'MEMORY']),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    correctCount: z.number().int().min(0),
    wrongCount: z.number().int().min(0).optional(),
    totalItems: z.number().int().min(0),
    attempts: z.number().int().min(0).optional(),
    details: z.record(z.unknown()).nullable().optional(),
    completedAt: z.string().nullable().optional(),
  }),
});

// Esquema de validación para snapshot de uso diario de apps bloqueadas
const appUsageSnapshotSchema = z.object({
  body: z.object({
    deviceUuid: z.string().min(1, 'El UUID del dispositivo es requerido'),
    dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    apps: z.array(
      z.object({
        packageName: z.string().min(1),
        appName: z.string().min(1),
        usedMinutes: z.number().min(0),
        dailyLimitMinutes: z.number().min(0).nullable().optional(),
        isBlocked: z.boolean().optional(),
      }),
    ),
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

router.post('/pasatiempos', validateRequest(pasatiempoProgressSchema), (req, res, next) =>
  telemetryController.recordPasatiempo(req, res, next),
);

router.get('/pasatiempos/:deviceUuid', (req, res, next) =>
  telemetryController.getDevicePasatiempos(req, res, next),
);

router.post('/app-usage', validateRequest(appUsageSnapshotSchema), (req, res, next) =>
  telemetryController.recordAppUsage(req, res, next),
);

export const telemetryRoutes = router;

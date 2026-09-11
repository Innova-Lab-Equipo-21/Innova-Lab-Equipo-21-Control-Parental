// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/controllers/telemetry.controller.ts
// Descripción: Controlador HTTP para ingesta de latidos (heartbeat), eventos de bloqueo y seguridad.
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { telemetryService } from '../services/telemetry.service.js';
import { ApiResponse } from '../types/index.js';

export class TelemetryController {
  /**
   * Recibe y procesa el latido periódico de un dispositivo protegido.
   * POST /api/telemetry/heartbeat
   */
  public async heartbeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await telemetryService.processHeartbeat(req.body);

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registra un evento de intento de acceso bloqueado desde el dispositivo.
   * POST /api/telemetry/events/blocked
   */
  public async recordBlockedEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { deviceUuid, attemptedDomain, sourceListType } = req.body;
      const event = await telemetryService.recordBlockedEvent({
        deviceUuid,
        attemptedDomain,
        sourceListType,
      });

      res.status(201).json({
        success: true,
        message: 'Evento de bloqueo registrado exitosamente',
        data: event,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registra un evento de seguridad o intento de evasión (Anti-bypass).
   * POST /api/telemetry/events/security
   */
  public async recordSecurityEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { deviceUuid, eventType, description, metadata } = req.body;
      const event = await telemetryService.recordSecurityEvent({
        deviceUuid,
        eventType,
        description,
        metadata,
      });

      res.status(201).json({
        success: true,
        message: 'Evento de seguridad registrado exitosamente',
        data: event,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const telemetryController = new TelemetryController();

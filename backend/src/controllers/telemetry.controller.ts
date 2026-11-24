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
      const { deviceUuid, attemptedDomain, sourceListType, itemType } = req.body;
      const event = await telemetryService.recordBlockedEvent({
        deviceUuid,
        attemptedDomain,
        sourceListType,
        itemType,
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

  /**
   * Registra progreso o finalización de un pasatiempo (Quiz, Sopa de letras o Memoria).
   * POST /api/telemetry/pasatiempos
   */
  public async recordPasatiempo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await telemetryService.recordPasatiempoProgress(req.body);

      res.status(201).json({
        success: true,
        message: 'Progreso de pasatiempo registrado exitosamente',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el resumen e historial de pasatiempos de un dispositivo.
   * GET /api/telemetry/pasatiempos/:deviceUuid
   */
  public async getDevicePasatiempos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceUuid = String(req.params.deviceUuid || '');
      const dateKey = typeof req.query.dateKey === 'string' ? req.query.dateKey : undefined;
      const result = await telemetryService.getDevicePasatiempos(deviceUuid, dateKey);

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registra snapshot de consumo diario de aplicaciones bloqueadas.
   * POST /api/telemetry/app-usage
   */
  public async recordAppUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await telemetryService.recordAppUsageSnapshot(req.body);

      res.status(201).json({
        success: true,
        message: 'Uso diario de aplicaciones registrado exitosamente',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const telemetryController = new TelemetryController();

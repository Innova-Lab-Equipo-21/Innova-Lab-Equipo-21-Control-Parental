// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/controllers/device.controller.ts
// Descripción: Controlador HTTP para pareamiento, listado y configuración de dispositivos protegidos.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { deviceService } from '../services/device.service.js';
import { AuthenticatedRequest, ApiResponse } from '../types/index.js';
import { AppError } from '../middlewares/error.middleware.js';

export class DeviceController {
  /**
   * Genera un código de pareamiento temporal (exclusivo para responsables autenticados).
   * POST /api/devices/pair/generate
   */
  public async generatePairingCode(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const result = await deviceService.generatePairingCode({ userId });

      res.status(200).json({
        success: true,
        message: 'Código de pareamiento generado con éxito',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma la vinculación desde el dispositivo del menor.
   * POST /api/devices/pair/confirm
   */
  public async confirmPairing(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { pairingCode, deviceUuid, deviceName, childName, model, osVersion, appVersion } = req.body;

      const result = await deviceService.confirmPairing({
        pairingCode,
        deviceUuid,
        deviceName,
        childName,
        model,
        osVersion,
        appVersion,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todos los dispositivos vinculados al responsable autenticado.
   * GET /api/devices
   */
  public async listDevices(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const devices = await deviceService.getDevicesByUser(userId);

      res.status(200).json({
        success: true,
        data: devices,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el detalle de un dispositivo específico.
   * GET /api/devices/:id
   */
  public async getDeviceDetail(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const device = await deviceService.getDeviceDetail(userId, req.params.id);

      res.status(200).json({
        success: true,
        data: device,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza la configuración de protección de un dispositivo.
   * PATCH /api/devices/:id/config
   */
  public async updateConfig(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const updatedConfig = await deviceService.updateProtectionConfig({
        userId,
        deviceId: req.params.id,
        ...req.body,
      });

      res.status(200).json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: updatedConfig,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Solicita un código de verificación por correo al responsable para desactivar antidesinstalación.
   * POST /api/devices/anti-uninstall/request-code
   */
  public async requestAntiUninstallCode(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { deviceUuid } = req.body;
      const result = await deviceService.requestAntiUninstallCode({ deviceUuid });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Invalida el código de verificación activo de un dispositivo.
   * POST /api/devices/anti-uninstall/invalidate-code
   */
  public async invalidateAntiUninstallCode(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { deviceUuid } = req.body;
      const result = await deviceService.invalidateAntiUninstallCode({ deviceUuid });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica el código de 6 dígitos ingresado en el dispositivo protegido.
   * POST /api/devices/anti-uninstall/verify-code
   */
  public async verifyAntiUninstallCode(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { deviceUuid, code } = req.body;
      const result = await deviceService.verifyAntiUninstallCode({ deviceUuid, code });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const deviceController = new DeviceController();

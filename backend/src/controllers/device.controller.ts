// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/controllers/device.controller.ts
// Descripción: Controlador HTTP para pareamiento, listado, permisos, perfil por UUID, desvinculación y configuración de dispositivos.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { deviceService } from '../services/device.service.js';
import { AuthenticatedRequest, ApiResponse } from '../types/index.js';
import { AppError } from '../middlewares/error.middleware.js';

export class DeviceController {
  /**
   * Registra un nuevo dispositivo protegido y genera automáticamente su código de vinculación.
   * POST /api/devices
   */
  public async createDevice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const result = await deviceService.createDevice(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Dispositivo registrado y código de vinculación generado con éxito',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza los datos de un dispositivo protegido ya registrado.
   * PUT /api/devices/:id
   */
  public async updateDevice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const result = await deviceService.updateDevice(userId, req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Dispositivo actualizado exitosamente',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Genera o regenera un código de pareamiento (exclusivo para responsables autenticados).
   * POST /api/devices/pair/generate o POST /api/devices/:id/pair/generate
   */
  public async generatePairingCode(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const { childName, gender, personType, birthDate, phone } = req.body;
      const deviceId = req.params?.id || req.body?.deviceId;
      const result = await deviceService.generatePairingCode({
        userId,
        deviceId,
        childName,
        gender,
        personType,
        birthDate,
        phone,
      } as any);

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
      const { pairingCode, deviceUuid, deviceName, childName, model, osVersion, appVersion } =
        req.body;

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
   * Desvincula (desactiva) un dispositivo protegido de la cuenta del responsable.
   * DELETE /api/devices/:id
   */
  public async deleteDevice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const result = await deviceService.deleteDevice(userId, req.params.id);

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
   * Obtiene el estado real de permisos y último heartbeat de un dispositivo.
   * GET /api/devices/:id/permissions
   */
  public async getDevicePermissions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const result = await deviceService.getDevicePermissions(userId, req.params.id);

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el perfil público básico (nombre del protegido, tipo y responsable) por UUID.
   * GET /api/devices/by-uuid/:deviceUuid/profile
   */
  public async getDeviceProfileByUuid(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await deviceService.getDevicePublicProfileByUuid(req.params.deviceUuid);

      res.status(200).json({
        success: true,
        data: result,
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

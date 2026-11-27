// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/controllers/blocklist.controller.ts
// Descripción: Controlador HTTP para listas LOTBA, CRUD de sitios/apps personalizadas y reglas de Adulto Protegido.
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { blocklistService } from '../services/blocklist.service.js';
import { AuthenticatedRequest, ApiResponse } from '../types/index.js';
import { AppError } from '../middlewares/error.middleware.js';

export class BlocklistController {
  /**
   * Obtiene la lista oficial LOTBA.
   * GET /api/blocklist/official
   */
  public async getOfficialList(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await blocklistService.getOfficialLotbaList();

      res.status(200).json({
        success: true,
        data: list,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene las reglas consolidadas (LOTBA + sitios + apps) para un dispositivo protegido.
   * GET /api/blocklist/device/:deviceUuid
   */
  public async getDeviceBlocklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { deviceUuid } = req.params;
      const result = await blocklistService.getEffectiveBlocklistForDevice(deviceUuid);

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Agrega un sitio bloqueado desde un dispositivo Adulto Protegido (solo inserción).
   * POST /api/blocklist/device/:deviceUuid/domains
   */
  public async addDeviceCustomDomain(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { deviceUuid } = req.params;
      const { domain, category } = req.body;
      const created = await blocklistService.addDeviceCustomDomain(deviceUuid, {
        domain,
        category,
      });

      res.status(201).json({
        success: true,
        message: 'Sitio agregado exitosamente a la lista de bloqueo',
        data: created,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Agrega una aplicación bloqueada desde un dispositivo Adulto Protegido (solo inserción).
   * POST /api/blocklist/device/:deviceUuid/apps
   */
  public async addDeviceCustomApp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { deviceUuid } = req.params;
      const { appName, packageName, category } = req.body;
      const created = await blocklistService.addDeviceCustomApp(deviceUuid, {
        appName,
        packageName,
        category,
      });

      res.status(201).json({
        success: true,
        message: 'Aplicación agregada exitosamente a la lista de bloqueo',
        data: created,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene la lista personalizada completa (sitios + apps) del responsable autenticado.
   * GET /api/blocklist/custom
   */
  public async getCustomList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const list = await blocklistService.getUserCustomList(userId);

      res.status(200).json({
        success: true,
        data: list,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Agrega un nuevo dominio a la lista personalizada del responsable.
   * POST /api/blocklist/custom/domains
   */
  public async addCustomDomain(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const {
        domain,
        category,
        applyToAll,
        deviceIds,
        createdBy,
        createdByName,
        sourceDeviceId,
      } = req.body;
      const newDomain = await blocklistService.addCustomDomain({
        userId,
        domain,
        category,
        applyToAll,
        deviceIds,
        createdBy,
        createdByName,
        sourceDeviceId,
      });

      res.status(201).json({
        success: true,
        message: 'Dominio agregado exitosamente a la lista personalizada',
        data: newDomain,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza un dominio de la lista personalizada del responsable.
   * PUT /api/blocklist/custom/domains/:domainId
   */
  public async updateCustomDomain(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const { domain, category, isActive, applyToAll, deviceIds } = req.body;
      const updated = await blocklistService.updateCustomDomain({
        userId,
        domainId: req.params.domainId,
        domain,
        category,
        isActive,
        applyToAll,
        deviceIds,
      });

      res.status(200).json({
        success: true,
        message: 'Dominio actualizado exitosamente',
        data: updated,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina un dominio de la lista personalizada del responsable.
   * DELETE /api/blocklist/custom/domains/:domainId
   */
  public async removeCustomDomain(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const result = await blocklistService.removeCustomDomain({
        userId,
        domainId: req.params.domainId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Agrega una aplicación bloqueada / con límite diario a la lista personalizada del responsable.
   * POST /api/blocklist/custom/apps
   */
  public async addCustomApp(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const {
        appName,
        packageName,
        category,
        applyToAll,
        deviceIds,
        dailyLimitMinutes,
        deviceLimits,
        createdBy,
        createdByName,
        sourceDeviceId,
      } = req.body;
      const newApp = await blocklistService.addCustomApp({
        userId,
        appName,
        packageName,
        category,
        applyToAll,
        deviceIds,
        dailyLimitMinutes,
        deviceLimits,
        createdBy,
        createdByName,
        sourceDeviceId,
      });

      res.status(201).json({
        success: true,
        message: 'Aplicación agregada exitosamente a la lista personalizada',
        data: newApp,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una aplicación de la lista personalizada del responsable.
   * PUT /api/blocklist/custom/apps/:appId
   */
  public async updateCustomApp(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const {
        appName,
        packageName,
        category,
        isActive,
        applyToAll,
        deviceIds,
        dailyLimitMinutes,
        deviceLimits,
      } = req.body;

      const updatePayload: any = {
        userId,
        appId: req.params.appId,
        appName,
        packageName,
        category,
        isActive,
        applyToAll,
        deviceIds,
      };
      if (Object.prototype.hasOwnProperty.call(req.body, 'dailyLimitMinutes')) {
        updatePayload.dailyLimitMinutes = dailyLimitMinutes;
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'deviceLimits')) {
        updatePayload.deviceLimits = deviceLimits;
      }

      const updated = await blocklistService.updateCustomApp(updatePayload);

      res.status(200).json({
        success: true,
        message: 'Aplicación actualizada exitosamente',
        data: updated,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una aplicación de la lista personalizada del responsable.
   * DELETE /api/blocklist/custom/apps/:appId
   */
  public async removeCustomApp(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const result = await blocklistService.removeCustomApp({
        userId,
        appId: req.params.appId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const blocklistController = new BlocklistController();

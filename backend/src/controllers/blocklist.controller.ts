// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/controllers/blocklist.controller.ts
// Descripción: Controlador HTTP para consulta y sincronización de listas LOTBA y personalizadas.
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
   * Obtiene la lista consolidada de dominios para el motor de protección de un dispositivo.
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
   * Obtiene la lista personalizada del responsable autenticado.
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

      const { domain, category } = req.body;
      const newDomain = await blocklistService.addCustomDomain({ userId, domain, category });

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
}

export const blocklistController = new BlocklistController();

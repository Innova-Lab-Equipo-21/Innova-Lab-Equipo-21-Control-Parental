// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Controlador de Autoprotección (SelfControl)
// Archivo: src/controllers/selfControl.controller.ts
// Descripción: Controlador HTTP para consultar, activar y desactivar la autoprotección del responsable.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { selfControlService } from '../services/selfControl.service.js';
import { AuthenticatedRequest, ApiResponse } from '../types/index.js';
import { AppError } from '../middlewares/error.middleware.js';

export class SelfControlController {
  public async getStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const data = await selfControlService.getStatus(userId);
      res.status(200).json({
        success: true,
        data,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  public async enable(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const data = await selfControlService.enable(userId);
      res.status(200).json({
        success: true,
        message: 'Autoprotección activada con éxito',
        data,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  public async disable(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const data = await selfControlService.disable(userId);
      res.status(200).json({
        success: true,
        message: 'Autoprotección desactivada con éxito',
        data,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const selfControlController = new SelfControlController();

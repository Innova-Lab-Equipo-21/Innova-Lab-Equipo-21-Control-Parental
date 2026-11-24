import { Response, NextFunction } from 'express';
import { metricsService, TimelineDay, TimelineSource } from '../services/metrics.service.js';
import { AuthenticatedRequest, ApiResponse } from '../types/index.js';
import { AppError } from '../middlewares/error.middleware.js';

export class MetricsController {
  public async getSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const result = await metricsService.getSummary(userId);

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  public async getTimeline(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const day = req.query.day as TimelineDay | undefined;
      const source = req.query.source as TimelineSource | undefined;

      const result = await metricsService.getTimeline({ userId, day, source });

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  public async getActivityOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const dateKey = typeof req.query.dateKey === 'string' ? req.query.dateKey : undefined;
      const result = await metricsService.getActivityOverview(userId, dateKey);

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  public async getDeviceActivity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deviceUuid = String(req.params.deviceUuid || '');
      const dateKey = typeof req.query.dateKey === 'string' ? req.query.dateKey : undefined;
      const result = await metricsService.getDeviceActivity(deviceUuid, dateKey);

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  public async markSecurityEventAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Usuario no autenticado', 401);

      const eventId = String(req.params.eventId || '').trim();
      if (!eventId) throw new AppError('ID de alerta inválido', 400);

      const result = await metricsService.markSecurityEventAsRead(userId, eventId);

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const metricsController = new MetricsController();

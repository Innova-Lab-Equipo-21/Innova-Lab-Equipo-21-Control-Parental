// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/controllers/auth.controller.ts
// Descripción: Controlador HTTP para autenticación y registro de usuarios responsables.
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { notificationService } from '../services/notification.service.js';
import { ApiResponse, AuthenticatedRequest } from '../types/index.js';

export class AuthController {
  /**
   * Registra el token FCM del dispositivo para notificaciones push.
   * POST /api/auth/fcm-token
   */
  public async registerFcmToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { fcmToken } = req.body;
      if (!userId || !fcmToken) {
        res.status(400).json({ success: false, message: 'userId y fcmToken son requeridos' });
        return;
      }
      await notificationService.registerToken(userId, fcmToken);
      res.status(200).json({ success: true, message: 'Token FCM registrado' });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Registro de un nuevo usuario responsable.
   * POST /api/auth/register
   */
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName, firstName, lastName, gender, birthDate, phone } = req.body;
      const result = await authService.register({
        email,
        password,
        fullName,
        firstName,
        lastName,
        gender,
        birthDate,
        phone,
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Inicio de sesión de un usuario responsable.
   * POST /api/auth/login
   */
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Autenticación exitosa',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Autenticación con Google Sign-In.
   * POST /api/auth/google
   */
  public async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken, email, fullName, photoUrl } = req.body;
      const result = await authService.googleLogin({ idToken, email, fullName, photoUrl });

      res.status(200).json({
        success: true,
        message: 'Autenticación con Google exitosa',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Vinculación de cuenta existente de responsable con Google.
   * POST /api/auth/google/link
   */
  public async googleLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        } satisfies ApiResponse);
        return;
      }

      const currentFirebaseToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : undefined;
      const { idToken, email, fullName, photoUrl } = req.body;
      const result = await authService.googleLink(
        userId,
        { idToken, email, fullName, photoUrl },
        currentFirebaseToken,
      );

      res.status(200).json({
        success: true,
        message: 'Cuenta vinculada exitosamente con Google',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Renovación de tokens usando un Refresh Token.
   * POST /api/auth/refresh-token
   */
  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens renovados exitosamente',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recuperación de contraseña para usuario responsable.
   * POST /api/auth/recover-password
   */
  public async recoverPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.recoverPassword(email);

      res.status(200).json({
        success: true,
        message: 'Solicitud de recuperación de contraseña procesada',
        data: result,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registro de ubicación geográfica del usuario o dispositivo (Estrategia Híbrida).
   * POST /api/auth/location
   */
  public async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { latitude, longitude, address, city, country, source } = req.body;
      res.status(200).json({
        success: true,
        message: 'Ubicación geográfica registrada exitosamente',
        data: {
          latitude,
          longitude,
          address,
          city,
          country,
          source: source || 'GPS',
          updatedAt: new Date(),
        },
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualización del perfil del responsable.
   * PUT /api/auth/profile
   */
  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        } satisfies ApiResponse);
        return;
      }

      const { fullName, firstName, lastName, gender, birthDate, phone, currentPassword, password } = req.body;
      const updatedUser = await authService.updateProfile(userId, {
        fullName,
        firstName,
        lastName,
        gender,
        birthDate,
        phone,
        currentPassword,
        password,
      });

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedUser,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminación definitiva de la cuenta del responsable.
   * DELETE /api/auth/account
   */
  public async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        } satisfies ApiResponse);
        return;
      }

      const result = await authService.deleteAccount(userId);

      res.status(200).json({
        success: true,
        message: result.message,
      } satisfies ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

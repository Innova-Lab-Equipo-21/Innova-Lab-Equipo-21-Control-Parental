// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/controllers/auth.controller.ts
// Descripción: Controlador HTTP para autenticación y registro de usuarios responsables.
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../types/index.js';

export class AuthController {
  /**
   * Registro de un nuevo usuario responsable.
   * POST /api/auth/register
   */
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName } = req.body;
      const result = await authService.register({ email, password, fullName });

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
}

export const authController = new AuthController();

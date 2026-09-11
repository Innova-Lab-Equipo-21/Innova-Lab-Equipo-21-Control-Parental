// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/middlewares/auth.middleware.ts
// Descripción: Middleware para verificar la autenticación mediante token JWT en rutas protegidas.
// ==============================================================================

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { AuthenticatedRequest, JwtUserPayload, ApiResponse } from '../types/index.js';
import { AppError } from './error.middleware.js';

/**
 * Middleware para validar el token JWT presente en el encabezado Authorization.
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Acceso denegado: Token de autenticación no provisto o con formato inválido',
    } satisfies ApiResponse);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (_error) {
    throw new AppError('Token de autenticación expirado o inválido', 401);
  }
}

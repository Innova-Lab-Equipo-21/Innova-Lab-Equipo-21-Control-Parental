// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/middlewares/auth.middleware.ts
// Descripción: Middleware para verificar la autenticación mediante Firebase ID Tokens.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { auth } from '../config/firebase.js';
// import jwt from 'jsonwebtoken';
// import { env } from '../config/environment.js';
import { AuthenticatedRequest, /*JwtUserPayload,*/ ApiResponse } from '../types/index.js';
import { AppError } from './error.middleware.js';

/**
 * Middleware para validar el ID Token de Firebase presente en el encabezado Authorization.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Acceso denegado: Token de autenticación no provisto o con formato inválido',
    } satisfies ApiResponse);
    return;
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // Verificación asíncrona del token enviado desde la app de Android
    const decoded = await auth.verifyIdToken(idToken);

    req.user = {
      userId: decoded.uid,
      email: decoded.email || '',
    };
    next();
  } catch (_error) {
    next(new AppError('Token de autenticación expirado o inválido', 401));
  }
}

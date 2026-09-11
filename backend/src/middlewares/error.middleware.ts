// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/middlewares/error.middleware.ts
// Descripción: Middleware global para la captura, registro y respuesta estructurada de errores.
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/environment.js';
import { ApiResponse } from '../types/index.js';

/**
 * Clase de error personalizada para manejar excepciones HTTP controladas con código de estado.
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Middleware para el manejo centralizado de errores.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Manejo de errores de validación de esquemas Zod
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    const response: ApiResponse = {
      success: false,
      message: 'Error de validación en los datos enviados',
      errors: formattedErrors,
    };

    res.status(422).json(response);
    return;
  }

  // Manejo de errores operacionales controlados (AppError)
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Errores no controlados o inesperados del servidor
  console.error('❌ Error no controlado en el servidor:', err);

  const response: ApiResponse = {
    success: false,
    message: 'Ha ocurrido un error interno en el servidor',
    ...(env.NODE_ENV === 'development' ? { errors: err.stack } : {}),
  };

  res.status(500).json(response);
}

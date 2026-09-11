// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/middlewares/validation.middleware.ts
// Descripción: Middleware genérico para validación de datos de entrada (body, params, query) con Zod.
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Genera un middleware de validación para el esquema Zod proporcionado.
 * Valida automáticamente req.body, req.query y req.params.
 */
export function validateRequest(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}

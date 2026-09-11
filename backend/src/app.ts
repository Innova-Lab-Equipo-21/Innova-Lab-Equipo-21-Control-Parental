// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/app.ts
// Descripción: Configuración de la aplicación Express, middlewares globales y rutas.
// ==============================================================================

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ApiResponse } from './types/index.js';

export function createApp(): Express {
  const app: Express = express();

  // Middlewares globales de seguridad y serialización
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Montaje de rutas de la API bajo el prefijo /api
  app.use('/api', apiRouter);

  // Manejador para rutas no encontradas (404)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Recurso no encontrado en el servidor',
    } satisfies ApiResponse);
  });

  // Middleware global para manejo centralizado de errores
  app.use(errorHandler);

  return app;
}

// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/config/environment.ts
// Descripción: Carga, validación y exportación tipada de las variables de entorno del sistema.
// ==============================================================================

import dotenv from 'dotenv';
import { z } from 'zod';

// Cargar variables del archivo .env
dotenv.config();

// Esquema de validación para variables de entorno usando Zod
const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/baprotege_db?schema=public'),
  USE_MOCK_DATA: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .default('true'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET debe tener al menos 8 caracteres').default('ba_protege_default_jwt_secret_key_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  HEARTBEAT_TIMEOUT_MINUTES: z.string().transform(Number).default('5'),
});

// Validar y parsear las variables de entorno actuales
const parsedEnv = environmentSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Error crítico: Configuración de variables de entorno inválida:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

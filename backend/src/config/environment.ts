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
    .default('false'),
  HEARTBEAT_TIMEOUT_MINUTES: z.string().transform(Number).default('5'),
  FIREBASE_API_KEY: z.string().default(''),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default(''),
});

// Validar y parsear las variables de entorno actuales
const parsedEnv = environmentSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Error crítico: Configuración de variables de entorno inválida:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

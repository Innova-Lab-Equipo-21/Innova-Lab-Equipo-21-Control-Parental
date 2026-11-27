// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/config/database.ts
// Descripción: Instanciación singleton del cliente de Prisma y verificación idempotente de esquema PostgreSQL.
// ==============================================================================

import { PrismaClient } from '@prisma/client';
import { env } from './environment.js';

// Declaración global para evitar múltiples instancias en entornos de desarrollo con recarga en caliente
declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

export const prisma =
  global.prismaInstance ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma;
}

/**
 * Garantiza de forma idempotente las columnas y tablas aditivas del módulo de Sitios y Apps
 * en entornos gestionados donde el despliegue no ejecuta `prisma migrate deploy`.
 */
async function ensureBlocklistSchema(): Promise<void> {
  const statements = [
    `ALTER TABLE "public"."blocklist_domains" ADD COLUMN IF NOT EXISTS "apply_to_all" BOOLEAN NOT NULL DEFAULT true`,
    `ALTER TABLE "public"."blocklist_domains" ADD COLUMN IF NOT EXISTS "device_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,
    `ALTER TABLE "public"."blocklist_domains" ADD COLUMN IF NOT EXISTS "created_by" TEXT`,
    `ALTER TABLE "public"."blocklist_domains" ADD COLUMN IF NOT EXISTS "created_by_name" TEXT`,
    `ALTER TABLE "public"."blocklist_domains" ADD COLUMN IF NOT EXISTS "source_device_id" TEXT`,
    `CREATE TABLE IF NOT EXISTS "public"."blocklist_apps" (
      "id" TEXT NOT NULL,
      "blocklist_id" TEXT NOT NULL,
      "app_name" TEXT NOT NULL,
      "package_name" TEXT NOT NULL,
      "category" TEXT DEFAULT 'Personalizado',
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "apply_to_all" BOOLEAN NOT NULL DEFAULT true,
      "device_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "daily_limit_minutes" INTEGER,
      "device_limits" JSONB,
      "created_by" TEXT,
      "created_by_name" TEXT,
      "source_device_id" TEXT,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "blocklist_apps_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "blocklist_apps_blocklist_id_package_name_key" ON "public"."blocklist_apps"("blocklist_id", "package_name")`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blocklist_apps_blocklist_id_fkey') THEN ALTER TABLE "public"."blocklist_apps" ADD CONSTRAINT "blocklist_apps_blocklist_id_fkey" FOREIGN KEY ("blocklist_id") REFERENCES "public"."blocklists"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF; END $$`,
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
}

/**
 * Función para verificar la conectividad con la base de datos PostgreSQL o activar modo mock.
 */
export async function connectDatabase(): Promise<void> {
  if (env.USE_MOCK_DATA) {
    console.log('⚡ Modo de Datos Simulados (Mock Data) ACTIVO: Operando sin base de datos externa.');
    return;
  }

  try {
    await prisma.$connect();
    await ensureBlocklistSchema();
    console.log('✅ Conexión establecida con éxito con PostgreSQL.');
  } catch (error) {
    console.warn('⚠️ Error al inicializar conexión o esquema PostgreSQL:', error);
  }
}

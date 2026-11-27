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
 * Garantiza de forma idempotente las tablas y columnas aditivas de Actividad y Telemetría
 * (`pasatiempo_sessions`, `app_usage_snapshots`, `security_events.read_at`, `blocked_events.item_type`)
 * en entornos gestionados donde el despliegue no ejecuta `prisma migrate deploy`.
 */
async function ensureActivitySchema(): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "public"."pasatiempo_sessions" (
      "id" TEXT NOT NULL,
      "device_id" TEXT NOT NULL,
      "date_key" TEXT NOT NULL,
      "game_type" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "correct_count" INTEGER NOT NULL DEFAULT 0,
      "wrong_count" INTEGER NOT NULL DEFAULT 0,
      "total_items" INTEGER NOT NULL DEFAULT 0,
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "details" JSONB,
      "completed_at" TIMESTAMP(3),
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "pasatiempo_sessions_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "pasatiempo_sessions_device_id_date_key_game_type_key" ON "public"."pasatiempo_sessions"("device_id", "date_key", "game_type")`,
    `CREATE INDEX IF NOT EXISTS "pasatiempo_sessions_device_id_date_key_idx" ON "public"."pasatiempo_sessions"("device_id", "date_key")`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pasatiempo_sessions_device_id_fkey') THEN ALTER TABLE "public"."pasatiempo_sessions" ADD CONSTRAINT "pasatiempo_sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF; END $$`,
    `CREATE TABLE IF NOT EXISTS "public"."app_usage_snapshots" (
      "id" TEXT NOT NULL,
      "device_id" TEXT NOT NULL,
      "date_key" TEXT NOT NULL,
      "package_name" TEXT NOT NULL,
      "app_name" TEXT NOT NULL,
      "used_minutes" INTEGER NOT NULL DEFAULT 0,
      "daily_limit_minutes" INTEGER,
      "is_blocked" BOOLEAN NOT NULL DEFAULT false,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "app_usage_snapshots_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "app_usage_snapshots_device_id_date_key_package_name_key" ON "public"."app_usage_snapshots"("device_id", "date_key", "package_name")`,
    `CREATE INDEX IF NOT EXISTS "app_usage_snapshots_device_id_date_key_idx" ON "public"."app_usage_snapshots"("device_id", "date_key")`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_usage_snapshots_device_id_fkey') THEN ALTER TABLE "public"."app_usage_snapshots" ADD CONSTRAINT "app_usage_snapshots_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF; END $$`,
    `ALTER TABLE "public"."security_events" ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMP(3)`,
    `CREATE INDEX IF NOT EXISTS "security_events_device_id_read_at_idx" ON "public"."security_events"("device_id", "read_at")`,
    `ALTER TABLE "public"."blocked_events" ADD COLUMN IF NOT EXISTS "item_type" TEXT NOT NULL DEFAULT 'SITE'`,
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
}

/**
 * Garantiza de forma idempotente las columnas y tablas aditivas de Seguridad y Permisos
 * (`device_status.permissions_detail`, `anti_uninstall_codes`) en entornos gestionados.
 */
async function ensureSecuritySchema(): Promise<void> {
  const statements = [
    `ALTER TABLE "public"."device_status" ADD COLUMN IF NOT EXISTS "permissions_detail" JSONB`,
    `CREATE TABLE IF NOT EXISTS "public"."anti_uninstall_codes" (
      "device_uuid" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "expires_at" TIMESTAMP(3) NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "anti_uninstall_codes_pkey" PRIMARY KEY ("device_uuid")
    )`,
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
    await ensureActivitySchema();
    await ensureSecuritySchema();
    console.log('✅ Conexión establecida con éxito con PostgreSQL.');
  } catch (error) {
    console.warn('⚠️ Error al inicializar conexión o esquema PostgreSQL:', error);
  }
}

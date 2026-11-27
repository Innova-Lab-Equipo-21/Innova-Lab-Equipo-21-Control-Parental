-- Migración puramente aditiva e idempotente para Módulo 3 (Sitios y Apps):
-- 1) Columnas de origen en public.blocklist_domains (created_by, created_by_name, source_device_id)
-- 2) Tabla public.blocklist_apps con alcance por dispositivo, límites diarios y origen

ALTER TABLE "public"."blocklist_domains"
    ADD COLUMN IF NOT EXISTS "apply_to_all" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "public"."blocklist_domains"
    ADD COLUMN IF NOT EXISTS "device_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "public"."blocklist_domains"
    ADD COLUMN IF NOT EXISTS "created_by" TEXT;

ALTER TABLE "public"."blocklist_domains"
    ADD COLUMN IF NOT EXISTS "created_by_name" TEXT;

ALTER TABLE "public"."blocklist_domains"
    ADD COLUMN IF NOT EXISTS "source_device_id" TEXT;

CREATE TABLE IF NOT EXISTS "public"."blocklist_apps" (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "blocklist_apps_blocklist_id_package_name_key"
    ON "public"."blocklist_apps"("blocklist_id", "package_name");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'blocklist_apps_blocklist_id_fkey'
    ) THEN
        ALTER TABLE "public"."blocklist_apps"
            ADD CONSTRAINT "blocklist_apps_blocklist_id_fkey"
            FOREIGN KEY ("blocklist_id") REFERENCES "public"."blocklists"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

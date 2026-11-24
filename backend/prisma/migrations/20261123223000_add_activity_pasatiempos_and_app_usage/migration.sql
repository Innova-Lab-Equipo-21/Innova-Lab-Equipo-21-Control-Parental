-- Migración puramente aditiva e idempotente para métricas de Actividad:
-- 1) public.pasatiempo_sessions: registro diario de respuestas, intentos y conclusión de juegos
-- 2) public.app_usage_snapshots: consumo diario de apps incluidas en la lista de bloqueos

CREATE TABLE IF NOT EXISTS "public"."pasatiempo_sessions" (
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pasatiempo_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pasatiempo_sessions_device_id_date_key_game_type_key"
    ON "public"."pasatiempo_sessions"("device_id", "date_key", "game_type");

CREATE INDEX IF NOT EXISTS "pasatiempo_sessions_device_id_date_key_idx"
    ON "public"."pasatiempo_sessions"("device_id", "date_key");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pasatiempo_sessions_device_id_fkey'
    ) THEN
        ALTER TABLE "public"."pasatiempo_sessions"
            ADD CONSTRAINT "pasatiempo_sessions_device_id_fkey"
            FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."app_usage_snapshots" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "date_key" TEXT NOT NULL,
    "package_name" TEXT NOT NULL,
    "app_name" TEXT NOT NULL,
    "used_minutes" INTEGER NOT NULL DEFAULT 0,
    "daily_limit_minutes" INTEGER,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_usage_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "app_usage_snapshots_device_id_date_key_package_name_key"
    ON "public"."app_usage_snapshots"("device_id", "date_key", "package_name");

CREATE INDEX IF NOT EXISTS "app_usage_snapshots_device_id_date_key_idx"
    ON "public"."app_usage_snapshots"("device_id", "date_key");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'app_usage_snapshots_device_id_fkey'
    ) THEN
        ALTER TABLE "public"."app_usage_snapshots"
            ADD CONSTRAINT "app_usage_snapshots_device_id_fkey"
            FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

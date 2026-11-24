-- Migración puramente aditiva e idempotente para Actividad del Responsable:
-- 1) public.security_events.read_at: persiste cuándo el Responsable leyó cada alerta de seguridad
-- 2) public.blocked_events.item_type: distingue explícitamente SITE vs APP en bloqueos registrados

ALTER TABLE "public"."security_events"
    ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "security_events_device_id_read_at_idx"
    ON "public"."security_events"("device_id", "read_at");

ALTER TABLE "public"."blocked_events"
    ADD COLUMN IF NOT EXISTS "item_type" TEXT NOT NULL DEFAULT 'SITE';

UPDATE "public"."blocked_events"
SET "item_type" = 'APP'
WHERE "item_type" = 'SITE'
  AND (
    UPPER("source_list_type") LIKE '%\_APP' ESCAPE '\'
    OR LOWER("attempted_domain") LIKE 'app:%'
    OR LOWER("attempted_domain") LIKE '%(app)%'
  );

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO', 'NO_INFORMADO');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "fcm_token" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "gender" "public"."Gender";
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "birth_date" DATE;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."allowed_sites" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT,
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "allowed_sites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "allowed_sites_domain_key" ON "public"."allowed_sites"("domain");
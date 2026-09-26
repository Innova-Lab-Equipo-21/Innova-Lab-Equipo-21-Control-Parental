-- CreateEnum
CREATE TYPE "ProtectionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'STARTING', 'ERROR', 'PERMISSION_REQUIRED', 'SYNC_PENDING', 'OUTDATED', 'BYPASS_DETECTED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "BlocklistType" AS ENUM ('OFFICIAL_LOTBA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('VPN_DISABLED', 'PERMISSION_REVOKED', 'APP_FORCE_STOP', 'DEVICE_REBOOT', 'NETWORK_CHANGE', 'DNS_TAMPERING', 'UNINSTALL_ATTEMPT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "device_uuid" TEXT NOT NULL,
    "child_name" TEXT,
    "model" TEXT,
    "os_version" TEXT,
    "app_version" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_pairings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT,
    "pairing_code" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_pairings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protection_configs" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "protection_enabled" BOOLEAN NOT NULL DEFAULT true,
    "block_gambling" BOOLEAN NOT NULL DEFAULT true,
    "block_custom_list" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_block" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_security" BOOLEAN NOT NULL DEFAULT true,
    "heartbeat_interval_sec" INTEGER NOT NULL DEFAULT 60,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protection_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_status" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "effective_status" "ProtectionStatus" NOT NULL DEFAULT 'UNKNOWN',
    "vpn_active" BOOLEAN NOT NULL DEFAULT false,
    "permissions_ok" BOOLEAN NOT NULL DEFAULT true,
    "battery_level" INTEGER,
    "is_charging" BOOLEAN,
    "blocklist_version" INTEGER NOT NULL DEFAULT 1,
    "app_version" TEXT,
    "last_heartbeat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocklists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "BlocklistType" NOT NULL DEFAULT 'OFFICIAL_LOTBA',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocklist_domains" (
    "id" TEXT NOT NULL,
    "blocklist_id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "category" TEXT DEFAULT 'GAMBLING',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocklist_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_events" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "attempted_domain" TEXT NOT NULL,
    "source_list_type" TEXT NOT NULL DEFAULT 'LOTBA',
    "blocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "event_type" "SecurityEventType" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "devices_device_uuid_key" ON "devices"("device_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "device_pairings_pairing_code_key" ON "device_pairings"("pairing_code");

-- CreateIndex
CREATE UNIQUE INDEX "protection_configs_device_id_key" ON "protection_configs"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_status_device_id_key" ON "device_status"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "blocklist_domains_blocklist_id_domain_key" ON "blocklist_domains"("blocklist_id", "domain");

-- CreateIndex
CREATE INDEX "blocked_events_device_id_blocked_at_idx" ON "blocked_events"("device_id", "blocked_at");

-- CreateIndex
CREATE INDEX "security_events_device_id_occurred_at_idx" ON "security_events"("device_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_pairings" ADD CONSTRAINT "device_pairings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_pairings" ADD CONSTRAINT "device_pairings_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protection_configs" ADD CONSTRAINT "protection_configs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_status" ADD CONSTRAINT "device_status_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocklists" ADD CONSTRAINT "blocklists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocklist_domains" ADD CONSTRAINT "blocklist_domains_blocklist_id_fkey" FOREIGN KEY ("blocklist_id") REFERENCES "blocklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_events" ADD CONSTRAINT "blocked_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

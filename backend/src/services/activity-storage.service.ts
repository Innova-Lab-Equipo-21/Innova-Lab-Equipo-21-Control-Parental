// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Almacenamiento de Pasatiempos y Uso de Apps
// Archivo: src/services/activity-storage.service.ts
// Descripción: Gestiona la persistencia segura (PostgreSQL aditivo con fallback
//              en memoria + MockDB) para:
//              - Sesiones diarias de pasatiempos (Quiz, Sopa de letras [3 sopas], Memoria)
//              - Snapshots de consumo diario de aplicaciones bloqueadas
//              - Cálculo de Racha (streak), promedios semanales y agregación por perfil
// ==============================================================================

import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import {
  mockDb,
  MockAppUsageSnapshot,
  MockPasatiempoSession,
} from '../config/mock-database.js';

export type PasatiempoGameType = 'QUIZ' | 'WORDSEARCH' | 'MEMORY';
export type PasatiempoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface UpsertPasatiempoSessionInput {
  deviceId: string;
  dateKey: string;
  gameType: PasatiempoGameType;
  status: PasatiempoStatus;
  correctCount: number;
  wrongCount: number;
  totalItems: number;
  attempts: number;
  details?: Record<string, unknown> | null;
  completedAt?: string | Date | null;
}

export interface UpsertAppUsageItemInput {
  packageName: string;
  appName: string;
  usedMinutes: number;
  dailyLimitMinutes?: number | null;
  isBlocked?: boolean;
}

export interface StoredPasatiempoSession {
  id: string;
  deviceId: string;
  dateKey: string;
  gameType: PasatiempoGameType;
  status: PasatiempoStatus;
  correctCount: number;
  wrongCount: number;
  totalItems: number;
  attempts: number;
  details: Record<string, unknown> | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface StoredAppUsageSnapshot {
  id: string;
  deviceId: string;
  dateKey: string;
  packageName: string;
  appName: string;
  usedMinutes: number;
  dailyLimitMinutes: number | null;
  isBlocked: boolean;
  updatedAt: string;
}

const fallbackPasatiempos = new Map<string, MockPasatiempoSession>();
const fallbackAppUsage = new Map<string, MockAppUsageSnapshot>();

export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPreviousDateKey(dateKey: string, daysBack: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() - daysBack);
  return formatDateKey(dt);
}

function normalizeStoredSession(row: any): StoredPasatiempoSession {
  let parsedDetails: Record<string, unknown> | null = null;
  if (row.details && typeof row.details === 'object') {
    parsedDetails = row.details as Record<string, unknown>;
  } else if (typeof row.details === 'string') {
    try {
      parsedDetails = JSON.parse(row.details);
    } catch {
      parsedDetails = null;
    }
  }

  const completedAtRaw = row.completed_at ?? row.completedAt ?? null;
  const updatedAtRaw = row.updated_at ?? row.updatedAt ?? new Date();

  return {
    id: String(row.id),
    deviceId: String(row.device_id ?? row.deviceId),
    dateKey: String(row.date_key ?? row.dateKey),
    gameType: String(row.game_type ?? row.gameType).toUpperCase() as PasatiempoGameType,
    status: String(row.status || 'PENDING').toUpperCase() as PasatiempoStatus,
    correctCount: Number(row.correct_count ?? row.correctCount ?? 0),
    wrongCount: Number(row.wrong_count ?? row.wrongCount ?? 0),
    totalItems: Number(row.total_items ?? row.totalItems ?? 0),
    attempts: Number(row.attempts ?? 0),
    details: parsedDetails,
    completedAt: completedAtRaw ? new Date(completedAtRaw).toISOString() : null,
    updatedAt: new Date(updatedAtRaw).toISOString(),
  };
}

function normalizeStoredAppUsage(row: any): StoredAppUsageSnapshot {
  const rawLimit = row.daily_limit_minutes ?? row.dailyLimitMinutes;
  const updatedAtRaw = row.updated_at ?? row.updatedAt ?? new Date();
  return {
    id: String(row.id),
    deviceId: String(row.device_id ?? row.deviceId),
    dateKey: String(row.date_key ?? row.dateKey),
    packageName: String(row.package_name ?? row.packageName),
    appName: String(row.app_name ?? row.appName),
    usedMinutes: Math.max(0, Number(row.used_minutes ?? row.usedMinutes ?? 0)),
    dailyLimitMinutes:
      rawLimit === null || rawLimit === undefined ? null : Math.max(0, Number(rawLimit)),
    isBlocked: Boolean(row.is_blocked ?? row.isBlocked ?? false),
    updatedAt: new Date(updatedAtRaw).toISOString(),
  };
}

export class ActivityStorageService {
  /**
   * Crea o actualiza la sesión diaria de un pasatiempo para un dispositivo.
   */
  public async upsertPasatiempoSession(
    input: UpsertPasatiempoSessionInput,
  ): Promise<StoredPasatiempoSession> {
    const now = new Date();
    const completedAt =
      input.status === 'COMPLETED'
        ? input.completedAt
          ? new Date(input.completedAt)
          : now
        : null;

    if (env.USE_MOCK_DATA) {
      const existing = mockDb.pasatiempoSessions.find(
        (s) =>
          s.deviceId === input.deviceId &&
          s.dateKey === input.dateKey &&
          s.gameType === input.gameType,
      );

      if (existing) {
        existing.status = input.status;
        existing.correctCount = input.correctCount;
        existing.wrongCount = input.wrongCount;
        existing.totalItems = input.totalItems;
        existing.attempts = input.attempts;
        existing.details = input.details ?? null;
        existing.completedAt = completedAt ?? existing.completedAt ?? null;
        existing.updatedAt = now;
        return normalizeStoredSession(existing);
      }

      const created: MockPasatiempoSession = {
        id: `pas-${crypto.randomUUID()}`,
        deviceId: input.deviceId,
        dateKey: input.dateKey,
        gameType: input.gameType,
        status: input.status,
        correctCount: input.correctCount,
        wrongCount: input.wrongCount,
        totalItems: input.totalItems,
        attempts: input.attempts,
        details: input.details ?? null,
        completedAt,
        createdAt: now,
        updatedAt: now,
      };
      mockDb.pasatiempoSessions.push(created);
      return normalizeStoredSession(created);
    }

    const id = crypto.randomUUID();
    const detailsJson = input.details ? JSON.stringify(input.details) : null;

    try {
      const rows = await prisma.$queryRaw<any[]>`
        INSERT INTO "public"."pasatiempo_sessions" (
          "id", "device_id", "date_key", "game_type", "status",
          "correct_count", "wrong_count", "total_items", "attempts",
          "details", "completed_at", "created_at", "updated_at"
        )
        VALUES (
          ${id}, ${input.deviceId}, ${input.dateKey}, ${input.gameType}, ${input.status},
          ${input.correctCount}, ${input.wrongCount}, ${input.totalItems}, ${input.attempts},
          CAST(${detailsJson} AS jsonb), ${completedAt}, ${now}, ${now}
        )
        ON CONFLICT ("device_id", "date_key", "game_type")
        DO UPDATE SET
          "status" = EXCLUDED."status",
          "correct_count" = EXCLUDED."correct_count",
          "wrong_count" = EXCLUDED."wrong_count",
          "total_items" = EXCLUDED."total_items",
          "attempts" = EXCLUDED."attempts",
          "details" = EXCLUDED."details",
          "completed_at" = COALESCE(EXCLUDED."completed_at", "public"."pasatiempo_sessions"."completed_at"),
          "updated_at" = EXCLUDED."updated_at"
        RETURNING *
      `;
      if (rows && rows[0]) {
        return normalizeStoredSession(rows[0]);
      }
    } catch (err: any) {
      console.warn(
        '[ActivityStorage] Tabla pasatiempo_sessions no disponible aún; usando respaldo en memoria:',
        err?.message || err,
      );
    }

    const key = `${input.deviceId}::${input.dateKey}::${input.gameType}`;
    const mem: MockPasatiempoSession = {
      id,
      deviceId: input.deviceId,
      dateKey: input.dateKey,
      gameType: input.gameType,
      status: input.status,
      correctCount: input.correctCount,
      wrongCount: input.wrongCount,
      totalItems: input.totalItems,
      attempts: input.attempts,
      details: input.details ?? null,
      completedAt,
      createdAt: now,
      updatedAt: now,
    };
    fallbackPasatiempos.set(key, mem);
    return normalizeStoredSession(mem);
  }

  /**
   * Obtiene sesiones de pasatiempos para uno o más dispositivos en un rango de días.
   */
  public async listPasatiempoSessions(
    deviceIds: string[],
    daysBack: number = 30,
  ): Promise<StoredPasatiempoSession[]> {
    if (deviceIds.length === 0) return [];
    const todayKey = formatDateKey();
    const minDateKey = getPreviousDateKey(todayKey, daysBack);

    if (env.USE_MOCK_DATA) {
      const idSet = new Set(deviceIds);
      return mockDb.pasatiempoSessions
        .filter((s) => idSet.has(s.deviceId) && s.dateKey >= minDateKey)
        .map(normalizeStoredSession);
    }

    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT *
        FROM "public"."pasatiempo_sessions"
        WHERE "device_id" = ANY(${deviceIds}::text[])
          AND "date_key" >= ${minDateKey}
        ORDER BY "date_key" DESC, "updated_at" DESC
      `;
      return (rows || []).map(normalizeStoredSession);
    } catch (err: any) {
      console.warn(
        '[ActivityStorage] Leyendo pasatiempos desde respaldo en memoria:',
        err?.message || err,
      );
      const idSet = new Set(deviceIds);
      return Array.from(fallbackPasatiempos.values())
        .filter((s) => idSet.has(s.deviceId) && s.dateKey >= minDateKey)
        .map(normalizeStoredSession);
    }
  }

  /**
   * Registra snapshots de uso diario de aplicaciones bloqueadas para un dispositivo.
   */
  public async upsertAppUsageSnapshots(
    deviceId: string,
    dateKey: string,
    apps: UpsertAppUsageItemInput[],
  ): Promise<StoredAppUsageSnapshot[]> {
    const now = new Date();
    const results: StoredAppUsageSnapshot[] = [];

    for (const app of apps) {
      const pkg = (app.packageName || app.appName).trim().toLowerCase();
      if (!pkg) continue;
      const usedMinutes = Math.max(0, Math.round(app.usedMinutes));
      const dailyLimitMinutes =
        app.dailyLimitMinutes === undefined || app.dailyLimitMinutes === null
          ? null
          : Math.max(0, Math.round(app.dailyLimitMinutes));
      const isBlocked = Boolean(app.isBlocked);

      if (env.USE_MOCK_DATA) {
        const existing = mockDb.appUsageSnapshots.find(
          (s) =>
            s.deviceId === deviceId &&
            s.dateKey === dateKey &&
            s.packageName === pkg,
        );
        if (existing) {
          existing.appName = app.appName;
          existing.usedMinutes = usedMinutes;
          existing.dailyLimitMinutes = dailyLimitMinutes;
          existing.isBlocked = isBlocked;
          existing.updatedAt = now;
          results.push(normalizeStoredAppUsage(existing));
        } else {
          const created: MockAppUsageSnapshot = {
            id: `appu-${crypto.randomUUID()}`,
            deviceId,
            dateKey,
            packageName: pkg,
            appName: app.appName,
            usedMinutes,
            dailyLimitMinutes,
            isBlocked,
            createdAt: now,
            updatedAt: now,
          };
          mockDb.appUsageSnapshots.push(created);
          results.push(normalizeStoredAppUsage(created));
        }
        continue;
      }

      const id = crypto.randomUUID();
      try {
        const rows = await prisma.$queryRaw<any[]>`
          INSERT INTO "public"."app_usage_snapshots" (
            "id", "device_id", "date_key", "package_name", "app_name",
            "used_minutes", "daily_limit_minutes", "is_blocked",
            "created_at", "updated_at"
          )
          VALUES (
            ${id}, ${deviceId}, ${dateKey}, ${pkg}, ${app.appName},
            ${usedMinutes}, ${dailyLimitMinutes}, ${isBlocked},
            ${now}, ${now}
          )
          ON CONFLICT ("device_id", "date_key", "package_name")
          DO UPDATE SET
            "app_name" = EXCLUDED."app_name",
            "used_minutes" = EXCLUDED."used_minutes",
            "daily_limit_minutes" = EXCLUDED."daily_limit_minutes",
            "is_blocked" = EXCLUDED."is_blocked",
            "updated_at" = EXCLUDED."updated_at"
          RETURNING *
        `;
        if (rows && rows[0]) {
          results.push(normalizeStoredAppUsage(rows[0]));
          continue;
        }
      } catch (err: any) {
        console.warn(
          '[ActivityStorage] Tabla app_usage_snapshots no disponible aún; usando respaldo en memoria:',
          err?.message || err,
        );
      }

      const key = `${deviceId}::${dateKey}::${pkg}`;
      const mem: MockAppUsageSnapshot = {
        id,
        deviceId,
        dateKey,
        packageName: pkg,
        appName: app.appName,
        usedMinutes,
        dailyLimitMinutes,
        isBlocked,
        createdAt: now,
        updatedAt: now,
      };
      fallbackAppUsage.set(key, mem);
      results.push(normalizeStoredAppUsage(mem));
    }

    return results;
  }

  /**
   * Lista snapshots de uso de aplicaciones para uno o más dispositivos en una fecha dada.
   */
  public async listAppUsageSnapshots(
    deviceIds: string[],
    dateKey: string = formatDateKey(),
  ): Promise<StoredAppUsageSnapshot[]> {
    if (deviceIds.length === 0) return [];

    if (env.USE_MOCK_DATA) {
      const idSet = new Set(deviceIds);
      return mockDb.appUsageSnapshots
        .filter((s) => idSet.has(s.deviceId) && s.dateKey === dateKey)
        .sort((a, b) => b.usedMinutes - a.usedMinutes)
        .map(normalizeStoredAppUsage);
    }

    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT *
        FROM "public"."app_usage_snapshots"
        WHERE "device_id" = ANY(${deviceIds}::text[])
          AND "date_key" = ${dateKey}
        ORDER BY "used_minutes" DESC, "app_name" ASC
      `;
      return (rows || []).map(normalizeStoredAppUsage);
    } catch (err: any) {
      console.warn(
        '[ActivityStorage] Leyendo app_usage_snapshots desde respaldo en memoria:',
        err?.message || err,
      );
      const idSet = new Set(deviceIds);
      return Array.from(fallbackAppUsage.values())
        .filter((s) => idSet.has(s.deviceId) && s.dateKey === dateKey)
        .sort((a, b) => b.usedMinutes - a.usedMinutes)
        .map(normalizeStoredAppUsage);
    }
  }

  /**
   * Calcula la racha (días consecutivos) de un dispositivo a partir de sus sesiones.
   * - Para ADULTO: días consecutivos con QUIZ completado.
   * - Para MENOR: días consecutivos con al menos un juego completado.
   */
  public computeStreakDays(
    sessions: StoredPasatiempoSession[],
    profileType: 'MENOR' | 'ADULTO',
    todayKey: string = formatDateKey(),
  ): number {
    const completedDates = new Set<string>();
    for (const s of sessions) {
      if (s.status !== 'COMPLETED') continue;
      if (profileType === 'ADULTO' && s.gameType !== 'QUIZ') continue;
      completedDates.add(s.dateKey);
    }

    if (completedDates.size === 0) return 0;

    let streak = 0;
    let offset = completedDates.has(todayKey) ? 0 : 1;

    while (offset < 365) {
      const checkKey = getPreviousDateKey(todayKey, offset);
      if (completedDates.has(checkKey)) {
        streak += 1;
        offset += 1;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calcula porcentaje semanal de aciertos de Quiz (últimos 7 días).
   */
  public computeWeeklyQuizAccuracyPct(
    sessions: StoredPasatiempoSession[],
    todayKey: string = formatDateKey(),
  ): number {
    const minKey = getPreviousDateKey(todayKey, 6);
    const quizSessions = sessions.filter(
      (s) => s.gameType === 'QUIZ' && s.dateKey >= minKey && s.dateKey <= todayKey,
    );
    const totalCorrect = quizSessions.reduce((sum, s) => sum + s.correctCount, 0);
    const totalQuestions = quizSessions.reduce(
      (sum, s) => sum + Math.max(s.totalItems, s.correctCount + s.wrongCount),
      0,
    );
    if (totalQuestions <= 0) return 0;
    return Math.round((totalCorrect / totalQuestions) * 100);
  }
}

export const activityStorageService = new ActivityStorageService();

// ==============================================================================
// Proyecto: BA Protege+
// Componente: Telemetría, Eventos de Seguridad, Pasatiempos, Uso de Apps y Ubicación
// Archivo: src/services/api/telemetry.api.ts
// Descripción: Sincronización 100% real contra PostgreSQL de heartbeats, intentos
//              bloqueados, alertas de seguridad, pasatiempos y consumo de apps.
// ==============================================================================

import {
  BlockedAttemptRecord,
  BlockedItemType,
  inferBlockedItemType,
  normalizeAttemptSource,
} from '../../utils/activityMetrics';
import { AppUsageRawSnapshot } from '../../utils/appUsageMetrics';
import {
  BackendPasatiempoSessionDTO,
  DailyPasatiemposRecord,
  createEmptyDailyPasatiemposRecord,
  getLocalDateKey,
  hydrateDailyRecordFromSessions,
} from '../../utils/pasatiemposMetrics';
import { apiClient, safeStorage } from './client';

const BLOCKED_EVENTS_STORAGE_KEY = '@ba_protege_blocked_events';
const SECURITY_EVENTS_STORAGE_KEY = '@ba_protege_security_events';
const PASATIEMPOS_HISTORY_KEY_PREFIX = '@ba_protege_pasatiempos_history_';
const APP_USAGE_KEY_PREFIX = '@ba_protege_app_usage_';

export interface HeartbeatPayload {
  deviceUuid: string;
  vpnActive: boolean;
  permissionsOk: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  blocklistVersion: number;
  appVersion?: string;
  permissions?: {
    vpn?: boolean;
    accessibility?: boolean;
    notifications?: boolean;
    batteryOptimization?: boolean;
    location?: boolean;
    usageStats?: boolean;
  };
}

export interface SecurityEventPayload {
  deviceUuid: string;
  eventType: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface BlockedEventPayload {
  deviceUuid: string;
  deviceId?: string;
  deviceName?: string;
  attemptedDomain: string;
  sourceListType?: string;
  itemType?: BlockedItemType;
  blockedAt?: string;
}

export interface LocationPayload {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  source: 'GPS' | 'IP';
}

export interface PasatiempoProgressPayload {
  deviceUuid: string;
  dateKey?: string;
  gameType: 'QUIZ' | 'WORDSEARCH' | 'MEMORY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  correctCount: number;
  wrongCount: number;
  totalItems: number;
  attempts?: number;
  details?: Record<string, unknown> | null;
  completedAt?: string | null;
}

export interface SecurityEventOverviewItem {
  id: string;
  deviceId: string;
  deviceName: string;
  eventType: string;
  description?: string;
  occurredAt: string;
  readAt?: string | null;
}

export interface ActivityOverviewResponse {
  dateKey: string;
  pasatiemposByDevice: Array<{
    deviceId: string;
    deviceUuid: string;
    deviceName: string;
    profileType: 'MENOR' | 'ADULTO';
    streakDays: number;
    weeklyQuizAccuracyPct: number;
    today: BackendPasatiempoSessionDTO[];
  }>;
  appUsage: AppUsageRawSnapshot[];
  blockedEvents: Array<{
    id: string;
    deviceId: string;
    deviceName: string;
    attemptedDomain: string;
    sourceListType: 'LOTBA' | 'CUSTOM';
    itemType: BlockedItemType;
    blockedAt: string;
  }>;
  securityEvents?: SecurityEventOverviewItem[];
}

export interface DeviceActivityMetricsResponse {
  dateKey: string;
  deviceId: string;
  childName?: string | null;
  phone?: string | null;
  tutorName?: string | null;
  profileType: 'MENOR' | 'ADULTO';
  pasatiempos: {
    today: BackendPasatiempoSessionDTO[];
    streakDays: number;
    weeklyQuizAccuracyPct: number;
  };
  appUsage: AppUsageRawSnapshot[];
  blockedEvents: Array<{
    id: string;
    deviceId: string;
    deviceName: string;
    attemptedDomain: string;
    sourceListType: 'LOTBA' | 'CUSTOM';
    itemType: BlockedItemType;
    blockedAt: string;
  }>;
  securityEvents?: SecurityEventOverviewItem[];
}

export const telemetryApi = {
  // --------------------------------------------------------------------------
  // Telemetría y Heartbeat (100% PostgreSQL)
  // --------------------------------------------------------------------------
  async sendHeartbeat(data: HeartbeatPayload) {
    const response = await apiClient.post('/telemetry/heartbeat', data);
    return response.data;
  },

  async reportBlockedEvent(data: BlockedEventPayload) {
    const normalizedSource = normalizeAttemptSource(data.sourceListType);
    const inferredItemType = inferBlockedItemType(
      data.attemptedDomain,
      data.sourceListType,
      data.itemType
    );
    const apiSource =
      inferredItemType === 'app'
        ? normalizedSource === 'LOTBA'
          ? 'LOTBA_APP'
          : 'CUSTOM_APP'
        : normalizedSource;

    const response = await apiClient.post('/telemetry/events/blocked', {
      deviceUuid: data.deviceUuid,
      attemptedDomain: data.attemptedDomain,
      sourceListType: apiSource,
      itemType: inferredItemType.toUpperCase(),
    });

    const persisted = response.data?.data;
    const cachedRecord: BlockedAttemptRecord = {
      id: persisted?.id || `blocked-${Date.now()}`,
      deviceId: persisted?.deviceId || data.deviceId || data.deviceUuid,
      deviceName: data.deviceName || 'Mi dispositivo',
      attemptedDomain: (persisted?.attemptedDomain || data.attemptedDomain)
        .trim()
        .toLowerCase(),
      sourceListType: normalizedSource,
      itemType: inferredItemType,
      blockedAt: persisted?.blockedAt || data.blockedAt || new Date().toISOString(),
      count: 1,
    };

    try {
      const raw = await safeStorage.getItem(BLOCKED_EVENTS_STORAGE_KEY);
      const existing: BlockedAttemptRecord[] = raw ? JSON.parse(raw) : [];
      const updated = [
        cachedRecord,
        ...(Array.isArray(existing) ? existing.filter((e) => e.id !== cachedRecord.id) : []),
      ].slice(0, 500);
      await safeStorage.setItem(BLOCKED_EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignorar fallo de caché local tras persistencia exitosa en PostgreSQL
    }

    return response.data;
  },

  async getBlockedEvents(): Promise<BlockedAttemptRecord[]> {
    try {
      const raw = await safeStorage.getItem(BLOCKED_EVENTS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async clearBlockedEvents(): Promise<void> {
    await safeStorage.removeItem(BLOCKED_EVENTS_STORAGE_KEY);
  },

  async reportSecurityEvent(data: SecurityEventPayload) {
    const response = await apiClient.post('/telemetry/events/security', data);
    const persisted = response.data?.data;

    const cachedRecord: SecurityEventOverviewItem = {
      id: persisted?.id || `sec-${Date.now()}`,
      deviceId: persisted?.deviceId || data.deviceUuid,
      deviceName: 'Dispositivo protegido',
      eventType: persisted?.eventType || data.eventType,
      description: persisted?.description || data.description || '',
      occurredAt: persisted?.occurredAt || new Date().toISOString(),
      readAt: persisted?.readAt ?? null,
    };

    try {
      const raw = await safeStorage.getItem(SECURITY_EVENTS_STORAGE_KEY);
      const existing: SecurityEventOverviewItem[] = raw ? JSON.parse(raw) : [];
      const updated = [
        cachedRecord,
        ...(Array.isArray(existing) ? existing.filter((e) => e.id !== cachedRecord.id) : []),
      ].slice(0, 100);
      await safeStorage.setItem(SECURITY_EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignorar fallo de caché local tras persistencia exitosa en PostgreSQL
    }

    return response.data;
  },

  async getSecurityEvents(): Promise<SecurityEventOverviewItem[]> {
    try {
      const raw = await safeStorage.getItem(SECURITY_EVENTS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async markSecurityEventAsRead(eventId: string) {
    const response = await apiClient.patch(
      `/metrics/security-events/${encodeURIComponent(eventId)}/read`,
      {}
    );
    return response.data;
  },

  // --------------------------------------------------------------------------
  // Pasatiempos: Persistencia real en PostgreSQL + caché de lectura local
  // --------------------------------------------------------------------------
  async saveLocalDailyPasatiempos(
    deviceUuid: string,
    record: DailyPasatiemposRecord
  ): Promise<DailyPasatiemposRecord[]> {
    const key = `${PASATIEMPOS_HISTORY_KEY_PREFIX}${deviceUuid || 'local'}`;
    try {
      const raw = await safeStorage.getItem(key);
      const existing: DailyPasatiemposRecord[] = raw ? JSON.parse(raw) : [];
      const filtered = (Array.isArray(existing) ? existing : []).filter(
        (item) => item.dateKey !== record.dateKey
      );
      const updated = [record, ...filtered]
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
        .slice(0, 60);
      await safeStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch {
      return [record];
    }
  },

  async getLocalPasatiemposHistory(
    deviceUuid: string
  ): Promise<DailyPasatiemposRecord[]> {
    const key = `${PASATIEMPOS_HISTORY_KEY_PREFIX}${deviceUuid || 'local'}`;
    try {
      const raw = await safeStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async reportPasatiempoProgress(payload: PasatiempoProgressPayload) {
    const response = await apiClient.post('/telemetry/pasatiempos', payload);
    return response.data;
  },

  async getDevicePasatiemposHistory(
    deviceUuid: string,
    profileType: 'MENOR' | 'ADULTO',
    todayKey: string = getLocalDateKey()
  ): Promise<{
    todayRecord: DailyPasatiemposRecord;
    history: DailyPasatiemposRecord[];
    streakDays?: number;
    weeklyQuizAccuracyPct?: number;
  }> {
    const hasRealUuid =
      Boolean(deviceUuid) && deviceUuid !== 'local' && deviceUuid !== 'self';

    if (hasRealUuid) {
      try {
        const response = await apiClient.get(
          `/telemetry/pasatiempos/${encodeURIComponent(deviceUuid)}`,
          { params: { dateKey: todayKey } }
        );
        const payload = response.data?.data;
        const remoteSessions: BackendPasatiempoSessionDTO[] = Array.isArray(payload?.history)
          ? payload.history
          : Array.isArray(payload?.today)
            ? payload.today
            : [];

        const byDate = new Map<string, BackendPasatiempoSessionDTO[]>();
        for (const s of remoteSessions) {
          const list = byDate.get(s.dateKey) || [];
          list.push(s);
          byDate.set(s.dateKey, list);
        }

        const remoteHistory: DailyPasatiemposRecord[] = Array.from(byDate.entries())
          .map(([dKey, sessions]) =>
            hydrateDailyRecordFromSessions(deviceUuid, profileType, dKey, sessions)
          )
          .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

        // Sincronizar caché local con la fuente de verdad en PostgreSQL
        const cacheKey = `${PASATIEMPOS_HISTORY_KEY_PREFIX}${deviceUuid}`;
        await safeStorage
          .setItem(cacheKey, JSON.stringify(remoteHistory.slice(0, 60)))
          .catch(() => {});

        const todayRecord =
          remoteHistory.find((r) => r.dateKey === todayKey) ||
          createEmptyDailyPasatiemposRecord(deviceUuid, profileType, todayKey);

        return {
          todayRecord,
          history: remoteHistory,
          streakDays:
            typeof payload?.streakDays === 'number' ? payload.streakDays : undefined,
          weeklyQuizAccuracyPct:
            typeof payload?.weeklyQuizAccuracyPct === 'number'
              ? payload.weeklyQuizAccuracyPct
              : undefined,
        };
      } catch (err: any) {
        // Solo usar caché local si no hubo respuesta del servidor (sin red)
        if (err?.response) {
          throw err;
        }
      }
    }

    const localHistory = await this.getLocalPasatiemposHistory(deviceUuid);
    const todayRecord =
      localHistory.find((r) => r.dateKey === todayKey) ||
      createEmptyDailyPasatiemposRecord(deviceUuid, profileType, todayKey);

    return { todayRecord, history: localHistory };
  },

  // --------------------------------------------------------------------------
  // Uso diario de aplicaciones bloqueadas (100% PostgreSQL)
  // --------------------------------------------------------------------------
  async syncAppUsageSnapshot(
    deviceUuid: string,
    apps: AppUsageRawSnapshot[],
    dateKey: string = getLocalDateKey()
  ) {
    const response = await apiClient.post('/telemetry/app-usage', {
      deviceUuid,
      dateKey,
      apps: apps.map((a) => ({
        packageName: a.packageName || a.appName,
        appName: a.appName,
        usedMinutes: a.usedMinutes,
        dailyLimitMinutes: a.dailyLimitMinutes ?? null,
        isBlocked: Boolean(a.isBlocked),
      })),
    });

    const key = `${APP_USAGE_KEY_PREFIX}${deviceUuid || 'self'}_${dateKey}`;
    try {
      await safeStorage.setItem(key, JSON.stringify(apps));
    } catch {
      // Ignorar fallo de caché local tras persistencia exitosa
    }

    return response.data;
  },

  async getLocalAppUsageSnapshot(
    deviceUuid: string,
    dateKey: string = getLocalDateKey()
  ): Promise<AppUsageRawSnapshot[]> {
    const key = `${APP_USAGE_KEY_PREFIX}${deviceUuid || 'self'}_${dateKey}`;
    try {
      const raw = await safeStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  // --------------------------------------------------------------------------
  // Métricas consolidadas de Actividad (Responsable y Dispositivo Protegido)
  // --------------------------------------------------------------------------
  async getActivityOverview(
    dateKey: string = getLocalDateKey()
  ): Promise<ActivityOverviewResponse | null> {
    const response = await apiClient.get('/metrics/activity', {
      params: { dateKey },
    });
    return response.data?.data || null;
  },

  async getDeviceActivityMetrics(
    deviceUuid: string,
    dateKey: string = getLocalDateKey()
  ): Promise<DeviceActivityMetricsResponse | null> {
    const response = await apiClient.get(
      `/metrics/device/${encodeURIComponent(deviceUuid)}/activity`,
      { params: { dateKey } }
    );
    return response.data?.data || null;
  },

  // --------------------------------------------------------------------------
  // Geolocalización y Registro de Ubicación (Estrategia Híbrida GPS / IP)
  // --------------------------------------------------------------------------
  async saveUserLocation(locationData: LocationPayload) {
    const response = await apiClient.post('/auth/location', locationData);
    await safeStorage.setItem('@ba_protege_user_location', JSON.stringify(locationData));
    return response.data;
  },

  async getUserLocation() {
    const stored = await safeStorage.getItem('@ba_protege_user_location');
    return stored ? JSON.parse(stored) : null;
  },
};

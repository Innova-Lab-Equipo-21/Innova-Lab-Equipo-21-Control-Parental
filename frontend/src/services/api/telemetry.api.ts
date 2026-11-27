// ==============================================================================
// Proyecto: BA Protege+
// Componente: Telemetría, Eventos de Seguridad, Pasatiempos, Uso de Apps y Ubicación
// Archivo: src/services/api/telemetry.api.ts
// Descripción: Sincronización de heartbeats, intentos bloqueados, alertas de seguridad, pasatiempos y consumo de apps.
// ==============================================================================

import {
  BlockedAttemptRecord,
  BlockedItemType,
  inferBlockedItemType,
  normalizeAttemptSource,
} from '../../utils/activityMetrics';
import {
  AppUsageRawSnapshot,
} from '../../utils/appUsageMetrics';
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
    vpn: boolean;
    accessibility: boolean;
    notifications: boolean;
    batteryOptimization: boolean;
  };
}

export interface SecurityEventPayload {
  deviceUuid: string;
  eventType: string;
  description?: string;
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

export const telemetryApi = {
  // --------------------------------------------------------------------------
  // Telemetría y Heartbeat
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
    const localRecord: BlockedAttemptRecord = {
      id: `blocked-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      deviceId: data.deviceId || data.deviceUuid || 'self',
      deviceName: data.deviceName || 'Mi dispositivo',
      attemptedDomain: data.attemptedDomain.trim().toLowerCase(),
      sourceListType: normalizedSource,
      itemType: inferredItemType,
      blockedAt: data.blockedAt || new Date().toISOString(),
      count: 1,
    };

    try {
      const raw = await safeStorage.getItem(BLOCKED_EVENTS_STORAGE_KEY);
      const existing: BlockedAttemptRecord[] = raw ? JSON.parse(raw) : [];
      const updated = [localRecord, ...(Array.isArray(existing) ? existing : [])].slice(0, 500);
      await safeStorage.setItem(BLOCKED_EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Continuar incluso si falla almacenamiento local
    }

    try {
      const apiSource =
        inferredItemType === 'app'
          ? normalizedSource === 'LOTBA'
            ? 'LOTBA_APP'
            : 'CUSTOM_APP'
          : normalizedSource;

      const response = await apiClient.post(
        '/telemetry/events/blocked',
        {
          deviceUuid: data.deviceUuid,
          attemptedDomain: data.attemptedDomain,
          sourceListType: apiSource,
          itemType: inferredItemType.toUpperCase(),
        },
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      return { success: true, localOnly: true, data: localRecord };
    }
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
    const localRecord: SecurityEventOverviewItem = {
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      deviceId: data.deviceUuid,
      deviceName: 'Dispositivo protegido',
      eventType: data.eventType,
      description: data.description || '',
      occurredAt: new Date().toISOString(),
    };

    try {
      const raw = await safeStorage.getItem(SECURITY_EVENTS_STORAGE_KEY);
      const existing: SecurityEventOverviewItem[] = raw ? JSON.parse(raw) : [];
      const updated = [localRecord, ...(Array.isArray(existing) ? existing : [])].slice(0, 100);
      await safeStorage.setItem(SECURITY_EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Continuar incluso si falla almacenamiento local
    }

    try {
      const response = await apiClient.post('/telemetry/events/security', data);
      return response.data;
    } catch {
      return { success: true, localOnly: true, data: localRecord };
    }
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
    try {
      const response = await apiClient.patch(
        `/metrics/security-events/${encodeURIComponent(eventId)}/read`,
        {},
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      return { success: true, localOnly: true };
    }
  },

  // --------------------------------------------------------------------------
  // Pasatiempos: Persistencia local + sincronización backend
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
    try {
      const response = await apiClient.post('/telemetry/pasatiempos', payload, {
        timeout: 10000,
      });
      return response.data;
    } catch {
      return { success: true, localOnly: true };
    }
  },

  async getDevicePasatiemposHistory(
    deviceUuid: string,
    profileType: 'MENOR' | 'ADULTO',
    todayKey: string = getLocalDateKey()
  ): Promise<{
    todayRecord: DailyPasatiemposRecord;
    history: DailyPasatiemposRecord[];
  }> {
    const localHistory = await this.getLocalPasatiemposHistory(deviceUuid);
    let mergedHistory = [...localHistory];

    try {
      const response = await apiClient.get(
        `/telemetry/pasatiempos/${encodeURIComponent(deviceUuid)}`,
        {
          params: { dateKey: todayKey },
          timeout: 10000,
        }
      );
      const remoteSessions: BackendPasatiempoSessionDTO[] =
        response.data?.data?.history || response.data?.data?.today || [];

      if (Array.isArray(remoteSessions) && remoteSessions.length > 0) {
        const byDate = new Map<string, BackendPasatiempoSessionDTO[]>();
        for (const s of remoteSessions) {
          const list = byDate.get(s.dateKey) || [];
          list.push(s);
          byDate.set(s.dateKey, list);
        }

        const mergedByDate = new Map<string, DailyPasatiemposRecord>();
        for (const loc of localHistory) {
          mergedByDate.set(loc.dateKey, loc);
        }
        for (const [dKey, sessions] of byDate.entries()) {
          const remoteRec = hydrateDailyRecordFromSessions(
            deviceUuid,
            profileType,
            dKey,
            sessions
          );
          const localRec = mergedByDate.get(dKey);
          if (!localRec || remoteRec.updatedAt >= localRec.updatedAt) {
            mergedByDate.set(dKey, remoteRec);
          }
        }
        mergedHistory = Array.from(mergedByDate.values()).sort((a, b) =>
          b.dateKey.localeCompare(a.dateKey)
        );
      }
    } catch {
      // Operar offline con historial local
    }

    const todayRecord =
      mergedHistory.find((r) => r.dateKey === todayKey) ||
      createEmptyDailyPasatiemposRecord(deviceUuid, profileType, todayKey);

    return { todayRecord, history: mergedHistory };
  },

  // --------------------------------------------------------------------------
  // Uso diario de aplicaciones bloqueadas
  // --------------------------------------------------------------------------
  async syncAppUsageSnapshot(
    deviceUuid: string,
    apps: AppUsageRawSnapshot[],
    dateKey: string = getLocalDateKey()
  ) {
    const key = `${APP_USAGE_KEY_PREFIX}${deviceUuid || 'self'}_${dateKey}`;
    try {
      await safeStorage.setItem(key, JSON.stringify(apps));
    } catch {
      // Fallback silencioso
    }

    try {
      const response = await apiClient.post(
        '/telemetry/app-usage',
        {
          deviceUuid,
          dateKey,
          apps: apps.map((a) => ({
            packageName: a.packageName || a.appName,
            appName: a.appName,
            usedMinutes: a.usedMinutes,
            dailyLimitMinutes: a.dailyLimitMinutes ?? null,
            isBlocked: Boolean(a.isBlocked),
          })),
        },
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      return { success: true, localOnly: true, data: apps };
    }
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
    try {
      const response = await apiClient.get('/metrics/activity', {
        params: { dateKey },
        timeout: 12000,
      });
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  async getDeviceActivityMetrics(
    deviceUuid: string,
    dateKey: string = getLocalDateKey()
  ): Promise<{
    dateKey: string;
    deviceId: string;
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
  } | null> {
    try {
      const response = await apiClient.get(
        `/metrics/device/${encodeURIComponent(deviceUuid)}/activity`,
        {
          params: { dateKey },
          timeout: 12000,
        }
      );
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  // --------------------------------------------------------------------------
  // Geolocalización y Registro de Ubicación (Estrategia Híbrida GPS / IP)
  // --------------------------------------------------------------------------
  async saveUserLocation(locationData: LocationPayload) {
    await safeStorage.setItem('@ba_protege_user_location', JSON.stringify(locationData));
    try {
      const response = await apiClient.post('/auth/location', locationData);
      return response.data;
    } catch {
      return { success: true, localOnly: true, data: locationData };
    }
  },

  async getUserLocation() {
    const stored = await safeStorage.getItem('@ba_protege_user_location');
    return stored ? JSON.parse(stored) : null;
  },
};

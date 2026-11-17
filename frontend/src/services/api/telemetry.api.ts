// ==============================================================================
// Proyecto: BA Protege+
// Componente: Telemetría, Eventos de Seguridad y Ubicación (Telemetry API)
// Archivo: src/services/api/telemetry.api.ts
// ==============================================================================

import {
  BlockedAttemptRecord,
  normalizeAttemptSource,
} from '../../utils/activityMetrics';
import { apiClient, safeStorage } from './client';

const BLOCKED_EVENTS_STORAGE_KEY = '@ba_protege_blocked_events';

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

export const telemetryApi = {
  // --------------------------------------------------------------------------
  // Telemetría y Heartbeat
  // --------------------------------------------------------------------------
  async sendHeartbeat(data: HeartbeatPayload) {
    const response = await apiClient.post('/telemetry/heartbeat', data);
    return response.data;
  },

  async reportBlockedEvent(data: BlockedEventPayload) {
    const localRecord: BlockedAttemptRecord = {
      id: `blocked-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      deviceId: data.deviceId || data.deviceUuid || 'self',
      deviceName: data.deviceName || 'Mi dispositivo',
      attemptedDomain: data.attemptedDomain.trim().toLowerCase(),
      sourceListType: normalizeAttemptSource(data.sourceListType),
      blockedAt: data.blockedAt || new Date().toISOString(),
      count: 1,
    };

    try {
      const raw = await safeStorage.getItem(BLOCKED_EVENTS_STORAGE_KEY);
      const existing: BlockedAttemptRecord[] = raw ? JSON.parse(raw) : [];
      const updated = [localRecord, ...(Array.isArray(existing) ? existing : [])].slice(0, 500);
      await safeStorage.setItem(BLOCKED_EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      // Continuar incluso si falla almacenamiento local
    }

    try {
      const response = await apiClient.post(
        '/telemetry/events/blocked',
        {
          deviceUuid: data.deviceUuid,
          attemptedDomain: data.attemptedDomain,
          sourceListType: data.sourceListType,
        },
        { timeout: 600 }
      );
      return response.data;
    } catch (e) {
      return { success: true, localOnly: true, data: localRecord };
    }
  },

  async getBlockedEvents(): Promise<BlockedAttemptRecord[]> {
    try {
      const raw = await safeStorage.getItem(BLOCKED_EVENTS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  async clearBlockedEvents(): Promise<void> {
    await safeStorage.removeItem(BLOCKED_EVENTS_STORAGE_KEY);
  },

  async reportSecurityEvent(data: SecurityEventPayload) {
    const response = await apiClient.post('/telemetry/events/security', data);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // Geolocalización y Registro de Ubicación (Estrategia Híbrida GPS / IP)
  // --------------------------------------------------------------------------
  async saveUserLocation(locationData: LocationPayload) {
    await safeStorage.setItem('@ba_protege_user_location', JSON.stringify(locationData));
    try {
      const response = await apiClient.post('/auth/location', locationData);
      return response.data;
    } catch (e) {
      return { success: true, localOnly: true, data: locationData };
    }
  },

  async getUserLocation() {
    const stored = await safeStorage.getItem('@ba_protege_user_location');
    return stored ? JSON.parse(stored) : null;
  },
};

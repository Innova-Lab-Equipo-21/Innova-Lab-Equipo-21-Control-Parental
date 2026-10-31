// ==============================================================================
// Proyecto: BA Protege+
// Componente: Telemetría, Eventos de Seguridad y Ubicación (Telemetry API)
// Archivo: src/services/api/telemetry.api.ts
// ==============================================================================

import { apiClient, safeStorage } from './client';

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
  attemptedDomain: string;
  sourceListType?: string;
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
    const response = await apiClient.post('/telemetry/events/blocked', data);
    return response.data;
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

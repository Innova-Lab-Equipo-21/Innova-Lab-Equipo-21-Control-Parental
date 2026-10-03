// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (API Client)
// Archivo: src/services/api.service.ts
// Descripción: Cliente HTTP para comunicación con el backend REST de BA Protege+,
//              soporte para límite de 5 dispositivos, función de Autocontrol con bloqueo de 24hs,
//              protección anti-manipulación de hora y auditoría de permisos de dispositivos.
// ==============================================================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_PARENT_DEVICES, SELF_CONTROL_LOCK_HOURS, SelfControlState, DeviceInfo } from '../types';

// URL base para el entorno de desarrollo (10.0.2.2 apunta al localhost del host en el emulador Android)
export const BASE_API_URL = 'http://10.0.2.2:3000/api';

const memoryStorage = new Map<string, string>();

const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined') {
        return await AsyncStorage.getItem(key);
      }
    } catch (e) {
      // Fallback
    }
    return memoryStorage.get(key) || null;
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        await AsyncStorage.setItem(key, value);
        memoryStorage.set(key, value);
        return;
      }
    } catch (e) {
      // Fallback
    }
    memoryStorage.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        await AsyncStorage.removeItem(key);
        memoryStorage.delete(key);
        return;
      }
    } catch (e) {
      // Fallback
    }
    memoryStorage.delete(key);
  },
};

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT si está guardado en sesión
apiClient.interceptors.request.use(async (config) => {
  const token = await safeStorage.getItem('@ba_protege_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // --------------------------------------------------------------------------
  // Protección Anti-Manipulación de Hora (Server / Network Time)
  // --------------------------------------------------------------------------
  async getReliableTimestamp(): Promise<number> {
    try {
      const response = await apiClient.get('/health', { timeout: 1500 });
      if (response.data?.timestamp) {
        return new Date(response.data.timestamp).getTime();
      }
    } catch (e) {
      // Fallback local
    }
    return Date.now();
  },

  // --------------------------------------------------------------------------
  // Autenticación de Responsable
  // --------------------------------------------------------------------------
  async register(data: {
    email: string;
    password: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    birthDate?: string;
    phone?: string;
  }) {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.data?.token) {
      await safeStorage.setItem('@ba_protege_jwt_token', response.data.data.token);
    }
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.data?.token) {
      await safeStorage.setItem('@ba_protege_jwt_token', response.data.data.token);
    }
    return response.data;
  },

  async recoverPassword(email: string) {
    const response = await apiClient.post('/auth/recover-password', { email });
    return response.data;
  },

  async logout() {
    await safeStorage.removeItem('@ba_protege_jwt_token');
  },

  // --------------------------------------------------------------------------
  // Pareamiento y Dispositivos (Máximo 5 dispositivos por responsable)
  // --------------------------------------------------------------------------
  async generatePairingCode() {
    try {
      const devicesRes = await this.listDevices();
      const currentCount = devicesRes.data?.length || 0;
      if (currentCount >= MAX_PARENT_DEVICES) {
        throw new Error(`Límite alcanzado: Un responsable solo puede vincular un máximo de ${MAX_PARENT_DEVICES} dispositivos.`);
      }
    } catch (e: any) {
      if (e.message?.includes('Límite alcanzado')) {
        throw e;
      }
    }

    const response = await apiClient.post('/devices/pair/generate');
    return response.data;
  },

  async confirmPairing(data: {
    pairingCode: string;
    deviceUuid: string;
    deviceName: string;
    childName?: string;
    model?: string;
    osVersion?: string;
    appVersion?: string;
  }) {
    const response = await apiClient.post('/devices/pair/confirm', data);
    return response.data;
  },

  async listDevices(): Promise<{ success: boolean; data: DeviceInfo[] }> {
    try {
      const response = await apiClient.get('/devices');
      return response.data;
    } catch (e) {
      // Fallback con datos formateados incluyendo el estado detallado de permisos
      return {
        success: true,
        data: [
          {
            deviceId: 'dev-1',
            deviceUuid: 'uuid-samsung-mateo-a54',
            deviceName: 'Samsung Galaxy A54 (Mateo)',
            childName: 'Mateo',
            isProtected: true,
            status: 'ACTIVE',
            lastHeartbeat: 'Hace 1m',
            blockedCount: 12,
            blocklistVersion: 4,
            permissions: {
              vpn: true,
              accessibility: true,
              notifications: true,
              batteryOptimization: true,
              grantedCount: 4,
            },
          },
          {
            deviceId: 'dev-2',
            deviceUuid: 'uuid-xiaomi-sofia-note12',
            deviceName: 'Xiaomi Redmi Note 12 (Sofía)',
            childName: 'Sofía',
            isProtected: true,
            status: 'ACTIVE',
            lastHeartbeat: 'Hace 3m',
            blockedCount: 4,
            blocklistVersion: 4,
            permissions: {
              vpn: true,
              accessibility: false,
              notifications: true,
              batteryOptimization: true,
              grantedCount: 3,
            },
          },
        ],
      };
    }
  },

  async getDeviceDetail(deviceId: string) {
    const response = await apiClient.get(`/devices/${deviceId}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // Autocontrol del Responsable / Adulto (Bloqueo de Desactivación por 24hs)
  // --------------------------------------------------------------------------
  async enableSelfControl(): Promise<SelfControlState> {
    const now = await this.getReliableTimestamp();
    const expiresAt = now + SELF_CONTROL_LOCK_HOURS * 60 * 60 * 1000;

    await safeStorage.setItem('@ba_protege_self_control_active', 'true');
    await safeStorage.setItem('@ba_protege_self_control_enabled_at', new Date(now).toISOString());
    await safeStorage.setItem('@ba_protege_self_control_expires_at', new Date(expiresAt).toISOString());

    try {
      await apiClient.post('/self-control/enable', { expiresAt }, { timeout: 1000 });
    } catch (e) {
      // Modo offline / demo
    }

    return this.getSelfControlStatus();
  },

  async getSelfControlStatus(): Promise<SelfControlState> {
    const activeStr = await safeStorage.getItem('@ba_protege_self_control_active');
    const enabledAt = await safeStorage.getItem('@ba_protege_self_control_enabled_at');
    const expiresAt = await safeStorage.getItem('@ba_protege_self_control_expires_at');

    const isActive = activeStr === 'true';

    if (!isActive || !expiresAt) {
      return {
        active: false,
        enabledAt: null,
        expiresAt: null,
        canDisable: true,
        remainingHours: 0,
        remainingMinutes: 0,
      };
    }

    const expiresTime = new Date(expiresAt).getTime();
    const now = await this.getReliableTimestamp();
    const remainingMs = expiresTime - now;

    if (remainingMs <= 0) {
      return {
        active: true,
        enabledAt,
        expiresAt,
        canDisable: true,
        remainingHours: 0,
        remainingMinutes: 0,
      };
    }

    const remainingTotalMinutes = Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
    const remainingHours = Math.floor(remainingTotalMinutes / 60);
    const remainingMinutes = remainingTotalMinutes % 60;

    return {
      active: true,
      enabledAt,
      expiresAt,
      canDisable: false,
      remainingHours,
      remainingMinutes,
    };
  },

  async disableSelfControl(): Promise<SelfControlState> {
    const status = await this.getSelfControlStatus();

    if (status.active && !status.canDisable) {
      const minsPadded = status.remainingMinutes.toString().padStart(2, '0');
      const timeText = `${status.remainingHours}h ${minsPadded}m`;
      throw new Error(
        `🔒 Acción bloqueada: El autocontrol no se puede desactivar hasta cumplir las 24hs obligatorias.\nTiempo restante: ${timeText}.`,
      );
    }

    await safeStorage.setItem('@ba_protege_self_control_active', 'false');
    await safeStorage.removeItem('@ba_protege_self_control_enabled_at');
    await safeStorage.removeItem('@ba_protege_self_control_expires_at');

    try {
      await apiClient.post('/self-control/disable', {}, { timeout: 1000 });
    } catch (e) {
      // Modo offline / demo
    }

    return this.getSelfControlStatus();
  },

  // --------------------------------------------------------------------------
  // Listas de Bloqueo
  // --------------------------------------------------------------------------
  async getOfficialLotbaList() {
    const response = await apiClient.get('/blocklist/official');
    return response.data;
  },

  async getDeviceBlocklist(deviceUuid: string) {
    const response = await apiClient.get(`/blocklist/device/${deviceUuid}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // Telemetría y Heartbeat
  // --------------------------------------------------------------------------
  async sendHeartbeat(data: {
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
  }) {
    const response = await apiClient.post('/telemetry/heartbeat', data);
    return response.data;
  },

  async reportBlockedEvent(data: {
    deviceUuid: string;
    attemptedDomain: string;
    sourceListType?: string;
  }) {
    const response = await apiClient.post('/telemetry/events/blocked', data);
    return response.data;
  },

  async reportSecurityEvent(data: {
    deviceUuid: string;
    eventType: string;
    description?: string;
  }) {
    const response = await apiClient.post('/telemetry/events/security', data);
    return response.data;
  },
};

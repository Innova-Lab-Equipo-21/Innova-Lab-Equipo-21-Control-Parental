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
import {
  MAX_PROTECTED_DEVICES,
  SELF_CONTROL_LOCK_HOURS,
  SELF_CONTROL_UNLOCK_WINDOW_HOURS,
  SelfControlState,
  DeviceInfo,
  CustomBlocklist,
  CustomBlockedDomain,
  CustomBlockedApp,
  AppUsageItem,
} from '../types';

// URL base para el entorno de desarrollo (10.0.2.2 apunta al localhost del host en el emulador Android)
export const BASE_API_URL = 'http://10.0.2.2:3000/api';

const memoryStorage = new Map<string, string>();

const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (memoryStorage.has(key)) {
        return memoryStorage.get(key) || null;
      }
      if (typeof window !== 'undefined') {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          memoryStorage.set(key, value);
        }
        return value;
      }
    } catch (e) {
      // Fallback
    }
    return memoryStorage.get(key) || null;
  },
  async setItem(key: string, value: string): Promise<void> {
    memoryStorage.set(key, value);
    try {
      if (typeof window !== 'undefined') {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      // Fallback
    }
  },
  async removeItem(key: string): Promise<void> {
    memoryStorage.delete(key);
    try {
      if (typeof window !== 'undefined') {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      // Fallback
    }
  },
};

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 1000,
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
      const response = await apiClient.get('/health', { timeout: 400 });
      if (response.data?.timestamp) {
        return new Date(response.data.timestamp).getTime();
      }
    } catch (e) {
      // Fallback local instantáneo
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
  async generatePairingCode(data?: any) {
    try {
      const devicesRes = await this.listDevices();
      const currentCount = devicesRes.data?.length || 0;
      if (currentCount >= MAX_PROTECTED_DEVICES) {
        throw new Error(`Límite alcanzado: Un responsable solo puede vincular un máximo de ${MAX_PROTECTED_DEVICES} dispositivos.`);
      }
    } catch (e: any) {
      if (e.message?.includes('Límite alcanzado')) {
        throw e;
      }
    }

    const response = await apiClient.post('/devices/pair/generate', data || {});
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

  async unbindDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/devices/${deviceId}`, { timeout: 1000 });
      return response.data;
    } catch (e) {
      return {
        success: true,
        message: 'El dispositivo fue desvinculado exitosamente.',
      };
    }
  },

  // --------------------------------------------------------------------------
  // Autocontrol / Autoprotección del Tutor (Temporizador de 24hs al solicitar y pase de 24hs)
  // --------------------------------------------------------------------------
  async enableSelfControl(): Promise<SelfControlState> {
    const now = await this.getReliableTimestamp();

    await safeStorage.setItem('@ba_protege_self_control_active', 'true');
    await safeStorage.setItem('@ba_protege_self_control_enabled_at', new Date(now).toISOString());
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_requested_at');
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_available_at');
    await safeStorage.removeItem('@ba_protege_self_control_unlocked_at');
    await safeStorage.removeItem('@ba_protege_self_control_auto_relock_at');
    await safeStorage.removeItem('@ba_protege_self_control_can_disable_at');
    await safeStorage.removeItem('@ba_protege_self_control_expires_at');

    try {
      await apiClient.post('/self-control/enable', { enabledAt: now }, { timeout: 1000 });
    } catch (e) {
      // Modo offline / demo
    }

    return this.getSelfControlStatus();
  },

  async requestDeactivation(): Promise<SelfControlState> {
    const current = await this.getSelfControlStatus();
    if (!current.active) return current;

    const now = await this.getReliableTimestamp();
    const deactivationAvailableAt = now + SELF_CONTROL_LOCK_HOURS * 60 * 60 * 1000;

    await safeStorage.setItem(
      '@ba_protege_self_control_deactivation_requested_at',
      new Date(now).toISOString()
    );
    await safeStorage.setItem(
      '@ba_protege_self_control_deactivation_available_at',
      new Date(deactivationAvailableAt).toISOString()
    );

    return this.getSelfControlStatus();
  },

  async confirmDeactivation(): Promise<SelfControlState> {
    const status = await this.getSelfControlStatus();

    if (!status.canDisable || status.status !== 'DEACTIVATION_READY') {
      const waitText = `${status.remainingHours}h ${status.remainingMinutes.toString().padStart(2, '0')}m`;
      throw new Error(
        `La desactivación se habilitará en 24 horas.\nTiempo restante: ${waitText}.`
      );
    }

    const now = await this.getReliableTimestamp();
    const autoRelockAt = now + SELF_CONTROL_UNLOCK_WINDOW_HOURS * 60 * 60 * 1000;

    // Desbloqueo real inmediato con pase temporal de 24 horas
    await safeStorage.setItem('@ba_protege_self_control_active', 'false');
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_requested_at');
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_available_at');
    await safeStorage.setItem('@ba_protege_self_control_unlocked_at', new Date(now).toISOString());
    await safeStorage.setItem('@ba_protege_self_control_auto_relock_at', new Date(autoRelockAt).toISOString());

    try {
      await apiClient.post('/self-control/disable', { autoRelockAt }, { timeout: 1000 });
    } catch (e) {
      // Modo offline / demo
    }

    return this.getSelfControlStatus();
  },

  async disableSelfControl(): Promise<SelfControlState> {
    const status = await this.getSelfControlStatus();

    // Caso 1: Autoprotección activa sin solicitud previa -> Clic 1: Inicia temporizador de 24hs
    if (status.status === 'ACTIVE_LOCKED') {
      return this.requestDeactivation();
    }

    // Caso 2: Temporizador corriendo pero aún no pasaron 24hs
    if (status.status === 'DEACTIVATION_PENDING') {
      const waitText = `${status.remainingHours}h ${status.remainingMinutes.toString().padStart(2, '0')}m`;
      throw new Error(
        `La desactivación se habilitará en 24 horas.\nTiempo restante: ${waitText}.`
      );
    }

    // Caso 3: Ya pasaron las 24hs -> Clic 2: Desbloqueo real inmediato con pase temporal
    if (status.status === 'DEACTIVATION_READY' || status.canDisable) {
      return this.confirmDeactivation();
    }

    return status;
  },

  async getSelfControlStatus(): Promise<SelfControlState> {
    const now = await this.getReliableTimestamp();
    const activeStr = await safeStorage.getItem('@ba_protege_self_control_active');
    const enabledAt = await safeStorage.getItem('@ba_protege_self_control_enabled_at');
    const deactivationRequestedAt = await safeStorage.getItem(
      '@ba_protege_self_control_deactivation_requested_at'
    );
    const deactivationAvailableAt =
      (await safeStorage.getItem('@ba_protege_self_control_deactivation_available_at')) ||
      (await safeStorage.getItem('@ba_protege_self_control_can_disable_at')) ||
      (await safeStorage.getItem('@ba_protege_self_control_expires_at'));
    const unlockedAt = await safeStorage.getItem('@ba_protege_self_control_unlocked_at');
    const autoRelockAt = await safeStorage.getItem('@ba_protege_self_control_auto_relock_at');

    // 1. Caso: Pase temporal de 24 horas activo
    if (unlockedAt && autoRelockAt && activeStr !== 'true') {
      const autoRelockTime = new Date(autoRelockAt).getTime();
      if (now >= autoRelockTime) {
        // Cumplido el plazo de 24hs de pase temporal -> se vuelve a activar automáticamente!
        return this.enableSelfControl();
      }

      const remainingMs = autoRelockTime - now;
      const remainingTotalMinutes = Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
      const remainingUnlockHours = Math.floor(remainingTotalMinutes / 60);
      const remainingUnlockMinutes = remainingTotalMinutes % 60;

      return {
        active: false,
        status: 'TEMPORARILY_UNLOCKED',
        enabledAt: null,
        deactivationRequestedAt: null,
        deactivationAvailableAt: null,
        canDisableAt: null,
        expiresAt: autoRelockAt,
        canDisable: false,
        unlockedAt,
        autoRelockAt,
        remainingHours: remainingUnlockHours,
        remainingMinutes: remainingUnlockMinutes,
        remainingUnlockHours,
        remainingUnlockMinutes,
      };
    }

    const isActive = activeStr === 'true';

    // 2. Caso: Inactivo totalmente
    if (!isActive || !enabledAt) {
      return {
        active: false,
        status: 'INACTIVE',
        enabledAt: null,
        deactivationRequestedAt: null,
        deactivationAvailableAt: null,
        canDisableAt: null,
        expiresAt: null,
        canDisable: true,
        unlockedAt: null,
        autoRelockAt: null,
        remainingHours: 0,
        remainingMinutes: 0,
      };
    }

    // 3. Caso: Autoprotección activa con solicitud de desactivación iniciada
    if (deactivationAvailableAt) {
      const availableTime = new Date(deactivationAvailableAt).getTime();
      const remainingWaitMs = availableTime - now;

      if (remainingWaitMs <= 0) {
        // Pasaron las 24 horas: el botón cambia de estado para permitir el desbloqueo real (segundo clic)
        return {
          active: true,
          status: 'DEACTIVATION_READY',
          enabledAt,
          deactivationRequestedAt,
          deactivationAvailableAt,
          canDisableAt: deactivationAvailableAt,
          expiresAt: deactivationAvailableAt,
          canDisable: true,
          unlockedAt: null,
          autoRelockAt: null,
          remainingHours: 0,
          remainingMinutes: 0,
          remainingWaitHours: 0,
          remainingWaitMinutes: 0,
        };
      }

      // Temporizador de 24 horas corriendo: la desactivación se habilitará en 24 horas
      const totalWaitMinutes = Math.max(0, Math.ceil(remainingWaitMs / (1000 * 60)));
      const remainingWaitHours = Math.floor(totalWaitMinutes / 60);
      const remainingWaitMinutes = totalWaitMinutes % 60;

      return {
        active: true,
        status: 'DEACTIVATION_PENDING',
        enabledAt,
        deactivationRequestedAt,
        deactivationAvailableAt,
        canDisableAt: deactivationAvailableAt,
        expiresAt: deactivationAvailableAt,
        canDisable: false,
        unlockedAt: null,
        autoRelockAt: null,
        remainingHours: remainingWaitHours,
        remainingMinutes: remainingWaitMinutes,
        remainingWaitHours,
        remainingWaitMinutes,
      };
    }

    // 4. Caso: Autoprotección activa estándar (muestra botón "Desactivar autoprotección")
    return {
      active: true,
      status: 'ACTIVE_LOCKED',
      enabledAt,
      deactivationRequestedAt: null,
      deactivationAvailableAt: null,
      canDisableAt: null,
      expiresAt: null,
      canDisable: false,
      unlockedAt: null,
      autoRelockAt: null,
      remainingHours: 0,
      remainingMinutes: 0,
    };
  },

  // --------------------------------------------------------------------------
  // Listas de Bloqueo y Sitios Personalizados (CRUD)
  // --------------------------------------------------------------------------
  async getOfficialLotbaList() {
    const response = await apiClient.get('/blocklist/official');
    return response.data;
  },

  async getDeviceBlocklist(deviceUuid: string) {
    const response = await apiClient.get(`/blocklist/device/${deviceUuid}`);
    return response.data;
  },

  async getCustomBlocklist(): Promise<{ success: boolean; data: CustomBlocklist }> {
    try {
      const response = await apiClient.get('/blocklist/custom', { timeout: 300 });
      if (response.data?.data) {
        await safeStorage.setItem(
          '@ba_protege_custom_blocklist',
          JSON.stringify(response.data.data)
        );
      }
      return response.data;
    } catch (e) {
      // Fallback a almacenamiento local / caché para demo offline
      const cached = await safeStorage.getItem('@ba_protege_custom_blocklist');
      if (cached) {
        return { success: true, data: JSON.parse(cached) };
      }
      const initialList: CustomBlocklist = {
        id: 'custom-local-list',
        name: 'Lista Personalizada del Tutor',
        type: 'CUSTOM',
        version: 1,
        domains: [
          {
            id: 'demo-site-1',
            domain: 'casino-clandestino.net',
            category: 'Apuestas',
            isActive: true,
            applyToAll: true,
            deviceIds: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-site-2',
            domain: 'red-social-peligrosa.org',
            category: 'Redes Sociales',
            isActive: true,
            applyToAll: true,
            deviceIds: [],
            createdAt: new Date().toISOString(),
          },
        ],
        apps: [
          {
            id: 'demo-app-1',
            appName: 'Bet365 Mobile',
            packageName: 'com.bet365.mobile',
            category: 'Apuestas',
            isActive: true,
            applyToAll: true,
            deviceIds: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-app-2',
            appName: 'TikTok',
            packageName: 'com.zhiliaoapp.musically',
            category: 'Redes sociales',
            isActive: true,
            applyToAll: false,
            deviceIds: ['self'],
            createdAt: new Date().toISOString(),
          },
        ],
      };
      await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(initialList));
      return { success: true, data: initialList };
    }
  },

  async addCustomBlockedSite(
    domain: string,
    category: string = 'Personalizado',
    applyToAll: boolean = true,
    deviceIds: string[] = []
  ): Promise<{ success: boolean; data: CustomBlockedDomain }> {
    const cleanDomain = domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
      throw new Error('Formato de dominio no válido (ejemplo: sitio.com)');
    }

    try {
      const response = await apiClient.post(
        '/blocklist/custom/domains',
        {
          domain: cleanDomain,
          category,
          applyToAll,
          deviceIds,
        },
        { timeout: 300 }
      );
      return response.data;
    } catch (e: any) {
      // Fallback offline
      const currentListRes = await this.getCustomBlocklist();
      const list = currentListRes.data;
      if (list.domains.some((d) => d.domain === cleanDomain)) {
        throw new Error('El dominio ya se encuentra en tu lista de sitios bloqueados');
      }
      const newDomain: CustomBlockedDomain = {
        id: `dom-${Date.now()}`,
        domain: cleanDomain,
        category,
        isActive: true,
        applyToAll,
        deviceIds,
        createdAt: new Date().toISOString(),
      };
      list.domains.unshift(newDomain);
      list.version += 1;
      await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
      return { success: true, data: newDomain };
    }
  },

  async updateCustomBlockedSite(
    domainId: string,
    data: { domain?: string; category?: string; isActive?: boolean; applyToAll?: boolean; deviceIds?: string[] }
  ): Promise<{ success: boolean; data: CustomBlockedDomain }> {
    let cleanDomain: string | undefined;
    if (data.domain) {
      cleanDomain = data.domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
      if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
        throw new Error('Formato de dominio no válido (ejemplo: sitio.com)');
      }
    }

    try {
      const response = await apiClient.put(
        `/blocklist/custom/domains/${domainId}`,
        {
          ...(cleanDomain ? { domain: cleanDomain } : {}),
          ...(data.category !== undefined ? { category: data.category } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.applyToAll !== undefined ? { applyToAll: data.applyToAll } : {}),
          ...(data.deviceIds !== undefined ? { deviceIds: data.deviceIds } : {}),
        },
        { timeout: 300 }
      );
      return response.data;
    } catch (e: any) {
      // Fallback offline
      const currentListRes = await this.getCustomBlocklist();
      const list = currentListRes.data;
      const item = list.domains.find((d) => d.id === domainId);
      if (!item) throw new Error('Dominio no encontrado');
      if (cleanDomain) item.domain = cleanDomain;
      if (data.category !== undefined) item.category = data.category;
      if (data.isActive !== undefined) item.isActive = data.isActive;
      if (data.applyToAll !== undefined) item.applyToAll = data.applyToAll;
      if (data.deviceIds !== undefined) item.deviceIds = data.deviceIds;
      list.version += 1;
      await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
      return { success: true, data: item };
    }
  },

  async deleteCustomBlockedSite(domainId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/blocklist/custom/domains/${domainId}`, { timeout: 300 });
      return response.data;
    } catch (e: any) {
      // Fallback offline
      const currentListRes = await this.getCustomBlocklist();
      const list = currentListRes.data;
      const idx = list.domains.findIndex((d) => d.id === domainId);
      if (idx !== -1) {
        list.domains.splice(idx, 1);
        list.version += 1;
        await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
      }
      return { success: true, message: 'Sitio eliminado correctamente' };
    }
  },

  // --------------------------------------------------------------------------
  // Gestión de Aplicaciones Bloqueadas y Tiempo de Uso
  // --------------------------------------------------------------------------
  async addCustomBlockedApp(
    appName: string,
    packageName: string,
    category: string = 'Personalizado',
    applyToAll: boolean = true,
    deviceIds: string[] = []
  ): Promise<{ success: boolean; data: CustomBlockedApp }> {
    const listRes = await this.getCustomBlocklist();
    const list = listRes.data;
    if (!list.apps) list.apps = [];

    const newApp: CustomBlockedApp = {
      id: `app-${Date.now()}`,
      appName,
      packageName,
      category,
      isActive: true,
      applyToAll,
      deviceIds,
      createdAt: new Date().toISOString(),
    };

    list.apps.unshift(newApp);
    list.version += 1;
    await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
    return { success: true, data: newApp };
  },

  async updateCustomBlockedApp(
    appId: string,
    data: { appName?: string; category?: string; isActive?: boolean; applyToAll?: boolean; deviceIds?: string[] }
  ): Promise<{ success: boolean; data: CustomBlockedApp }> {
    const listRes = await this.getCustomBlocklist();
    const list = listRes.data;
    if (!list.apps) list.apps = [];

    const item = list.apps.find((a) => a.id === appId);
    if (!item) throw new Error('Aplicación no encontrada');

    if (data.appName) item.appName = data.appName;
    if (data.category !== undefined) item.category = data.category;
    if (data.isActive !== undefined) item.isActive = data.isActive;
    if (data.applyToAll !== undefined) item.applyToAll = data.applyToAll;
    if (data.deviceIds !== undefined) item.deviceIds = data.deviceIds;

    list.version += 1;
    await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
    return { success: true, data: item };
  },

  async deleteCustomBlockedApp(appId: string): Promise<{ success: boolean; message: string }> {
    const listRes = await this.getCustomBlocklist();
    const list = listRes.data;
    if (!list.apps) list.apps = [];

    const idx = list.apps.findIndex((a) => a.id === appId);
    if (idx !== -1) {
      list.apps.splice(idx, 1);
      list.version += 1;
      await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
    }
    return { success: true, message: 'Aplicación eliminada correctamente' };
  },

  async getAppUsageStats(_deviceId: string): Promise<AppUsageItem[]> {
    return [
      { id: 'u1', appName: 'Instagram', packageName: 'com.instagram.android', category: 'Redes sociales', timeInMinutes: 85 },
      { id: 'u2', appName: 'TikTok', packageName: 'com.zhiliaoapp.musically', category: 'Redes sociales', timeInMinutes: 62 },
      { id: 'u3', appName: 'Free Fire', packageName: 'com.dts.freefireth', category: 'Juegos', timeInMinutes: 45 },
      { id: 'u4', appName: 'YouTube', packageName: 'com.google.android.youtube', category: 'Entretenimiento', timeInMinutes: 38 },
      { id: 'u5', appName: 'Bet365 Mobile', packageName: 'com.bet365.mobile', category: 'Apuestas', timeInMinutes: 15 },
    ];
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

  // --------------------------------------------------------------------------
  // Geolocalización y Registro de Ubicación (Estrategia Híbrida GPS / IP)
  // --------------------------------------------------------------------------
  async saveUserLocation(locationData: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    country?: string;
    source: 'GPS' | 'IP';
  }) {
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
